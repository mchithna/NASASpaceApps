// Embedded PostgreSQL only. Executes the actual migration chain; no hosted writes.
import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'
import { scenes } from './chapter.tsx'

const migrations = import.meta.glob<string>(
  '../../../supabase/migrations/*.sql',
  { query: '?raw', import: 'default', eager: true },
)

describe('Surveyor 3 trusted publication', () => {
  it('archives legacy checkpoints before restarting progress, preserving XP and achievements', async () => {
    const db = new PGlite()
    try {
      await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
        CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
        CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS 'SELECT ''{}''::jsonb';`)
      const archiveMigration = Object.keys(migrations).find((name) =>
        name.endsWith('_surveyor_3_legacy_checkpoint_archive.sql'),
      )!
      for (const name of Object.keys(migrations).sort()) {
        if (name !== archiveMigration) await db.exec(migrations[name]!)
      }
      const id = '11111111-1111-4111-8111-111111111111'
      await db.exec(`INSERT INTO auth.users VALUES ('${id}');
        INSERT INTO public.profiles(id,nickname,avatar_id) VALUES ('${id}','Legacy tester','cadet-1');
        INSERT INTO public.mission_progress(user_id,mission_id,status,current_checkpoint_id,completed_checkpoint_ids)
          VALUES ('${id}','surveyor-3','in_progress','old-opening',ARRAY['old-intro']);
        INSERT INTO public.xp_reward_events(user_id,mission_id,milestone_id,reward_key,xp)
          VALUES ('${id}','surveyor-3','introduction','surveyor-3:introduction',20);
        SELECT set_config('nova.trusted_context','true',false);
        UPDATE public.mission_progress SET status='completed',completed_at=now() WHERE user_id='${id}';
        INSERT INTO public.unlocked_achievements(user_id,achievement_id) VALUES ('${id}','surveyor-3-story');
        SELECT set_config('nova.trusted_context','true',false);
        UPDATE public.profiles SET total_xp=20 WHERE id='${id}';`)
      const original = (
        await db.query<{ snapshot: unknown }>(
          'SELECT to_jsonb(p) AS snapshot FROM public.mission_progress p',
        )
      ).rows[0]!.snapshot
      await db.exec(migrations[archiveMigration]!)
      expect(
        (
          await db.query<{ progress_snapshot: unknown }>(
            'SELECT progress_snapshot FROM public.mission_progress_archive',
          )
        ).rows[0]!.progress_snapshot,
      ).toEqual(original)
      expect(
        (
          await db.query(
            'SELECT status,current_checkpoint_id,completed_checkpoint_ids FROM public.mission_progress',
          )
        ).rows,
      ).toEqual([
        {
          status: 'not_started',
          current_checkpoint_id: null,
          completed_checkpoint_ids: [],
        },
      ])
      expect(
        (await db.query('SELECT total_xp FROM public.profiles')).rows,
      ).toEqual([{ total_xp: 20 }])
      expect(
        (await db.query('SELECT xp FROM public.xp_reward_events')).rows,
      ).toEqual([{ xp: 20 }])
      expect(
        (
          await db.query(
            'SELECT achievement_id FROM public.unlocked_achievements',
          )
        ).rows,
      ).toHaveLength(1)
      expect(
        (
          await db.query(
            "SELECT has_table_privilege('authenticated','public.mission_progress_archive','SELECT') AS allowed",
          )
        ).rows,
      ).toEqual([{ allowed: false }])
    } finally {
      await db.close()
    }
  }, 60000)
  it('matches all seven scenes, enforces reward timing, records sourced discovery and prevents duplicates', async () => {
    const db = new PGlite()
    try {
      await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
        CREATE TABLE auth.users(id uuid PRIMARY KEY);
        CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
          'SELECT nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
        CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS 'SELECT ''{}''::jsonb';
        GRANT USAGE ON SCHEMA auth TO authenticated,anon;
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated,anon;`)
      for (const name of Object.keys(migrations).sort())
        await db.exec(migrations[name]!)
      const catalog = await db.query<{
        scene_id: string
        kind: string
        reward_milestone: string | null
      }>(
        `SELECT scene_id,kind,reward_milestone FROM public.mission_scene_catalog WHERE mission_id = 'surveyor-3' ORDER BY position`,
      )
      expect(catalog.rows).toEqual(
        scenes.map((scene) => ({
          scene_id: scene.id,
          kind: scene.kind,
          reward_milestone: scene.reward ?? null,
        })),
      )
      await db.exec(`INSERT INTO auth.users VALUES ('11111111-1111-4111-8111-111111111111');
        INSERT INTO public.profiles(id,nickname,avatar_id) VALUES ('11111111-1111-4111-8111-111111111111','Chapter tester','cadet-1');
        SET ROLE authenticated;
        SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);`)
      const total = async () =>
        (
          await db.query<{ total_xp: number }>(
            'SELECT total_xp FROM public.profiles',
          )
        ).rows[0]!.total_xp
      await db.query(
        `SELECT public.rpc_save_checkpoint('surveyor-3','surveyor-mystery')`,
      )
      await expect(
        db.query(
          `SELECT public.rpc_save_checkpoint('surveyor-3','surveyor-soil')`,
        ),
      ).rejects.toThrow('locked')
      const expected = [0, 20, 20, 60, 60, 85, 100]
      for (const [index, scene] of scenes.entries()) {
        const next = scenes[index + 1] ?? scene
        await db.query(
          `SELECT public.rpc_save_checkpoint('surveyor-3',$1,$2)`,
          [next.id, scene.id],
        )
        expect(await total()).toBe(expected[index])
        if (index === 0)
          await expect(
            db.query(
              `SELECT public.rpc_grant_milestone('surveyor-3','introduction')`,
            ),
          ).rejects.toThrow('eligible scene')
        if (index === 2)
          await expect(
            db.query(
              `SELECT public.rpc_grant_milestone('surveyor-3','activity')`,
            ),
          ).rejects.toThrow('eligible scene')
      }
      const entries = await db.query<{
        content_status: string
        summary: string
      }>('SELECT content_status,summary FROM public.journal_entries')
      expect(entries.rows).toEqual([
        {
          content_status: 'sourced',
          summary: expect.stringContaining('lunar environment'),
        },
      ])
      expect(
        (
          await db.query(
            'SELECT achievement_id FROM public.unlocked_achievements',
          )
        ).rows,
      ).toEqual([{ achievement_id: 'surveyor-3-story' }])
      for (let index = 0; index < 3; index++) {
        await db.query(`SELECT public.rpc_complete_mission('surveyor-3')`)
        await db.query(
          `SELECT public.rpc_save_checkpoint('surveyor-3','surveyor-mystery')`,
        )
      }
      expect(await total()).toBe(100)
      expect(
        (await db.query('SELECT * FROM public.xp_reward_events')).rows,
      ).toHaveLength(4)
    } finally {
      await db.close()
    }
  }, 60000)
})
