-- Preserve ownership checks while caching request-level Auth lookups per statement.
-- Direct outcome writes remain RPC-only. No stored player rows are rewritten.
ALTER POLICY profiles_select_own ON public.profiles USING
  ((SELECT auth.uid()) = id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));
ALTER POLICY profiles_insert_own ON public.profiles WITH CHECK
  ((SELECT auth.uid()) = id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));
ALTER POLICY profiles_update_own ON public.profiles USING
  ((SELECT auth.uid()) = id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false)) WITH CHECK
  ((SELECT auth.uid()) = id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));
ALTER POLICY mission_progress_select_own ON public.mission_progress USING
  ((SELECT auth.uid()) = user_id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));
ALTER POLICY xp_reward_events_select_own ON public.xp_reward_events USING
  ((SELECT auth.uid()) = user_id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));
ALTER POLICY unlocked_achievements_select_own ON public.unlocked_achievements USING
  ((SELECT auth.uid()) = user_id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));
ALTER POLICY journal_entries_select_own ON public.journal_entries USING
  ((SELECT auth.uid()) = user_id AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));

-- These legacy policies no longer authorize writes, even if a future grant drifts.
ALTER POLICY mission_progress_insert_own ON public.mission_progress WITH CHECK (false);
ALTER POLICY mission_progress_update_own ON public.mission_progress USING (false) WITH CHECK (false);
ALTER POLICY unlocked_achievements_insert_own ON public.unlocked_achievements WITH CHECK (false);
ALTER POLICY journal_entries_insert_own ON public.journal_entries WITH CHECK (false);
ALTER POLICY scene_catalog_read ON public.mission_scene_catalog USING
  ((SELECT auth.uid()) IS NOT NULL AND NOT coalesce(((SELECT auth.jwt())->>'is_anonymous')::boolean, false));

-- Existing rows were preflighted on the deployment target; validation is atomic
-- and will fail rather than repair/delete noncompliant data on another target.
ALTER TABLE public.profiles VALIDATE CONSTRAINT profile_nickname_characters;
ALTER TABLE public.xp_reward_events VALIDATE CONSTRAINT canonical_reward_policy;
