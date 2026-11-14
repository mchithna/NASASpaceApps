// Embedded PostgreSQL only. No URL, key, network, or production cleanup.
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SupabaseClient } from '@/features/auth/supabaseClient.ts'
import { createAuthService } from '@/features/auth/authService.ts'
import { createProgressService } from '@/features/progress/progressService.ts'
import { createRewardsService } from '@/features/achievements/rewardsService.ts'

const user = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
let db: PGlite
const migrations = import.meta.glob<string>('../../supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

async function scalar(sql: string): Promise<number> {
  const result = await db.query<{ value: number }>(sql)
  return result.rows[0]!.value
}

/** Real Phase 2 services, with transport pointed exclusively at embedded SQL. */
class TestDatabaseClient extends SupabaseClient {
  constructor() {
    super({
      supabaseUrl: 'https://isolated-test.invalid',
      supabaseAnonKey: 'test-only',
    })
  }
  override async rpc<T>(name: string, args: Record<string, unknown> = {}) {
    if (
      !/^rpc_(save_checkpoint|complete_mission|grant_milestone|unlock_discovery|unlock_achievement)$/.test(
        name,
      )
    ) {
      throw new Error('Unexpected test RPC')
    }
    const parameters = Object.keys(args)
    if (parameters.some((key) => !/^p_[a-z_]+$/.test(key)))
      throw new Error('Unexpected parameter')
    try {
      const result = await db.query<{ result: T }>(
        `SELECT public.${name}(${parameters.map((key, index) => `${key} => $${index + 1}`).join(',')}) AS result`,
        Object.values(args),
      )
      return { data: result.rows[0]!.result, error: null }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'SQL failed',
        },
      }
    }
  }
  override async query<T>(endpoint: string) {
    if (!endpoint.startsWith('mission_progress?'))
      throw new Error('Unexpected test query')
    const mission = new URLSearchParams(endpoint.split('?')[1])
      .get('mission_id')
      ?.slice(3)
    const result = await db.query(
      `SELECT * FROM public.mission_progress WHERE mission_id = $1`,
      [mission],
    )
    return { data: result.rows as T, error: null }
  }
}

