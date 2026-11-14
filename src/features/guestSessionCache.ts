/** Tab-local guest/offline state. Never stores credentials or trusted account totals. */
export function readGuestCache(
  explorerId: string,
  area: 'progress' | 'rewards',
): unknown {
  try {
    const raw = sessionStorage.getItem(
      `novaexplorer:guest:v1:${explorerId}:${area}`,
    )
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

export function writeGuestCache(
  explorerId: string,
  area: 'progress' | 'rewards',
  value: unknown,
): boolean {
  try {
    sessionStorage.setItem(
      `novaexplorer:guest:v1:${explorerId}:${area}`,
      JSON.stringify(value),
    )
    return true
  } catch {
    return false
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
