-- Step 5: least privilege, no data resets or row rewrites. Apply after Step 4.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT INSERT (id, nickname, avatar_id) ON public.profiles TO authenticated;
GRANT UPDATE (nickname, avatar_id) ON public.profiles TO authenticated;

-- Anonymous Auth users also carry the authenticated role. They use the local
-- guest adapter, not registered-user tables. Authorization never uses metadata.
ALTER POLICY profiles_select_own ON public.profiles USING
  (auth.uid() = id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));
ALTER POLICY profiles_insert_own ON public.profiles WITH CHECK
  (auth.uid() = id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));
ALTER POLICY profiles_update_own ON public.profiles USING
  (auth.uid() = id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false)) WITH CHECK
  (auth.uid() = id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));
ALTER POLICY mission_progress_select_own ON public.mission_progress USING
  (auth.uid() = user_id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));
ALTER POLICY xp_reward_events_select_own ON public.xp_reward_events USING
  (auth.uid() = user_id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));
ALTER POLICY unlocked_achievements_select_own ON public.unlocked_achievements USING
  (auth.uid() = user_id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));
ALTER POLICY journal_entries_select_own ON public.journal_entries USING
  (auth.uid() = user_id AND NOT coalesce((auth.jwt()->>'is_anonymous')::boolean, false));

-- NOT VALID leaves existing rows untouched, but enforces the rules on every new
-- insert/update. Existing-row validation is a separate deployment audit gate.
ALTER TABLE public.profiles ADD CONSTRAINT profile_nickname_characters
  CHECK (nickname ~ '^[a-zA-Z0-9 ''-]+$') NOT VALID;
ALTER TABLE public.xp_reward_events ADD CONSTRAINT canonical_reward_policy CHECK (
  reward_key = mission_id || ':' || milestone_id AND xp = CASE milestone_id
    WHEN 'introduction' THEN 20 WHEN 'activity' THEN 40 WHEN 'discovery' THEN 25 WHEN 'legacy' THEN 15 END
) NOT VALID;