describe('trusted mission flow in isolated PostgreSQL', () => {
  beforeAll(async () => {
    db = new PGlite()
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
      CREATE TABLE auth.users(id uuid PRIMARY KEY);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
        'SELECT nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
      CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS
        'SELECT coalesce(nullif(current_setting(''request.jwt.claims'',true),''''),''{}'')::jsonb';
      GRANT USAGE ON SCHEMA auth TO authenticated,anon;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated,anon;`)
    for (const file of Object.keys(migrations).sort()) {
      await db.exec(migrations[file]!)
    }
    await db.exec(`INSERT INTO auth.users VALUES ('${user}'),('${other}');
      INSERT INTO public.profiles(id,nickname,avatar_id) VALUES
        ('${user}','Test Cadet','cadet-1'),('${other}','Other Cadet','cadet-1');
      INSERT INTO public.mission_scene_catalog(mission_id,scene_id,position,kind,discovery_id,discovery_title,discovery_summary,content_status) VALUES
        ('surveyor-3','test-intro',1,'story',NULL,NULL,NULL,NULL),
        ('surveyor-3','test-activity',2,'activity',NULL,NULL,NULL,NULL),
        ('surveyor-3','test-discovery',3,'discovery','test-note','Test only','Simulation; not NASA data','placeholder'),
        ('surveyor-3','test-ending',4,'ending',NULL,NULL,NULL,NULL);
      SET ROLE authenticated;
      SELECT set_config('request.jwt.claim.sub','${user}',false);`)
  }, 60000)
  afterAll(async () => {
    await db?.close()
  })

  it('rejects unpublished missions, unsafe/unknown scenes, and premature rewards', async () => {
    await expect(
      db.query(
        `SELECT public.rpc_save_checkpoint('training-simulator','test-intro')`,
      ),
    ).rejects.toThrow('Unknown chapter checkpoint')
    await expect(
      db.query(`SELECT public.rpc_save_checkpoint('opportunity','test-intro')`),
    ).rejects.toThrow('Unknown chapter checkpoint')
    await expect(
      db.query(
        `SELECT public.rpc_save_checkpoint('surveyor-3','undefined-scene')`,
      ),
    ).rejects.toThrow('Unknown chapter checkpoint')
    await expect(
      db.query(`SELECT public.rpc_grant_milestone('surveyor-3','activity')`),
    ).rejects.toThrow('Finish the eligible scene')
    await expect(
      db.query(
        `SELECT public.rpc_grant_milestone('surveyor-3','arbitrary-xp')`,
      ),
    ).rejects.toThrow('Unknown mission or milestone')
    await expect(
      db.query(`SELECT public.rpc_save_checkpoint('surveyor-3','test-ending')`),
    ).rejects.toThrow('still locked')
    expect(
      await scalar(
        `SELECT count(*)::int AS value FROM public.mission_progress`,
      ),
    ).toBe(0)
  })

  it('starts, checkpoints and resumes partial progress with fixed, idempotent rewards', async () => {
    await db.query(
      `SELECT public.rpc_save_checkpoint('surveyor-3','test-intro')`,
    )
    expect(await scalar(`SELECT total_xp AS value FROM public.profiles`)).toBe(
      0,
    )
    await Promise.all(
      Array.from({ length: 8 }, () =>
        db.query(
          `SELECT public.rpc_save_checkpoint('surveyor-3','test-activity','test-intro')`,
        ),
      ),
    )
    expect(await scalar(`SELECT total_xp AS value FROM public.profiles`)).toBe(
      20,
    )
    const resumed = await db.query<{
      current_checkpoint_id: string
      completed_checkpoint_ids: string[]
    }>(
      `SELECT current_checkpoint_id,completed_checkpoint_ids FROM public.mission_progress`,
    )
    expect(resumed.rows[0]).toEqual({
      current_checkpoint_id: 'test-activity',
      completed_checkpoint_ids: ['test-intro'],
    })
    await expect(
      db.query(
        `SELECT public.rpc_save_checkpoint('surveyor-3','test-ending','test-discovery')`,
      ),
    ).rejects.toThrow('earlier scenes')
    await expect(
      db.query(`SELECT public.rpc_complete_mission('surveyor-3')`),
    ).rejects.toThrow('Finish all chapter scenes')
    await expect(
      db.query(`SELECT public.rpc_unlock_achievement('surveyor-3-story')`),
    ).rejects.toThrow('Finish the mission')
    await expect(
      db.query(
        `INSERT INTO public.mission_progress(user_id,mission_id) VALUES ('${user}','insight')`,
      ),
    ).rejects.toThrow('permission denied')
    await expect(
      db.query(
        `INSERT INTO public.journal_entries(user_id,mission_id,discovery_id,title,summary) VALUES ('${user}','surveyor-3','fake','Fake','Fake')`,
      ),
    ).rejects.toThrow('permission denied')
  })

  it('commits discovery, ending, final XP, and achievement, then survives repeats and replay', async () => {
    await db.query(
      `SELECT public.rpc_save_checkpoint('surveyor-3','test-discovery','test-activity')`,
    )
    await db.query(
      `SELECT public.rpc_save_checkpoint('surveyor-3','test-ending','test-discovery')`,
    )
    expect(await scalar(`SELECT total_xp AS value FROM public.profiles`)).toBe(
      85,
    )
    expect(
      await scalar(`SELECT count(*)::int AS value FROM public.journal_entries`),
    ).toBe(1)
    // Force the last write to fail after completion/legacy changes to prove rollback.
    await db.exec(`RESET ROLE; CREATE FUNCTION public.test_failure() RETURNS trigger LANGUAGE plpgsql AS
      'BEGIN RAISE EXCEPTION ''test failure''; END';
      CREATE TRIGGER test_failure BEFORE INSERT ON public.unlocked_achievements FOR EACH ROW EXECUTE FUNCTION public.test_failure();
      SET ROLE authenticated;`)
    await expect(
      db.query(
        `SELECT public.rpc_save_checkpoint('surveyor-3','test-ending','test-ending')`,
      ),
    ).rejects.toThrow('test failure')
    expect(await scalar(`SELECT total_xp AS value FROM public.profiles`)).toBe(
      85,
    )
    expect(
      await scalar(
        `SELECT count(*)::int AS value FROM public.mission_progress WHERE status = 'completed'`,
      ),
    ).toBe(0)
    await db.exec(
      `RESET ROLE; ALTER TABLE public.unlocked_achievements DISABLE TRIGGER test_failure; SET ROLE authenticated;`,
    )
    await db.query(
      `SELECT public.rpc_save_checkpoint('surveyor-3','test-ending','test-ending')`,
    )
    await Promise.all(
      Array.from({ length: 8 }, () =>
        db.query(`SELECT public.rpc_complete_mission('surveyor-3')`),
      ),
    )
    await db.query(
      `SELECT public.rpc_save_checkpoint('surveyor-3','test-intro')`,
    )
    await db.query(
      `SELECT public.rpc_unlock_discovery('surveyor-3','test-note')`,
    )
    expect(await scalar(`SELECT total_xp AS value FROM public.profiles`)).toBe(
      100,
    )
    expect(
      await scalar(
        `SELECT count(*)::int AS value FROM public.xp_reward_events`,
      ),
    ).toBe(4)
    expect(
      await scalar(
        `SELECT count(*)::int AS value FROM public.unlocked_achievements`,
      ),
    ).toBe(1)
    expect(
      await scalar(`SELECT count(*)::int AS value FROM public.journal_entries`),
    ).toBe(1)
  })

  it('scopes reads and writes to identity and rejects anonymous rewards', async () => {
    await db.query(
      `SELECT set_config('request.jwt.claim.sub','${other}',false)`,
    )
    expect(
      await scalar(
        `SELECT count(*)::int AS value FROM public.mission_progress`,
      ),
    ).toBe(0)
    await expect(
      db.query(`SELECT public.rpc_grant_milestone('surveyor-3','legacy')`),
    ).rejects.toThrow('Finish the eligible scene')
    await db.query(
      `SELECT set_config('request.jwt.claims','{"is_anonymous":true}',false)`,
    )
    await expect(
      db.query(`SELECT public.rpc_save_checkpoint('surveyor-3','test-intro')`),
    ).rejects.toThrow('registered explorer')
  })

  it('runs the Phase 2 service boundary through the real SQL functions and reloads persisted state', async () => {
    await db.exec(`SELECT set_config('request.jwt.claim.sub','${other}',false);
      SELECT set_config('request.jwt.claims','{}',false);`)
    const client = new TestDatabaseClient()
    const auth = createAuthService({
      client,
      initialSession: {
        status: 'authenticated',
        identity: { explorerId: other, kind: 'registered' },
      },
    })
    const rewards = createRewardsService({ auth, client })
    const progress = createProgressService({ auth, rewards, client })
    const bad = await progress.saveCheckpoint({
      missionId: 'surveyor-3',
      checkpointId: 'not-defined',
    })
    expect(!bad.ok && bad.error.code).toBe('invalid-input')
    for (const [checkpointId, completedCheckpointId] of [
      ['test-intro', undefined],
      ['test-activity', 'test-intro'],
      ['test-discovery', 'test-activity'],
      ['test-ending', 'test-discovery'],
      ['test-ending', 'test-ending'],
    ]) {
      const saved = await progress.saveCheckpoint({
        missionId: 'surveyor-3',
        checkpointId: checkpointId!,
        completedCheckpointId,
      })
      expect(saved.ok).toBe(true)
    }
    const recreated = createProgressService({ auth, client })
    const loaded = await recreated.getMissionProgress('surveyor-3')
    expect(loaded.ok && loaded.data.status).toBe('completed')
    const completed = await recreated.completeMission({
      missionId: 'surveyor-3',
    })
    expect(completed.ok && completed.data.reward.rank.totalXp).toBe(100)
    const duplicate = await rewards.grantMilestone({
      missionId: 'surveyor-3',
      milestoneId: 'activity',
    })
    expect(duplicate.ok && duplicate.data.xpAwarded).toBe(0)
    const discovery = await rewards.unlockDiscovery({
      missionId: 'surveyor-3',
      discoveryId: 'test-note',
    })
    expect(discovery.ok && discovery.data.awarded).toBe(false)
  })
})
