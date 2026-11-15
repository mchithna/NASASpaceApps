-- Phase 4B Step 4. No sample content or existing player data is changed.
-- Chapters publish their reviewed scene/discovery manifests here via later migrations.
CREATE TABLE public.mission_scene_catalog (
  mission_id text NOT NULL CHECK (mission_id IN ('surveyor-3','opportunity','ingenuity','insight','pioneer-10')),
  scene_id text NOT NULL CHECK (length(scene_id) BETWEEN 1 AND 64 AND scene_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position integer NOT NULL CHECK (position > 0),
  kind text NOT NULL CHECK (kind IN ('story','evidence','activity','discovery','ending')),
  discovery_id text CHECK (length(discovery_id) BETWEEN 1 AND 64 AND discovery_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  discovery_title text,
  discovery_summary text,
  content_status text CHECK (content_status IN ('placeholder','sourced')),
  PRIMARY KEY (mission_id, scene_id),
  UNIQUE (mission_id, position),
  UNIQUE (mission_id, discovery_id),
  CHECK ((kind = 'discovery' AND discovery_id IS NOT NULL AND discovery_title IS NOT NULL
    AND discovery_summary IS NOT NULL AND content_status IS NOT NULL)
    OR (kind <> 'discovery' AND discovery_id IS NULL))
);
ALTER TABLE public.mission_scene_catalog ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mission_scene_catalog FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.mission_scene_catalog TO authenticated;
CREATE POLICY scene_catalog_read ON public.mission_scene_catalog FOR SELECT TO authenticated USING (true);

-- Only validated functions may write player outcomes. Keep own-row SELECT policies.
REVOKE INSERT, UPDATE, DELETE ON public.mission_progress FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.journal_entries FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.unlocked_achievements FROM anon, authenticated;

CREATE FUNCTION public.rpc_unlock_discovery(p_mission_id text, p_discovery_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_scene public.mission_scene_catalog%ROWTYPE;
  v_entry public.journal_entries%ROWTYPE;
  v_new boolean;
BEGIN
  IF v_uid IS NULL OR coalesce((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'unauthenticated: A registered explorer is required';
  END IF;
  -- All reward and progress functions lock the profile first: same lock order,
  -- serial totals across different missions, and safe simultaneous callbacks.
  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not-found: Create your explorer profile first'; END IF;
  SELECT * INTO v_scene FROM public.mission_scene_catalog
    WHERE mission_id = p_mission_id AND discovery_id = p_discovery_id AND kind = 'discovery';
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid-input: Unknown mission discovery'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.mission_progress
    WHERE user_id = v_uid AND mission_id = p_mission_id AND v_scene.scene_id = ANY(completed_checkpoint_ids)) THEN
    RAISE EXCEPTION 'conflict: Finish the discovery scene first';
  END IF;
  INSERT INTO public.journal_entries(user_id,mission_id,discovery_id,title,summary,content_status)
    VALUES(v_uid,p_mission_id,p_discovery_id,v_scene.discovery_title,v_scene.discovery_summary,v_scene.content_status)
    ON CONFLICT (user_id,mission_id,discovery_id) DO NOTHING RETURNING * INTO v_entry;
  v_new := FOUND;
  IF NOT v_new THEN SELECT * INTO v_entry FROM public.journal_entries
    WHERE user_id = v_uid AND mission_id = p_mission_id AND discovery_id = p_discovery_id; END IF;
  RETURN jsonb_build_object('awarded',v_new,'entry',jsonb_build_object(
    'missionId',v_entry.mission_id,'discoveryId',v_entry.discovery_id,'title',v_entry.title,
    'summary',v_entry.summary,'contentStatus',v_entry.content_status,'unlockedAt',v_entry.unlocked_at));
END;
$$;

CREATE FUNCTION public.rpc_unlock_achievement(p_achievement_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_mission text;
  v_entry public.unlocked_achievements%ROWTYPE;
  v_new boolean;
BEGIN
  IF v_uid IS NULL OR coalesce((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'unauthenticated: A registered explorer is required';
  END IF;
  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not-found: Create your explorer profile first'; END IF;
  SELECT mission_id INTO v_mission FROM public.mission_progress
    WHERE user_id = v_uid AND mission_id || '-story' = p_achievement_id AND status = 'completed';
  IF NOT FOUND THEN RAISE EXCEPTION 'conflict: Finish the mission first'; END IF;
  INSERT INTO public.unlocked_achievements(user_id,achievement_id) VALUES(v_uid,p_achievement_id)
    ON CONFLICT (user_id,achievement_id) DO NOTHING RETURNING * INTO v_entry;
  v_new := FOUND;
  IF NOT v_new THEN SELECT * INTO v_entry FROM public.unlocked_achievements
    WHERE user_id = v_uid AND achievement_id = p_achievement_id; END IF;
  RETURN jsonb_build_object('awarded',v_new,'unlock',jsonb_build_object(
    'achievementId',v_entry.achievement_id,'unlockedAt',v_entry.unlocked_at));
END;
$$;

CREATE FUNCTION public.rpc_save_checkpoint(p_mission_id text, p_checkpoint_id text, p_completed_checkpoint_id text DEFAULT NULL)
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
    SELECT * INTO v_scene FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = v_kind ORDER BY position LIMIT 1;
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

REVOKE ALL ON FUNCTION public.rpc_save_checkpoint(text,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_unlock_discovery(text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_unlock_achievement(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_save_checkpoint(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_unlock_discovery(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_unlock_achievement(text) TO authenticated;

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
      (SELECT scene_id FROM public.mission_scene_catalog WHERE mission_id = p_mission_id
        AND kind = CASE p_milestone_id WHEN 'introduction' THEN 'story' ELSE p_milestone_id END
        ORDER BY position LIMIT 1) = ANY(p.completed_checkpoint_ids) END) THEN
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

CREATE OR REPLACE FUNCTION public.rpc_complete_mission(p_mission_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_progress public.mission_progress%ROWTYPE;
  v_reward jsonb;
  v_achievement jsonb;
BEGIN
  IF v_uid IS NULL OR coalesce((auth.jwt()->>'is_anonymous')::boolean,false) THEN
    RAISE EXCEPTION 'unauthenticated: A registered explorer is required';
  END IF;
  IF p_mission_id IS NULL OR p_mission_id NOT IN ('surveyor-3','opportunity','ingenuity','insight','pioneer-10') THEN
    RAISE EXCEPTION 'invalid-input: Unknown mission';
  END IF;
  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not-found: Create your explorer profile first'; END IF;
  SELECT * INTO v_progress FROM public.mission_progress WHERE user_id = v_uid AND mission_id = p_mission_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'conflict: Start the mission first'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND kind = 'ending')
    OR EXISTS (SELECT 1 FROM public.mission_scene_catalog WHERE mission_id = p_mission_id AND NOT (scene_id = ANY(v_progress.completed_checkpoint_ids)))
    OR (SELECT count(*) FROM public.xp_reward_events WHERE user_id = v_uid AND mission_id = p_mission_id
      AND milestone_id IN ('introduction','activity','discovery')) <> 3
    OR EXISTS (SELECT 1 FROM public.mission_scene_catalog c WHERE c.mission_id = p_mission_id AND c.kind = 'discovery'
      AND NOT EXISTS (SELECT 1 FROM public.journal_entries j WHERE j.user_id = v_uid AND j.mission_id = p_mission_id AND j.discovery_id = c.discovery_id)) THEN
    RAISE EXCEPTION 'conflict: Finish all chapter scenes and rewards before completing the mission';
  END IF;
  PERFORM set_config('nova.trusted_context','true',true);
  IF v_progress.status <> 'completed' THEN
    UPDATE public.mission_progress SET status = 'completed',completed_at = now(),updated_at = now()
      WHERE user_id = v_uid AND mission_id = p_mission_id RETURNING * INTO v_progress;
  END IF;
  v_reward := public.rpc_grant_milestone(p_mission_id,'legacy');
  v_achievement := public.rpc_unlock_achievement(p_mission_id || '-story');
  RETURN jsonb_build_object('progress',jsonb_build_object('missionId',v_progress.mission_id,'status',v_progress.status,
    'currentCheckpointId',v_progress.current_checkpoint_id,'completedCheckpointIds',v_progress.completed_checkpoint_ids,
    'completedAt',v_progress.completed_at,'updatedAt',v_progress.updated_at),'reward',v_reward,'achievement',v_achievement);
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_grant_milestone(text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_complete_mission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_grant_milestone(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_complete_mission(text) TO authenticated;
