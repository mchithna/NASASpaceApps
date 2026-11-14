import { serviceError, type ServiceResult } from '@/contracts/result.ts'

/** Keep backend eligibility errors distinct from retryable network failures. */
export function serviceFailure<T>(message: string): ServiceResult<T> {
  const code =
    (
      ['unauthenticated', 'invalid-input', 'not-found', 'conflict'] as const
    ).find((value) => message.includes(`${value}:`)) ?? 'unavailable'
  return serviceError(code, message)
}
