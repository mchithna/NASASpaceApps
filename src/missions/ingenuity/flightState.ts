export const stages = [
  'ready',
  'spin-up',
  'takeoff',
  'hover',
  'descent',
  'landed',
] as const
type FlightStage = (typeof stages)[number]
type FlightAction = { type: 'advance' } | { type: 'finish' } | { type: 'reset' }
export function flightReducer(
  stage: FlightStage,
  action: FlightAction,
): FlightStage {
  if (action.type === 'reset') return 'ready'
  if (action.type === 'finish') return stage === 'ready' ? stage : 'landed'
  return stages[Math.min(stages.indexOf(stage) + 1, stages.length - 1)]!
}
