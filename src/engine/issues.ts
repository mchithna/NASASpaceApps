/**
 * Authoring and playback problems for the mission engine.
 * These are not service errors. Service calls still return `ServiceResult`.
 */

export const engineIssueCodes = [
  'empty-sequence',
  'malformed-scene',
  'duplicate-scene-id',
  'invalid-scene-id',
  'unknown-scene-kind',
  'empty-title',
  'empty-body',
  'invalid-narration',
  'missing-citation',
  'unknown-source',
  'duplicate-source',
  'invalid-activity-id',
  'duplicate-activity-id',
  'invalid-activity-type',
  'invalid-activity-config',
  'invalid-discovery-id',
  'duplicate-discovery-id',
  'introduction-not-first',
  'missing-activity',
  'missing-discovery',
  'missing-ending',
  'multiple-endings',
  'ending-not-last',
  'unknown-scene',
  'mission-mismatch',
  'invalid-progress',
  'unknown-activity',
  'duplicate-activity-type',
  'not-started',
  'already-started',
  'locked',
  'out-of-order',
  'activity-incomplete',
  'scene-incomplete',
  'at-end',
  'at-start',
] as const

export type EngineIssueCode = (typeof engineIssueCodes)[number]

/**
 * `sceneId` is for authors and tests.
 * Learner-facing copy should use `message`, which does not repeat raw ids.
 */
export type EngineIssue = {
  code: EngineIssueCode
  sceneId: string | null
  message: string
}

export type EngineResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: readonly EngineIssue[] }

export function engineIssue(
  code: EngineIssueCode,
  sceneId: string | null,
  message: string,
): EngineIssue {
  return { code, sceneId, message }
}
