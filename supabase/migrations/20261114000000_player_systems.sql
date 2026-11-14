-- NovaExplorer Phase 2: Player Systems Database Migration
-- Fully aligned with Phase 1.5 shared contracts and security requirements

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  avatar_id text NOT NULL CHECK (avatar_id IN ('cadet-1', 'cadet-2', 'cadet-3', 'cadet-4')),
  kind text NOT NULL DEFAULT 'registered' CHECK (kind IN ('guest', 'registered')),
  total_xp integer NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nickname_length CHECK (char_length(trim(nickname)) >= 2 AND char_length(trim(nickname)) <= 20)
);

-- 2. Mission Progress Table
CREATE TABLE IF NOT EXISTS public.mission_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL CHECK (mission_id IN ('surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10')),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  current_checkpoint_id text,
  completed_checkpoint_ids text[] NOT NULL DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_mission UNIQUE (user_id, mission_id)
);

-- 3. XP Reward Events Table (Authoritative milestone rewards)
CREATE TABLE IF NOT EXISTS public.xp_reward_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL CHECK (mission_id IN ('surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10')),
  milestone_id text NOT NULL CHECK (milestone_id IN ('introduction', 'activity', 'discovery', 'legacy')),
  reward_key text NOT NULL,
  xp integer NOT NULL CHECK (xp IN (20, 40, 25, 15)),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_reward_key UNIQUE (user_id, reward_key)
);

-- 4. Unlocked Achievements Table
CREATE TABLE IF NOT EXISTS public.unlocked_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL CHECK (achievement_id IN ('surveyor-3-story', 'opportunity-story', 'ingenuity-story', 'insight-story', 'pioneer-10-story')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

-- 5. Discovery Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL CHECK (mission_id IN ('surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10')),
  discovery_id text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  content_status text NOT NULL DEFAULT 'placeholder' CHECK (content_status IN ('placeholder', 'sourced')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_journal_discovery UNIQUE (user_id, mission_id, discovery_id),
  CONSTRAINT discovery_id_length CHECK (char_length(discovery_id) >= 1 AND char_length(discovery_id) <= 64)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_reward_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for Mission Progress
CREATE POLICY "mission_progress_select_own" ON public.mission_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "mission_progress_insert_own" ON public.mission_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mission_progress_update_own" ON public.mission_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for XP Reward Events (Read-only for client; writes only via trusted RPC)
CREATE POLICY "xp_reward_events_select_own" ON public.xp_reward_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for Unlocked Achievements
CREATE POLICY "unlocked_achievements_select_own" ON public.unlocked_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "unlocked_achievements_insert_own" ON public.unlocked_achievements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Journal Entries
CREATE POLICY "journal_entries_select_own" ON public.journal_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "journal_entries_insert_own" ON public.journal_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger to prevent direct client modification of total_xp on profiles
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If total_xp was modified and the context is not security definer RPC
  IF NEW.total_xp IS DISTINCT FROM OLD.total_xp AND current_setting('nova.trusted_context', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Total XP cannot be updated directly by client.';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profile_update ON public.profiles;
CREATE TRIGGER tr_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_profile_update();

-- RPC Function: Grant Milestone (Trusted, Idempotent)
CREATE OR REPLACE FUNCTION public.rpc_grant_milestone(
  p_mission_id text,
  p_milestone_id text
)
RETURNS jsonb
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

  -- Check existing reward
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
      'totalXp', v_total_xp
    );
  END IF;

  -- Insert event
  INSERT INTO public.xp_reward_events (user_id, mission_id, milestone_id, reward_key, xp, awarded_at)
  VALUES (v_user_id, p_mission_id, p_milestone_id, v_reward_key, v_xp, now())
  RETURNING * INTO v_event;

  -- Recalculate total XP
  SELECT COALESCE(SUM(xp), 0) INTO v_total_xp FROM public.xp_reward_events WHERE user_id = v_user_id;

  -- Set trusted context to allow profile total_xp update
  PERFORM set_config('nova.trusted_context', 'true', true);
  UPDATE public.profiles SET total_xp = v_total_xp, updated_at = now() WHERE id = v_user_id;

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
$$ LANGUAGE plpgsql;

-- RPC Function: Complete Mission (Atomic, Idempotent)
CREATE OR REPLACE FUNCTION public.rpc_complete_mission(
  p_mission_id text
)
RETURNS jsonb
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

  IF p_mission_id NOT IN ('surveyor-3', 'opportunity', 'ingenuity', 'insight', 'pioneer-10') THEN
    RAISE EXCEPTION 'invalid-input: Invalid mission ID';
  END IF;

  SELECT * INTO v_progress FROM public.mission_progress
  WHERE user_id = v_user_id AND mission_id = p_mission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not-found: Mission has no saved progress';
  END IF;

  IF v_progress.status = 'not_started' THEN
    RAISE EXCEPTION 'conflict: Start the mission before completing it';
  END IF;

  -- Update progress if currently in_progress
  IF v_progress.status = 'in_progress' THEN
    UPDATE public.mission_progress
    SET status = 'completed', completed_at = v_now, updated_at = v_now
    WHERE user_id = v_user_id AND mission_id = p_mission_id
    RETURNING * INTO v_progress;
  END IF;

  -- Grant legacy milestone (15 XP)
  v_reward := public.rpc_grant_milestone(p_mission_id, 'legacy');

  -- Grant story achievement
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
$$ LANGUAGE plpgsql;

-- Narrow permissions on functions
REVOKE ALL ON FUNCTION public.rpc_grant_milestone(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_grant_milestone(text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.rpc_complete_mission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_complete_mission(text) TO authenticated;
