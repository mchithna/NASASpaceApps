/**
 * Stable ids for checkpoints, discoveries, and other engine keys.
 * Mission ids stay in `src/missions/types.ts` and are not repeated here.
 */

const stableKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const stableKeyMaxLength = 64

/** Lowercase kebab-case, 1–64 characters. Rejects paths and mixed case. */
export function isStableKey(value: string): boolean {
  return (
    value.length >= 1 &&
    value.length <= stableKeyMaxLength &&
    stableKeyPattern.test(value)
  )
}
