-- InSight authored chapter. Add trusted content only; preserve all player data.
-- The existing checkpoint RPC handles reward timing, locks and idempotency.
-- Legacy 15 XP is granted by completeMission, not by the ending row.
INSERT INTO public.mission_scene_catalog
  (mission_id,scene_id,position,kind,reward_milestone,discovery_id,discovery_title,discovery_summary,content_status)
VALUES
  ('insight','insight-last-signal',1,'story',NULL,NULL,NULL,NULL,NULL),
  ('insight','insight-arrival',2,'story','introduction',NULL,NULL,NULL,NULL),
  ('insight','insight-deployment',3,'activity',NULL,NULL,NULL,NULL,NULL),
  ('insight','insight-first-whisper',4,'activity','activity',NULL,NULL,NULL,NULL),
  ('insight','insight-interior',5,'discovery','discovery','insight-notes',
    'Mars Has a Hidden Structure',
    'InSight’s seismometer detected 1,319 marsquakes, including some caused by meteoroid impacts. Those records gave scientists a way to study Mars’s crust, mantle, and core. NASA source: https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/','sourced'),
  ('insight','insight-fading-power',6,'activity',NULL,NULL,NULL,NULL,NULL),
  ('insight','insight-legacy',7,'ending',NULL,NULL,NULL,NULL,NULL);
