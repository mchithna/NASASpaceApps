-- Opportunity authored chapter. Add trusted content only; preserve all player data.
-- The existing checkpoint RPC handles reward timing, locks and idempotency.
INSERT INTO public.mission_scene_catalog
  (mission_id,scene_id,position,kind,reward_milestone,discovery_id,discovery_title,discovery_summary,content_status)
VALUES
  ('opportunity','last-signal',1,'story',NULL,NULL,NULL,NULL,NULL),
  ('opportunity','meet-opportunity',2,'story','introduction',NULL,NULL,NULL,NULL),
  ('opportunity','water-clues',3,'evidence',NULL,NULL,NULL,NULL,NULL),
  ('opportunity','mars-expedition',4,'activity','activity',NULL,NULL,NULL,NULL),
  ('opportunity','endeavour-evidence',5,'discovery','discovery','opportunity-notes',
    'The Ancient Water of Mars',
    'Hematite-rich spheres point to groundwater activity; gypsum veins record minerals deposited by water in fractures; clay-bearing rocks preserve evidence of a less acidic ancient watery environment. These findings concern past habitability, not proof of life. NASA source: https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-highlights/','sourced'),
  ('opportunity','dust-storm',6,'activity',NULL,NULL,NULL,NULL,NULL),
  ('opportunity','opportunity-legacy',7,'ending',NULL,NULL,NULL,NULL,NULL);
