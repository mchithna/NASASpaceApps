-- Trigger functions stay on a fixed search path. The reward RPCs already set theirs.
ALTER FUNCTION public.check_profile_update() SET search_path = public;
ALTER FUNCTION public.protect_profile_insert() SET search_path = public;
ALTER FUNCTION public.protect_mission_progress() SET search_path = public;
ALTER FUNCTION public.protect_achievement_insert() SET search_path = public;
ALTER FUNCTION public.protect_checkpoint_ids() SET search_path = public;
