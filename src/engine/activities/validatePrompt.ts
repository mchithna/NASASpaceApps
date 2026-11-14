/**
 * Checks reusable activity content before a scene can be played.
 * Learner-facing messages do not repeat raw ids.
 */

import { isStableKey } from '@/contracts/ids.ts'
import {
  engineIssue,
  type EngineIssue,
} from '@/engine/issues.ts'
import type { ActivityScene } from '@/engine/scenes.ts'
import type {
  EvidenceMatchPrompt,
  EventOrderPrompt,
  PredictionPrompt,
} from '@/engine/activities/prompts.ts'

function issue(sceneId: string | null): EngineIssue {
  return engineIssue(
    'invalid-activity-config',
    sceneId,
    'This activity is missing information it needs.',
  )
}

function uniqueStableIds(
  ids: readonly string[],
  sceneId: string | null,
  issues: EngineIssue[],
): boolean {
  const seen = new Set<string>()
  let valid = true

  for (const id of ids) {
    if (!isStableKey(id) || seen.has(id)) {
      issues.push(issue(sceneId))
      valid = false
      continue
    }

    seen.add(id)
  }

  return valid
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  const seen = new Set(left)
  return right.every((id) => seen.has(id))
}

export function validateEventOrderPrompt(
  scene: Pick<ActivityScene, 'id' | 'prompt'>,
): EngineIssue[] {
  const prompt = scene.prompt
  if (!prompt || prompt.type !== 'event-order') {
    return [issue(scene.id)]
  }

  return eventOrderIssues(scene.id, prompt)
}

function eventOrderIssues(
  sceneId: string,
  prompt: EventOrderPrompt,
): EngineIssue[] {
  const issues: EngineIssue[] = []
  if (prompt.instruction.trim() === '' || prompt.explanation.trim() === '') {
    issues.push(issue(sceneId))
  }

  if (prompt.steps.length < 2) {
    issues.push(issue(sceneId))
  }

  const stepIds = prompt.steps.map((step) => step.id)
  const idsAreValid = uniqueStableIds(stepIds, sceneId, issues)
  if (prompt.steps.some((step) => step.label.trim() === '')) {
    issues.push(issue(sceneId))
  }

  if (!idsAreValid || !sameIds(stepIds, prompt.correctOrder)) {
    issues.push(issue(sceneId))
  }

  if (prompt.initialOrder && !sameIds(stepIds, prompt.initialOrder)) {
    issues.push(issue(sceneId))
  }

  return issues
}

export function validateEvidenceMatchPrompt(
  scene: Pick<ActivityScene, 'id' | 'prompt'>,
): EngineIssue[] {
  const prompt = scene.prompt
  if (!prompt || prompt.type !== 'evidence-match') {
    return [issue(scene.id)]
  }

  return evidenceIssues(scene.id, prompt)
}

function evidenceIssues(
  sceneId: string,
  prompt: EvidenceMatchPrompt,
): EngineIssue[] {
  const issues: EngineIssue[] = []
  if (prompt.instruction.trim() === '' || prompt.explanation.trim() === '') {
    issues.push(issue(sceneId))
  }

  if (prompt.evidence.length < 2 || prompt.meanings.length < 2) {
    issues.push(issue(sceneId))
  }

  const evidenceIds = prompt.evidence.map((card) => card.id)
  const meaningIds = prompt.meanings.map((meaning) => meaning.id)
  const evidenceOk = uniqueStableIds(evidenceIds, sceneId, issues)
  const meaningOk = uniqueStableIds(meaningIds, sceneId, issues)
  const knownMeanings = new Set(meaningIds)

  if (
    prompt.evidence.some(
      (card) => card.label.trim() === '' || !knownMeanings.has(card.meaningId),
    ) ||
    prompt.meanings.some((meaning) => meaning.label.trim() === '')
  ) {
    issues.push(issue(sceneId))
  }

  if (!evidenceOk || !meaningOk) {
    issues.push(issue(sceneId))
  }

  return issues
}

export function validatePredictionPrompt(
  scene: Pick<ActivityScene, 'id' | 'prompt'>,
): EngineIssue[] {
  const prompt = scene.prompt
  if (!prompt || prompt.type !== 'prediction-choice') {
    return [issue(scene.id)]
  }

  return predictionIssues(scene.id, prompt)
}

function predictionIssues(
  sceneId: string,
  prompt: PredictionPrompt,
): EngineIssue[] {
  const issues: EngineIssue[] = []
  if (prompt.instruction.trim() === '' || prompt.explanation.trim() === '') {
    issues.push(issue(sceneId))
  }

  if (prompt.choices.length < 2) {
    issues.push(issue(sceneId))
  }

  const choiceIds = prompt.choices.map((choice) => choice.id)
  const idsAreValid = uniqueStableIds(choiceIds, sceneId, issues)
  if (
    prompt.choices.some((choice) => choice.label.trim() === '') ||
    !idsAreValid ||
    !choiceIds.includes(prompt.correctChoiceId)
  ) {
    issues.push(issue(sceneId))
  }

  return issues
}
