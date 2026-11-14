-- Tighten player-system access before the first hosted apply.
-- The earlier migration creates the tables, policies, and reward functions.
-- This migration does not drop tables or rewrite stored explorer data.

-- Client inserts cannot choose an XP total. Reward functions set it later.
CREATE OR REPLACE FUNCTION public.protect_profile_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_setting('nova.trusted_context', true) IS DISTINCT FROM 'true' THEN
    NEW.total_xp := 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profile_insert ON public.profiles;
CREATE TRIGGER tr_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_insert();

-- Completion and legacy XP stay inside rpc_complete_mission.
CREATE OR REPLACE FUNCTION public.protect_mission_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_setting('nova.trusted_context', true) IS DISTINCT FROM 'true' THEN
    IF NEW.status = 'completed' OR NEW.completed_at IS NOT NULL THEN
      RAISE EXCEPTION 'conflict: Complete a mission through the mission completion function.';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_mission_progress_write ON public.mission_progress;
CREATE TRIGGER tr_mission_progress_write
  BEFORE INSERT OR UPDATE ON public.mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.protect_mission_progress();

-- A story achievement can be inserted by the client only after that mission is complete.
-- rpc_complete_mission sets nova.trusted_context and inserts the same row itself.
CREATE OR REPLACE FUNCTION public.protect_achievement_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_mission_id text := substring(NEW.achievement_id from '^(.*)-story$');
BEGIN
  IF current_setting('nova.trusted_context', true) = 'true' THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.mission_progress
    WHERE user_id = NEW.user_id
      AND mission_id = v_mission_id
      AND status = 'completed'
  ) THEN
    RAISE EXCEPTION 'conflict: Finish the mission before unlocking its story achievement.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_achievement_insert ON public.unlocked_achievements;
CREATE TRIGGER tr_achievement_insert
  BEFORE INSERT ON public.unlocked_achievements
  FOR EACH ROW EXECUTE FUNCTION public.protect_achievement_insert();

CREATE OR REPLACE FUNCTION public.protect_checkpoint_ids()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  checkpoint_id text;
BEGIN
  IF NEW.current_checkpoint_id IS NOT NULL AND (
    char_length(NEW.current_checkpoint_id) < 1
    OR char_length(NEW.current_checkpoint_id) > 64
    OR NEW.current_checkpoint_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ) THEN
    RAISE EXCEPTION 'invalid-input: Checkpoint names use lowercase letters, numbers, and hyphens.';
  END IF;

  IF NEW.completed_checkpoint_ids IS NOT NULL THEN
    FOREACH checkpoint_id IN ARRAY NEW.completed_checkpoint_ids LOOP
      IF char_length(checkpoint_id) < 1
        OR char_length(checkpoint_id) > 64
        OR checkpoint_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN
        RAISE EXCEPTION 'invalid-input: Checkpoint names use lowercase letters, numbers, and hyphens.';
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_checkpoint_ids ON public.mission_progress;
CREATE TRIGGER tr_checkpoint_ids
  BEFORE INSERT OR UPDATE ON public.mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.protect_checkpoint_ids();

