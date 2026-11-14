import { defineActivity, type ActivityRegistration } from '@/engine/activityRegistry.ts'
import { EvidenceMatchActivity } from '@/engine/activities/EvidenceMatchActivity.tsx'
import { EventOrderActivity } from '@/engine/activities/EventOrderActivity.tsx'
import { PredictionChoiceActivity } from '@/engine/activities/PredictionChoiceActivity.tsx'
import {
  validateEvidenceMatchPrompt,
  validateEventOrderPrompt,
  validatePredictionPrompt,
} from '@/engine/activities/validatePrompt.ts'

export const builtinActivityRegistrations: readonly ActivityRegistration[] = [
  {
    ...defineActivity('event-order', (props) => <EventOrderActivity {...props} />),
    validatePrompt: validateEventOrderPrompt,
  },
  {
    ...defineActivity('evidence-match', (props) => (
      <EvidenceMatchActivity {...props} />
    )),
    validatePrompt: validateEvidenceMatchPrompt,
  },
  {
    ...defineActivity('prediction-choice', (props) => (
      <PredictionChoiceActivity {...props} />
    )),
    validatePrompt: validatePredictionPrompt,
  },
]
