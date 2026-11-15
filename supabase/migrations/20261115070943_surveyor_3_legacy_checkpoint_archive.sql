-- Explicitly authorized legacy checkpoint recovery. Preserve rewards and profiles.
-- Keep the old row in an admin-only archive before restarting authored progress.
CREATE TABLE public.mission_progress_archive (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id text NOT NULL,
  chapter_version text NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now(),
  progress_snapshot jsonb NOT NULL,
  PRIMARY KEY (user_id,mission_id,chapter_version)
);
ALTER TABLE public.mission_progress_archive ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mission_progress_archive FROM PUBLIC,anon,authenticated;

INSERT INTO public.mission_progress_archive(user_id,mission_id,chapter_version,progress_snapshot)
SELECT p.user_id,p.mission_id,'surveyor-3-authored-v1',to_jsonb(p)
FROM public.mission_progress p
WHERE p.mission_id = 'surveyor-3' AND (
  (p.current_checkpoint_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.mission_scene_catalog c
    WHERE c.mission_id=p.mission_id AND c.scene_id=p.current_checkpoint_id))
  OR EXISTS (SELECT 1 FROM unnest(p.completed_checkpoint_ids) checkpoint_id
    WHERE NOT EXISTS (SELECT 1 FROM public.mission_scene_catalog c
      WHERE c.mission_id=p.mission_id AND c.scene_id=checkpoint_id))
)
FOR UPDATE OF p;

UPDATE public.mission_progress p
SET status='not_started',current_checkpoint_id=NULL,completed_checkpoint_ids='{}',
    completed_at=NULL,updated_at=now()
FROM public.mission_progress_archive a
WHERE a.user_id=p.user_id AND a.mission_id=p.mission_id
  AND a.chapter_version='surveyor-3-authored-v1';
-- XP events, profile XP/rank, journal entries and achievements are untouched.
