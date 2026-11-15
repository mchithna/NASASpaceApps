# Nova companion restoration

2026-11-15. Working branch: `feature/ai`, fast-forwarded to the current local
`develop` baseline (`64b072f`). No commits or pushes were made for this repair.

The prior AI branch contained only an unused browser key configuration. There
was no companion UI, AI transport or Node service to restore. The PR #13 merge
therefore did not supply a working chatbot.

## Available now

One `AiCompanion` entry point lives in `src/ai/`. A coordinated two-line
`src/app/App.tsx` integration imports and mounts it once beneath AppProviders,
alongside the RouterProvider. Page designs, router definitions, global styles,
root packages, service contracts, engine and reward behavior are unchanged.

- A visible **Ask Nova AI** launcher on every route.
- Topic lookup and app help, explicitly labeled **source guide mode**.
- Reviewed briefings for the five existing missions; mission context selects the
  current spacecraft. Reading a briefing does not imply a chapter is playable.
- **Explain simply** selects a separately reviewed plain-language summary.
- **Space glossary** covers telemetry, atmosphere and seismometer with NASA links.
- **Live voice** has an honest unavailable explanation and a return-to-guide action.

These are fixed local source summaries, not generative AI or simulated streaming.
Unsupported questions and comparisons receive a clear limitation message.
Conversation length is bounded to 20 exchanges; question length to 500 characters.
History is in React memory only. Clear removes it; refresh, route transitions and
auth notifications remount the panel. No profile, journal, audio, credential or
conversation content is transmitted. No microphone, storage or reward API is used.

## Provider gate and remaining roadmap

Live AI text, streaming/cancel/retry, a Node service, model fallback, usage limits,
metrics and Gemini Live audio are **not implemented or enabled** by this repair.
Capabilities 6–20 from the proposed roadmap remain separate later steps.

The [Gemini API terms](https://aistudio.google.com/docs/terms), checked 2026-11-15,
exclude applications directed toward or likely accessed by under-18s. The actual
NovaExplorer audience is 10–17. The user's instruction to use our best judgment
does not establish contractual eligibility. Confirm an eligible agreement/service
for that audience and text/voice/data handling before connecting a provider.

The unused `src/config/gemini.ts` now exports only `isConfigured: false`; its
browser key accessor was removed. `.env.example` no longer instructs developers
to create `VITE_GEMINI_API_KEY`. No private environment file or key was inspected,
changed or tested. Future credentials must be server-only (e.g. `GEMINI_API_KEY`
in the isolated service), never imported by Vite. If a real key was previously
published in a browser build, rotate it through the provider console.

Keep the proposed Node/TypeScript provider service separate in `services/ai/`.
Do not add SDKs or pin speculative models until access is resolved. The existing
component accepts `{ route, missionId? }`; supplied context never scrapes page DOM.
Future generated responses must be visibly disclosed and grounded in approved
sources. Give the provider no reward/database-write tools.

## Source review

Briefings cite NASA mission pages for Surveyor 3, Spirit/Opportunity, Ingenuity,
InSight instruments and Pioneer 10. Glossary entries cite NASA Space Place,
InSight instruments and NASA's Deep Space Network explanation. URLs are stored
beside the reviewed summaries in `src/ai/knowledge.ts`, verified 2026-11-15.

## Validation

| Check | Actual result |
| --- | --- |
| `npm run typecheck` | Passed after correcting an unsupported option in a test query. |
| `npx tsc -p tsconfig.e2e.json --pretty false` | Passed. |
| `npm run lint` | Passed. |
| `npm test -- src/ai/AiCompanion.test.tsx src/app/routes.test.tsx --maxWorkers=1 --testTimeout=30000` | 10 passed. An earlier run reached the default five-second timeout; the long per-character input simulation was replaced with a single input change. |
| `npm test -- src/ai/CompanionMount.test.tsx --maxWorkers=1 --testTimeout=30000` | 1 passed: auth/route changes clear history; subscriptions clean up on unmount. |
| `npm run build` | Passed after the final CSS change. Existing large-bundle and ineffective dynamic-import warnings remain. |
| `npx playwright test e2e/ai.spec.ts --project=mobile --project=desktop` | Both test cases reported passing (375px/1280px). Initial mobile failure revealed the dev banner intercepted launcher clicks; stacking was fixed and both were rerun. Keyboard close/focus return, tools, citations, unsupported input, clearing, route presence, mission context, panel width and no provider requests were exercised. Screenshots were visually inspected. Runner shutdown stalled after reporting both passes and was interrupted; this was not a clean command exit. |
| `npx playwright test e2e/ai-production.spec.ts --project=production` | Production test reported passing: visible launcher, disclosure, glossary, NASA citation and keyboard close/focus return. Runner shutdown also stalled and was interrupted after the pass; no clean command exit. |
| Browser key exclusion | Search of `src/`, `.env.example` and final `dist/` found no `VITE_GEMINI_API_KEY` or `getGeminiApiKey` references. Private environment values were not read. |
| `git diff --check` | Passed; Git emitted line-ending conversion notices. |

The full unit/e2e suite and hosted account acceptance were not run. Live Gemini,
streaming, microphone playback and interruption cannot be verified with this
source-guide implementation. No dependency, hosted setting or player data changed.
