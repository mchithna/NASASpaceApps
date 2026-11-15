/** Reject privileged keys without including their contents in errors/logs. */
export function assertPublicSupabaseKey(value: string): void {
  const key = value.trim()
  if (key.startsWith('sb_secret_'))
    throw new Error(
      'Privileged Supabase keys cannot be used in client configuration.',
    )
  const payload = key.split('.')[1]
  if (!payload) return
  try {
    const decoded: unknown = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    )
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'role' in decoded &&
      decoded.role === 'service_role'
    ) {
      throw new Error(
        'Privileged Supabase keys cannot be used in client configuration.',
      )
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('Privileged Supabase')
    )
      throw error
  }
}
