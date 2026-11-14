/**
 * Visible wording for narration and framing.
 * Academy, hypothetical, and simulation copy is never called a NASA quotation.
 */

import type { NarrationKind, SceneFraming } from '@/engine/scenes.ts'
import { isSceneFraming, sceneFramingLabels } from '@/engine/scenes.ts'

export function readFraming(value: string | undefined): SceneFraming | undefined {
  if (value === undefined || !isSceneFraming(value)) {
    return undefined
  }

  return value
}

export function framingNote(
  narration: NarrationKind,
  framing: SceneFraming | undefined,
): string {
  if (framing === 'simulation') {
    return 'Simulation. The values on this scene are not NASA measurements.'
  }

  if (framing === 'hypothetical') {
    return 'Hypothetical. This is not a NASA event or a NASA quotation.'
  }

  if (framing === 'factual') {
    return 'Marked factual. A source link appears only when this mission supplies a usable address. This scene text is not labeled as a NASA quotation.'
  }

  if (narration === 'academy') {
    return 'This text is academy narration. It is not a NASA quotation.'
  }

  if (narration === 'mixed') {
    return 'The scene text is academy narration. It is not a NASA quotation. A link is a NASA source only when the mission supplied one.'
  }

  return 'A NASA source is linked only when this mission supplied a usable address. This scene text is not labeled as a NASA quotation.'
}

export function framingBadge(framing: SceneFraming | undefined): string | null {
  if (!framing) {
    return null
  }

  return sceneFramingLabels[framing]
}
