-- Surveyor 3 authored chapter. No player data is reset.
-- Explicit checkpoints preserve fixed XP amounts and all existing ownership locks.
ALTER TABLE public.mission_scene_catalog ADD COLUMN reward_milestone text
  CHECK (reward_milestone IN ('introduction','activity','discovery'));
CREATE UNIQUE INDEX mission_scene_reward_once ON public.mission_scene_catalog(mission_id,reward_milestone)
  WHERE reward_milestone IS NOT NULL;
ALTER TABLE public.mission_scene_catalog ADD CONSTRAINT discovery_reward_kind
  CHECK (reward_milestone IS DISTINCT FROM 'discovery' OR kind = 'discovery');
ALTER TABLE public.mission_scene_catalog ADD CONSTRAINT no_ending_reward
  CHECK (kind <> 'ending' OR reward_milestone IS NULL);

-- Chapters with no explicit mapping retain their existing first-kind policy.
CREATE FUNCTION public.chapter_reward_scene(p_mission_id text,p_milestone text)
RETURNS text LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT scene_id FROM public.mission_scene_catalog c
  WHERE c.mission_id = p_mission_id AND
    CASE WHEN EXISTS (SELECT 1 FROM public.mission_scene_catalog x
      WHERE x.mission_id = p_mission_id AND x.reward_milestone IS NOT NULL)
    THEN c.reward_milestone = p_milestone
    ELSE c.kind = CASE p_milestone WHEN 'introduction' THEN 'story' ELSE p_milestone END END
  ORDER BY position LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.chapter_reward_scene(text,text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.rpc_save_checkpoint(p_mission_id text, p_checkpoint_id text, p_completed_checkpoint_id text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_progress public.mission_progress%ROWTYPE;
  v_target public.mission_scene_catalog%ROWTYPE;
  v_completed public.mission_scene_catalog%ROWTYPE;
  v_scene public.mission_scene_catalog%ROWTYPE;
  v_frontier integer;
  v_kind text;
  v_milestone text;
BEGIN
  IF v_uid IS NULL OR coalesce((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'unauthenticated: A registered explorer is required';
  END IF;
  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not-found: Create your explorer profile first'; END IF;
  SELECT * INTO v_target FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND scene_id = p_checkpoint_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid-input: Unknown chapter checkpoint'; END IF;
  -- Fail closed for an unpublished/incomplete manifest.
  IF NOT EXISTS (SELECT 1 FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = 'ending')
    OR NOT EXISTS (SELECT 1 FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = 'activity')
    OR NOT EXISTS (SELECT 1 FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = 'discovery')
    OR (SELECT kind FROM public.mission_scene_catalog WHERE mission_id = p_mission_id ORDER BY position LIMIT 1) <> 'story'
    OR (SELECT kind FROM public.mission_scene_catalog WHERE mission_id = p_mission_id ORDER BY position DESC LIMIT 1) <> 'ending'
    OR (SELECT count(*) FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = 'ending') <> 1 THEN
    RAISE EXCEPTION 'unavailable: This chapter is not published';
  END IF;
  PERFORM set_config('nova.trusted_context','true',true);
  INSERT INTO public.mission_progress(user_id,mission_id,status,current_checkpoint_id)
    VALUES(v_uid,p_mission_id,'in_progress',p_checkpoint_id) ON CONFLICT(user_id,mission_id) DO NOTHING;
  SELECT * INTO v_progress FROM public.mission_progress WHERE user_id = v_uid AND mission_id = p_mission_id FOR UPDATE;
  SELECT min(position) INTO v_frontier FROM public.mission_scene_catalog
    WHERE mission_id = p_mission_id AND NOT (scene_id = ANY(v_progress.completed_checkpoint_ids));
  IF p_completed_checkpoint_id IS NOT NULL THEN
    SELECT * INTO v_completed FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND scene_id = p_completed_checkpoint_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'invalid-input: Unknown completed checkpoint'; END IF;
    IF NOT (p_completed_checkpoint_id = ANY(v_progress.completed_checkpoint_ids)) THEN
      IF v_completed.position <> v_frontier THEN RAISE EXCEPTION 'conflict: Finish earlier scenes first'; END IF;
      v_progress.completed_checkpoint_ids := array_append(v_progress.completed_checkpoint_ids,p_completed_checkpoint_id);
    END IF;
  END IF;
  SELECT min(position) INTO v_frontier FROM public.mission_scene_catalog
    WHERE mission_id = p_mission_id AND NOT (scene_id = ANY(v_progress.completed_checkpoint_ids));
  IF v_frontier IS NOT NULL AND v_target.position > v_frontier THEN
    RAISE EXCEPTION 'conflict: That checkpoint is still locked';
  END IF;
  IF v_progress.status <> 'completed' THEN
    UPDATE public.mission_progress SET current_checkpoint_id = p_checkpoint_id,
      completed_checkpoint_ids = v_progress.completed_checkpoint_ids, updated_at = now()
      WHERE user_id = v_uid AND mission_id = p_mission_id RETURNING * INTO v_progress;
  END IF;
  -- Repair missing earlier outcomes as well as the current one, atomically.
  FOREACH v_kind IN ARRAY ARRAY['story','activity','discovery'] LOOP
    SELECT * INTO v_scene FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND scene_id = public.chapter_reward_scene(p_mission_id, CASE v_kind WHEN 'story' THEN 'introduction' ELSE v_kind END);
    IF v_scene.scene_id = ANY(v_progress.completed_checkpoint_ids) THEN
      v_milestone := CASE v_kind WHEN 'story' THEN 'introduction' ELSE v_kind END;
      PERFORM public.rpc_grant_milestone(p_mission_id,v_milestone);
    END IF;
  END LOOP;
  FOR v_scene IN SELECT * FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = 'discovery'
    AND scene_id = ANY(v_progress.completed_checkpoint_ids) LOOP
    PERFORM public.rpc_unlock_discovery(p_mission_id,v_scene.discovery_id);
  END LOOP;
  IF v_frontier IS NULL THEN
    RETURN public.rpc_complete_mission(p_mission_id)->'progress';
  END IF;
  RETURN jsonb_build_object('missionId',v_progress.mission_id,'status',v_progress.status,
    'currentCheckpointId',v_progress.current_checkpoint_id,'completedCheckpointIds',v_progress.completed_checkpoint_ids,
    'completedAt',v_progress.completed_at,'updatedAt',v_progress.updated_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_grant_milestone(p_mission_id text,p_milestone_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_xp integer;
  v_event public.xp_reward_events%ROWTYPE;
  v_total integer;
  v_new boolean;
BEGIN
  IF v_uid IS NULL OR coalesce((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'unauthenticated: A registered explorer is required';
  END IF;
  v_xp := CASE p_milestone_id WHEN 'introduction' THEN 20 WHEN 'activity' THEN 40
    WHEN 'discovery' THEN 25 WHEN 'legacy' THEN 15 END;
  IF v_xp IS NULL OR p_mission_id IS NULL OR p_mission_id NOT IN ('surveyor-3','opportunity','ingenuity','insight','pioneer-10') THEN
    RAISE EXCEPTION 'invalid-input: Unknown mission or milestone';
  END IF;
  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not-found: Create your explorer profile first'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.mission_progress p WHERE p.user_id = v_uid AND p.mission_id = p_mission_id
    AND CASE WHEN p_milestone_id = 'legacy' THEN p.status = 'completed' ELSE
      public.chapter_reward_scene(p_mission_id,p_milestone_id) = ANY(p.completed_checkpoint_ids) END) THEN
    RAISE EXCEPTION 'conflict: Finish the eligible scene before claiming its reward';
  END IF;
  INSERT INTO public.xp_reward_events(user_id,mission_id,milestone_id,reward_key,xp)
    VALUES(v_uid,p_mission_id,p_milestone_id,p_mission_id || ':' || p_milestone_id,v_xp)
    ON CONFLICT(user_id,reward_key) DO NOTHING RETURNING * INTO v_event;
  v_new := FOUND;
  IF NOT v_new THEN SELECT * INTO v_event FROM public.xp_reward_events WHERE user_id = v_uid
    AND reward_key = p_mission_id || ':' || p_milestone_id; END IF;
  SELECT coalesce(sum(xp),0) INTO v_total FROM public.xp_reward_events WHERE user_id = v_uid;
  PERFORM set_config('nova.trusted_context','true',true);
  UPDATE public.profiles SET total_xp = v_total WHERE id = v_uid;
  RETURN jsonb_build_object('awarded',v_new,'rewardKey',v_event.reward_key,
    'xpAwarded',CASE WHEN v_new THEN v_event.xp ELSE 0 END,'totalXp',v_total,
    'event',jsonb_build_object('rewardKey',v_event.reward_key,'missionId',v_event.mission_id,
      'milestoneId',v_event.milestone_id,'xp',v_event.xp,'awardedAt',v_event.awarded_at));
END;
$$;


-- IDs/order/kinds match src/missions/surveyor-3/chapter.tsx. Reviewed NASA sources
-- and original photograph credits are recorded in the package README.
INSERT INTO public.mission_scene_catalog
  (mission_id,scene_id,position,kind,reward_milestone,discovery_id,discovery_title,discovery_summary,content_status)
VALUES
  ('surveyor-3','surveyor-mystery',1,'story',NULL,NULL,NULL,NULL,NULL),
  ('surveyor-3','surveyor-introduction',2,'story','introduction',NULL,NULL,NULL,NULL),
  ('surveyor-3','surveyor-landing',3,'activity',NULL,NULL,NULL,NULL,NULL),
  ('surveyor-3','surveyor-soil',4,'activity','activity',NULL,NULL,NULL,NULL),
  ('surveyor-3','surveyor-silence',5,'evidence',NULL,NULL,NULL,NULL,NULL),
  ('surveyor-3','surveyor-apollo',6,'discovery','discovery','surveyor-3-notes',
    'Surveyor 3: returned lunar hardware',
    'Surveyor 3’s returned camera and scoop helped scientists study prolonged exposure to the lunar environment.','sourced'),
  ('surveyor-3','surveyor-legacy',7,'ending',NULL,NULL,NULL,NULL,NULL);
