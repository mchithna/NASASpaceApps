/**
 * Structured content for reusable activities.
 * This is training content for the engine. It is not a shared service contract.
 */

export type ActivityStep = {
  id: string
  label: string
}

export type EventOrderPrompt = {
  type: 'event-order'
  instruction: string
  steps: readonly ActivityStep[]
  correctOrder: readonly string[]
  /** Starting order. Omit it to begin with the correct order reversed. */
  initialOrder?: readonly string[]
  explanation: string
}

export type EvidenceMeaning = {
  id: string
  label: string
}

export type EvidenceCard = {
  id: string
  label: string
  meaningId: string
}

export type EvidenceMatchPrompt = {
  type: 'evidence-match'
  instruction: string
  evidence: readonly EvidenceCard[]
  meanings: readonly EvidenceMeaning[]
  explanation: string
}

export type PredictionChoice = {
  id: string
  label: string
}

export type PredictionPrompt = {
  type: 'prediction-choice'
  instruction: string
  choices: readonly PredictionChoice[]
  correctChoiceId: string
  explanation: string
}

export type ActivityPrompt = EventOrderPrompt | EvidenceMatchPrompt | PredictionPrompt

export const builtinActivityTypes = [
  'event-order',
  'evidence-match',
  'prediction-choice',
] as const

export type BuiltinActivityType = (typeof builtinActivityTypes)[number]
