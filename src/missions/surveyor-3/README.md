# Surveyor 3 — The Robot They Came Back For

Seven authored scenes: mystery, equipment introduction, landing sequence, soil
investigation, silence, Apollo 12 evidence, legacy. `index.ts` exports the chapter
for the existing package loader; no router or page redesign changes are needed.

## Interactions and rewards

| Scene | Interaction | Reward |
| --- | --- | --- |
| 1 | Read the historical photograph and investigation question | None |
| 2 | Inspect three equipment stations, then open the mission file | 20 XP |
| 3 | Reorder four events with the shared EventOrderActivity | None |
| 4 | Operate the illustrative sampler and interpret evidence | 40 XP |
| 5 | Read the operations / silence / return timeline | None |
| 6 | Identify the camera and scoop among evidence cards | 25 XP and journal entry |
| 7 | Complete the legacy scene | 15 XP and Lunar Archaeologist |

Achievement ID: `surveyor-3-story`. Discovery ID: `surveyor-3-notes`.
Activities only emit completion; they never access Supabase, award XP, calculate
rank, or append journal entries. Navigation advances after confirmed service
writes. Failed saves are retryable. Replay adds no service writes. Unfinished
activity inputs restart on resume; scene checkpoints use the platform's existing
account / tab-local guest persistence boundary.

## Coordinated engine extension

The user authorized shared changes. `SceneBase.reward` maps milestones explicitly;
chapters that omit it everywhere retain the first-kind policy. Explicit maps
require exactly one of each milestone. Optional `interaction` attaches an
investigation to a story or discovery without adding an eighth scene. It gates
Continue through the same registry, validation, completion guard and runtime.

`20261115065426_surveyor_3_chapter.sql` adds the trusted equivalent and seven scene
IDs/order/kinds. Fixed XP, ownership, locks, transactions and uniqueness remain.
Earned player rewards are retained. At the user's explicit instruction, the
follow-up `20261115070943_surveyor_3_legacy_checkpoint_archive.sql` archives the
four hosted legacy checkpoint rows and restarts their authored chapter progress.
The private archive retains the original data; XP and achievements are unchanged.

## Sources and media

Checked 2026-11-15. Scene citations link to the applicable NASA source.

- [NASA Science: Surveyor 3](https://science.nasa.gov/mission/surveyor-3/): landing,
  radar problem, sampler test counts and support findings.
- [NASA/JPL: Surveyor 3](https://www.jpl.nasa.gov/missions/surveyor-3/): instruments,
  photographs and Apollo preparation.
- [NASA: Footpads and Footprints](https://science.nasa.gov/solar-system/moon/footpads-and-footprints-humans-and-machine-meet-on-the-moon/):
  last contact, lunar night, returned hardware and surviving lander.
- [NASA: Apollo 12 Makes a Pinpoint Landing](https://www.nasa.gov/history/55-years-ago-apollo-12-makes-a-pinpoint-landing-on-the-moon/):
  moonwalk, hardware recovery, exposure analysis and original photograph.
- [NASA Historical Data Book, Volume II](https://www.nasa.gov/wp-content/uploads/2023/04/sp-4012v2.pdf):
  spacecraft systems and landing legs.

`public/assets/missions/surveyor-3/apollo-12-visit.jpg` is the unmodified NASA /
Apollo 12 crew photograph AS12-48-7133. Pete Conrad is beside Surveyor 3; Intrepid
is in the background. [Original image](https://www.nasa.gov/wp-content/uploads/2024/11/apollo-12-19-eva2-conrad-at-surveyor-3-as12-48-7133hr.jpg).
Credit and alternative text appear in the player. No generated NASA art was added.
The existing cover.svg remains a placeholder, not historical evidence.

The sampler is labeled as an instructional simulation, not recorded motion or
measured physics. Academy instructions are explicitly labeled. The precise
November visit day is omitted because the consulted NASA pages differ.

## Validation and limits

`chapter.test.tsx` covers the journey, incorrect answers, failed save retry,
resume, XP timing, sourced discovery, completion and replay. `backend.test.ts`
executes real migrations in embedded PostgreSQL to check manifest parity, early
reward denial and idempotency. `e2e/surveyor.spec.ts` runs the chapter with the
development-only acceptance fixture at mobile/tablet/desktop widths; API calls
are blocked. It checks refresh and dashboard/journal/achievement reads.
See `docs/SURVEYOR_3_IMPLEMENTATION.md` for recorded results and hosted status.

Hosted JWT/API, independent-connection contention and registered-browser
acceptance remain open foundation gates. This chapter does not freeze the
foundation or implement another mission or AI capability.

Ignored `.env` now uses server-only `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, and
`GEMINI_API_KEY_3`. Only the first has a value. No key validity, model access,
rotation or voice checks were made. Production AI still requires confirmed
audience eligibility.
