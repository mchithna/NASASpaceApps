-- Pioneer 10 authored chapter. Trusted content only; preserve all player data.
-- Existing RPCs enforce ordered checkpoints, fixed rewards and idempotency.
INSERT INTO public.mission_scene_catalog
  (mission_id,scene_id,position,kind,reward_milestone,discovery_id,discovery_title,discovery_summary,content_status)
VALUES
  ('pioneer-10','last-whisper',1,'story',NULL,NULL,NULL,NULL,NULL),
  ('pioneer-10','meet-pioneer',2,'story','introduction',NULL,NULL,NULL,NULL),
  ('pioneer-10','asteroid-belt',3,'activity',NULL,NULL,NULL,NULL,NULL),
  ('pioneer-10','jupiter-encounter',4,'activity','activity',NULL,NULL,NULL,NULL),
  ('pioneer-10','pioneer-plaque',5,'discovery','discovery','pioneer-10-notes',
    'The Pioneer Plaque — A Message From Humanity',
    'Pioneer 10 carries a physical plaque intended to identify humanity and its origin if found in the distant future. Hydrogen provides a shared physical reference; a pulsar map encodes the Sun’s location; human figures beside the spacecraft show appearance and scale; a solar-system diagram identifies Earth as the departure planet. The plaque is not a radio message, and no discovery or reply by another civilization is confirmed. NASA source: https://science.nasa.gov/resource/pioneer-plaque/',
    'sourced'),
  ('pioneer-10','deep-space-signal',6,'activity',NULL,NULL,NULL,NULL,NULL),
  ('pioneer-10','pioneer-legacy',7,'ending',NULL,NULL,NULL,NULL,NULL);
