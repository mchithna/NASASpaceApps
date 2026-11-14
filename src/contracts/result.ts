/**
 * Shared result for every player service.
 * Implementations return this instead of throwing for expected failures.
 */

export const serviceErrorCodes = [
  'unauthenticated',
  'invalid-input',
  'not-found',
  'conflict',
  'unavailable',
] as const

export type ServiceErrorCode = (typeof serviceErrorCodes)[number]

export type ServiceError = {
  code: ServiceErrorCode
  message: string
}

export type ServiceResult<T> =
  { ok: true; data: T } | { ok: false; error: ServiceError }

export function serviceOk<T>(data: T): ServiceResult<T> {
  return { ok: true, data }
}

export function serviceError(
  code: ServiceErrorCode,
  message: string,
): ServiceResult<never> {
  return { ok: false, error: { code, message } }
}
