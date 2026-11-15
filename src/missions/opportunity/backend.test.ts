// Embedded PostgreSQL: run the actual migration chain without hosted player writes.
import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'
import { scenes } from './chapter.tsx'

const migrations = import.meta.glob<string>(
  '../../../supabase/migrations/*.sql',
  { query: '?raw', import: 'default', eager: true },
)

describe('Opportunity trusted catalog', () => {
  it('matches the chapter, gates rewards, saves discovery and completes exactly once', async () => {
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
      expect(
        (
          await db.query(
            `SELECT scene_id,kind,reward_milestone FROM public.mission_scene_catalog WHERE mission_id='opportunity' ORDER BY position`,
          )
        ).rows,
      ).toEqual(
        scenes.map((scene) => ({
          scene_id: scene.id,
          kind: scene.kind,
          reward_milestone: scene.reward ?? null,
        })),
      )
      await db.exec(`INSERT INTO auth.users VALUES ('22222222-2222-4222-8222-222222222222');
        INSERT INTO public.profiles(id,nickname,avatar_id) VALUES ('22222222-2222-4222-8222-222222222222','Mars tester','cadet-1');
        SET ROLE authenticated;
        SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);`)
      const total = async () =>
        (
          await db.query<{ total_xp: number }>(
            'SELECT total_xp FROM public.profiles',
          )
        ).rows[0]!.total_xp
      await db.query(
        `SELECT public.rpc_save_checkpoint('opportunity','last-signal')`,
      )
      await expect(
        db.query(
          `SELECT public.rpc_save_checkpoint('opportunity','mars-expedition')`,
        ),
      ).rejects.toThrow('locked')
      await expect(
        db.query(
          `SELECT public.rpc_grant_milestone('opportunity','introduction')`,
        ),
      ).rejects.toThrow('eligible scene')
      const totals = [0, 20, 20, 60, 85, 85, 100]
      for (const [index, scene] of scenes.entries()) {
        const next = scenes[index + 1] ?? scene
        await db.query(
          `SELECT public.rpc_save_checkpoint('opportunity',$1,$2)`,
          [next.id, scene.id],
        )
        expect(await total()).toBe(totals[index])
      }
      expect(
        (
          await db.query(
            'SELECT title,summary,content_status FROM public.journal_entries',
          )
        ).rows,
      ).toEqual([
        {
          title: 'The Ancient Water of Mars',
          summary: expect.stringContaining(
            'NASA source: https://science.nasa.gov/',
          ),
          content_status: 'sourced',
        },
      ])
      expect(
        (
          await db.query(
            'SELECT achievement_id FROM public.unlocked_achievements',
          )
        ).rows,
      ).toEqual([{ achievement_id: 'opportunity-story' }])
      for (let i = 0; i < 2; i++)
        await db.query(`SELECT public.rpc_complete_mission('opportunity')`)
      expect(await total()).toBe(100)
      expect(
        (await db.query('SELECT * FROM public.xp_reward_events')).rows,
      ).toHaveLength(4)
      expect(
        (
          await db.query(
            `SELECT has_table_privilege('anon','public.mission_scene_catalog','SELECT') AS allowed`,
          )
        ).rows,
      ).toEqual([{ allowed: false }])
    } finally {
      await db.close()
    }
  }, 60000)
})