-- Replace the reward functions so anonymous explorers cannot write XP,
-- and so completion can pass the progress trigger above.
CREATE OR REPLACE FUNCTION public.rpc_grant_milestone(
  p_mission_id text,
  p_milestone_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_xp integer;
  v_reward_key text;
  v_existing record;
  v_total_xp integer;
  v_event record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated: Sign in required';
  END IF;

  IF coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'unauthenticated: Guest explorers keep progress on this device.';
  END IF;

  IF p_mission_id NOT IN ('surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10') THEN
    RAISE EXCEPTION 'invalid-input: Invalid mission ID';
  END IF;

  IF p_milestone_id = 'introduction' THEN
    v_xp := 20;
  ELSIF p_milestone_id = 'activity' THEN
    v_xp := 40;
  ELSIF p_milestone_id = 'discovery' THEN
    v_xp := 25;
  ELSIF p_milestone_id = 'legacy' THEN
    v_xp := 15;
  ELSE
    RAISE EXCEPTION 'invalid-input: Invalid milestone ID';
  END IF;

  v_reward_key := p_mission_id || ':' || p_milestone_id;

  SELECT * INTO v_existing FROM public.xp_reward_events
  WHERE user_id = v_user_id AND reward_key = v_reward_key;

  IF FOUND THEN
    SELECT COALESCE(total_xp, 0) INTO v_total_xp FROM public.profiles WHERE id = v_user_id;
    RETURN jsonb_build_object(
      'awarded', false,
      'rewardKey', v_existing.reward_key,
      'xpAwarded', 0,
      'event', jsonb_build_object(
        'rewardKey', v_existing.reward_key,
        'missionId', v_existing.mission_id,
        'milestoneId', v_existing.milestone_id,
        'xp', v_existing.xp,
        'awardedAt', v_existing.awarded_at
      ),
      'totalXp', COALESCE(v_total_xp, 0)
    );
  END IF;

  INSERT INTO public.xp_reward_events (user_id, mission_id, milestone_id, reward_key, xp, awarded_at)
  VALUES (v_user_id, p_mission_id, p_milestone_id, v_reward_key, v_xp, now())
  RETURNING * INTO v_event;

  SELECT COALESCE(SUM(xp), 0) INTO v_total_xp
  FROM public.xp_reward_events
  WHERE user_id = v_user_id;

  PERFORM set_config('nova.trusted_context', 'true', true);
  UPDATE public.profiles
  SET total_xp = v_total_xp, updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'awarded', true,
    'rewardKey', v_event.reward_key,
    'xpAwarded', v_event.xp,
    'event', jsonb_build_object(
      'rewardKey', v_event.reward_key,
      'missionId', v_event.mission_id,
      'milestoneId', v_event.milestone_id,
      'xp', v_event.xp,
      'awardedAt', v_event.awarded_at
    ),
    'totalXp', v_total_xp
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_complete_mission(
  p_mission_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_progress record;
  v_reward jsonb;
  v_achievement_id text;
  v_achievement record;
  v_ach_awarded boolean := false;
  v_now timestamptz := now();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated: Sign in required';
  END IF;

  IF coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'unauthenticated: Guest explorers keep progress on this device.';
  END IF;

  IF p_mission_id NOT IN ('surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10') THEN
    RAISE EXCEPTION 'invalid-input: Invalid mission ID';
  END IF;

  PERFORM set_config('nova.trusted_context', 'true', true);

  SELECT * INTO v_progress FROM public.mission_progress
  WHERE user_id = v_user_id AND mission_id = p_mission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not-found: Mission has no saved progress';
  END IF;

  IF v_progress.status = 'not_started' THEN
    RAISE EXCEPTION 'conflict: Start the mission before completing it';
  END IF;

  IF v_progress.status = 'in_progress' THEN
    UPDATE public.mission_progress
    SET status = 'completed', completed_at = v_now, updated_at = v_now
    WHERE user_id = v_user_id AND mission_id = p_mission_id
    RETURNING * INTO v_progress;
  END IF;

  v_reward := public.rpc_grant_milestone(p_mission_id, 'legacy');

  v_achievement_id := p_mission_id || '-story';
  SELECT * INTO v_achievement FROM public.unlocked_achievements
  WHERE user_id = v_user_id AND achievement_id = v_achievement_id;

  IF NOT FOUND THEN
    INSERT INTO public.unlocked_achievements (user_id, achievement_id, unlocked_at)
    VALUES (v_user_id, v_achievement_id, v_now)
    RETURNING * INTO v_achievement;
    v_ach_awarded := true;
  ELSE
    v_ach_awarded := false;
  END IF;

  RETURN jsonb_build_object(
    'progress', jsonb_build_object(
      'missionId', v_progress.mission_id,
      'status', v_progress.status,
      'currentCheckpointId', v_progress.current_checkpoint_id,
      'completedCheckpointIds', v_progress.completed_checkpoint_ids,
      'completedAt', v_progress.completed_at,
      'updatedAt', v_progress.updated_at
    ),
    'reward', v_reward,
    'achievement', jsonb_build_object(
      'awarded', v_ach_awarded,
      'unlock', jsonb_build_object(
        'achievementId', v_achievement.achievement_id,
        'unlockedAt', v_achievement.unlocked_at
      )
    )
  );
END;
$$;

-- Data API roles receive no access until these grants. RLS still applies.
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.mission_progress FROM anon, authenticated;
REVOKE ALL ON TABLE public.xp_reward_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.unlocked_achievements FROM anon, authenticated;
REVOKE ALL ON TABLE public.journal_entries FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.mission_progress TO authenticated;
GRANT SELECT ON TABLE public.xp_reward_events TO authenticated;
GRANT SELECT, INSERT ON TABLE public.unlocked_achievements TO authenticated;
GRANT SELECT, INSERT ON TABLE public.journal_entries TO authenticated;

REVOKE ALL ON FUNCTION public.rpc_grant_milestone(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_complete_mission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_grant_milestone(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_complete_mission(text) TO authenticated;
