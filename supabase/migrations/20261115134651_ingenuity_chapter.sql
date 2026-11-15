-- Ingenuity authored chapter. Add trusted content only; preserve all player data.
-- Existing RPCs enforce checkpoint order, fixed rewards and idempotency.
INSERT INTO public.mission_scene_catalog
  (mission_id,scene_id,position,kind,reward_milestone,discovery_id,discovery_title,discovery_summary,content_status)
VALUES
  ('ingenuity','mars-flight-dream',1,'story',NULL,NULL,NULL,NULL,NULL),
  ('ingenuity','aircraft-inspection',2,'story','introduction',NULL,NULL,NULL,NULL),
  ('ingenuity','flight-science',3,'activity',NULL,NULL,NULL,NULL,NULL),
  ('ingenuity','first-flight',4,'activity','activity',NULL,NULL,NULL,NULL),
  ('ingenuity','aerial-scouting',5,'activity',NULL,NULL,NULL,NULL,NULL),
  ('ingenuity','flight-seventy-two',6,'discovery','discovery','ingenuity-notes',
    'The Final Flight of Ingenuity',
    'January 18, 2024: Flight 72 ended with a hard landing and rotor damage. Terrain images, navigation analysis and a damaged rotor shadow informed NASA’s investigation. Insufficient visual-navigation information over relatively featureless terrain was the likely beginning of the accident sequence. Reliable autonomous navigation and safe landing conditions are essential. NASA source: https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/',
    'sourced'),
  ('ingenuity','ingenuity-legacy',7,'ending',NULL,NULL,NULL,NULL,NULL);
