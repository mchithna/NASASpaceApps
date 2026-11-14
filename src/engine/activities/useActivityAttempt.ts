import { useRef, useState } from 'react'

export function useKeyedState<T>(
  identity: string,
  create: () => T,
): [T, (value: T) => void] {
  const [state, setState] = useState(() => ({ identity, value: create() }))

  if (state.identity !== identity) {
    const value = create()
    setState({ identity, value })
    return [value, (next) => setState({ identity, value: next })]
  }

  return [state.value, (next) => setState({ identity, value: next })]
}

export type AttemptPhase = 'idle' | 'incorrect' | 'correct'

/**
 * Local attempt state for one activity visit.
 * A correct check notifies the player once. A wrong check stays retryable.
 */
export function useActivityAttempt(
  identity: string,
  locked: boolean,
): {
  phase: AttemptPhase
  inputsLocked: boolean
  miss: () => void
  succeed: (onComplete: () => void) => void
} {
  const sent = useRef(false)
  const identityRef = useRef(identity)
  const [phase, setPhase] = useState<AttemptPhase>(locked ? 'correct' : 'idle')

  if (identityRef.current !== identity) {
    identityRef.current = identity
    sent.current = false
    setPhase(locked ? 'correct' : 'idle')
  }

  function miss(): void {
    if (locked || phase === 'correct') {
      return
    }

    setPhase('incorrect')
  }

  function succeed(onComplete: () => void): void {
    setPhase('correct')
    if (sent.current || locked) {
      return
    }

    sent.current = true
    onComplete()
  }

  return {
    phase: locked ? 'correct' : phase,
    inputsLocked: locked || phase === 'correct',
    miss,
    succeed,
  }
}
