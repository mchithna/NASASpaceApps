# Supabase database setup

Date: 2026-11-15. Target: `ptjvlycaiigigdrcybet` (NovaExplorer, NOVA connection),
PostgreSQL 17, region `ap-northeast-2`, status `ACTIVE_HEALTHY` at inspection.
The user explicitly selected this project for database setup. It was **not**
designated an isolated test environment. No sample catalog, test accounts, reward
fixtures, destructive operations, row resets, or production gameplay were created.

## Applied setup

The original five player tables, three migrations and real records already existed.
Inspected tables, indexes, policies, function metadata, migration history, aggregate
integrity, and security/performance/health advisors before changing the schema.
Applied the missing reviewed repository migrations with Supabase `apply_migration`,
then a new tracked performance/constraint-validation migration. All three succeeded.

| Repository migration | Hosted version / name |
| --- | --- |
| `20261114000000_player_systems.sql` (already deployed) | `20261114172037` / `player_systems` |
| `20261114170000_player_systems_access.sql` (already deployed) | `20261114172215` / `player_systems_access` |
| `20261114180000_player_systems_search_path.sql` (already deployed) | `20261114172312` / `player_systems_search_path` |
| `20261114190549_mission_engine_boundary.sql` | `20261115012502` / `mission_engine_boundary` |
| `20261114195728_security_hardening.sql` | `20261115012514` / `security_hardening` |
| `20261115012727_policy_performance_validation.sql` | `20261115012903` / `policy_performance_validation` |

Hosted versions are assigned by the connector, so they differ from local filenames.
Do not blindly run `supabase db push` against this project: first review/reconcile
the ledger mapping through an integration-owned workflow. No history repair was run.

The mission boundary adds the trusted scene catalog and validated checkpoint,
milestone, discovery, achievement and atomic completion RPCs. Identity comes from
`auth.uid()`, XP is fixed at 20/40/25/15, and direct outcome writes are revoked.
The security migration limits profile columns and excludes anonymous sessions from
private registered-player rows. The new migration caches request-level Auth policy
lookups with scalar SELECTs, makes legacy write policies explicitly false, restricts
catalog reads to registered identities, and validates the two previously NOT VALID
constraints. Preflight found zero violations; validation rewrote no player rows.

## Verification actually performed

- RLS enabled on all six public application tables.
- All five outcome RPCs executable by `authenticated`, not `anon`.
- Read-only, transaction-local SQL role/claim assertions passed: an unrelated identity
  saw zero profiles/progress/rewards; an owner saw its own profile; an anonymous
  identity saw zero profiles and could not grant rewards. Direct progress/reward
  writes and profile XP updates are not granted to the client role.
- A rolled-back deny-only SQL batch passed for invalid mission and milestone,
  forged discovery/achievement, undefined checkpoint and unpublished completion.
  These tests used transaction-local claims and existing ownership without exposing
  personal values or committing any writes. They do **not** validate JWT signatures
  or exercise real Auth/Data API requests.
- Final counts preserved: four profiles, four progress rows, one XP event, zero
  achievements, zero journal entries. Catalog: zero rows. No inconsistent XP totals.
- `profile_nickname_characters` and `canonical_reward_policy`: validated on existing
  rows. Existing nickname policy remains the prior ASCII policy; this setup did not
  redesign nickname rules.
- Post-change performance advisor: no findings. Health advisor: no findings.
- `npm test -- --maxWorkers=1 --testTimeout=30000 src/features/missionBackend.integration.test.ts`:
  **7 passed**, exit 0, after adding the new constraint/legacy-policy assertion.
  An earlier run before that assertion passed six tests. Both use embedded PGlite,
  actual migrations and synthetic users, without an external database connection.
- `npm run lint`: passed, exit 0. `npm run typecheck`: passed, exit 0.
- `git diff --check`: passed before the final documentation additions.
- Supabase CLI generated the new migration file. Initial sandbox `npx --no-install`
  stalled and was interrupted; elevated `npx --yes supabase migration new
  policy_performance_validation` succeeded. No dependency was added.
- Build, full unit suite and Playwright were not rerun: no shipped UI/runtime code
  changed. Prior acceptance results are historical, not a new live journey.

## Remaining advisories and limits

1. **Leaked-password protection is disabled.** This is an Auth configuration setting,
   not application SQL; the connector exposes no Auth-settings update tool. Enable
   it in the project's Auth settings if available on the plan. See
   [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
2. Five authenticated SECURITY DEFINER warnings remain intentionally visible for
   the public player RPCs. They need privileged writes because client table writes
   are forbidden. Input, ownership, eligibility, fixed rewards and search paths are
   checked. Do not switch them to INVOKER or revoke authenticated execution merely
   to clear warnings; that breaks the real service boundary. See
   [the function-exposure advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
3. The anonymous-policy advisor still flags `mission_progress_update_own`, although
   both USING and WITH CHECK are literally false and client table UPDATE is revoked.
   This warning does not establish an executable write path; retain it in the review
   record rather than weakening policies to silence the checker. See
   [the anonymous-policy advisor](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins).
4. The empty catalog is deliberate: all five factual chapters are still unbuilt.
   Registered checkpoint/reward requests fail closed until reviewed manifests are
   published by the integration owner. Never publish training manifests here.
5. Client assertions do not prove activity solving or reading. Guest local storage
   is editable and does not merge into registered totals. These trust limits remain.
6. Independent-connection contention, hosted JWT/API verification and the full real
   registered browser journey still require an explicitly isolated test project.
   No foundation freeze or production-readiness claim follows from this setup.

Consulted current Supabase MCP documentation for
[RLS and policy performance](https://supabase.com/docs/guides/database/postgres/row-level-security)
and intentional SECURITY DEFINER exposure. Fetching the required changelog Markdown
index failed with an unsupported-content-type error; no changelog verification is
claimed. No unrelated SQL examples from documentation were executed.

The earlier reports' empty-connector/undeployed-migration statements describe their
historical checks. This setup supersedes those facts for this specific project;
it does not close the remaining live acceptance/security gates.

Next: enable leaked-password protection, then designate an isolated test project
for the remaining real Auth/API, contention and browser acceptance checks.
