/**
 * Lightweight, zero-dependency Supabase client adapter.
 * Uses standard Fetch API to interact with Supabase GoTrue Auth and PostgREST REST APIs.
 * Does not store passwords or service-role keys.
 */

export type SupabaseConfig = {
  supabaseUrl: string
  supabaseAnonKey: string
}

export type AuthUser = {
  id: string
  email?: string
  is_anonymous?: boolean
  created_at?: string
}

export type SupabaseSession = {
  access_token: string
  token_type: string
  expires_in?: number
  expires_at?: number
  refresh_token: string
  user: AuthUser
}

export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'INITIAL_SESSION'

export type SupabaseAuthListener = (
  event: AuthChangeEvent,
  session: SupabaseSession | null,
) => void

/**
 * Publishable keys are preferred. The legacy anon key is accepted so an
 * existing local environment file keeps working.
 * Unit tests ignore Vite env values so they do not call a hosted project.
 */
export function resolveSupabaseApiKey(
  publishable: string | undefined,
  legacyAnon: string | undefined,
): string {
  const modern = (publishable ?? '').trim()
  if (modern.length > 0) {
    return modern
  }
  return (legacyAnon ?? '').trim()
}

/**
 * The publishable key is not a JWT, so it belongs on `apikey` only.
 * A legacy anon key is a JWT and stays on both headers.
 * A signed-in request sends the explorer access token, never the API key, as the bearer token.
 */
export function buildApiHeaders(
  apiKey: string,
  accessToken?: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
    return headers
  }

  if (apiKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  return headers
}

export function getSupabaseConfig(): SupabaseConfig {
  if (import.meta.env.MODE === 'test') {
    return { supabaseUrl: '', supabaseAnonKey: '' }
  }

  const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL ?? '').trim()
  const supabaseAnonKey = resolveSupabaseApiKey(
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY,
    import.meta.env?.VITE_SUPABASE_ANON_KEY,
  )

  return { supabaseUrl, supabaseAnonKey }
}

const sessionStoragePrefix = 'novaexplorer.auth.session:'

function sessionStorageKey(url: string): string {
  return `${sessionStoragePrefix}${url}`
}

function readStoredSession(url: string): SupabaseSession | null {
  if (url.length === 0 || typeof localStorage === 'undefined') {
    return null
  }

  try {
    const raw = localStorage.getItem(sessionStorageKey(url))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<SupabaseSession>
    if (!parsed.access_token || !parsed.refresh_token || !parsed.user?.id) {
      localStorage.removeItem(sessionStorageKey(url))
      return null
    }
    return {
      access_token: parsed.access_token,
      token_type: parsed.token_type || 'bearer',
      expires_in: parsed.expires_in,
      expires_at: parsed.expires_at,
      refresh_token: parsed.refresh_token,
      user: parsed.user,
    }
  } catch {
    return null
  }
}

function sessionFromAuthPayload(payload: {
  access_token?: string
  token_type?: string
  expires_in?: number
  expires_at?: number
  refresh_token?: string
  user?: AuthUser
} | null): SupabaseSession | null {
  if (!payload?.access_token || !payload.refresh_token || !payload.user?.id) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: payload.access_token,
    token_type: payload.token_type ?? 'bearer',
    expires_in: payload.expires_in,
    expires_at: payload.expires_at ?? now + (payload.expires_in ?? 3600),
    refresh_token: payload.refresh_token,
    user: payload.user,
  }
}

function writeStoredSession(url: string, session: SupabaseSession | null): void {
  if (url.length === 0 || typeof localStorage === 'undefined') {
    return
  }

  const key = sessionStorageKey(url)
  if (!session) {
    localStorage.removeItem(key)
    return
  }

  localStorage.setItem(key, JSON.stringify(session))
}

export class SupabaseClient {
  private url: string
  private anonKey: string
  private currentSession: SupabaseSession | null = null
  private listeners = new Set<SupabaseAuthListener>()

  constructor(config?: Partial<SupabaseConfig>) {
    const envConfig = getSupabaseConfig()
    this.url = (config?.supabaseUrl ?? envConfig.supabaseUrl).replace(/\/+$/, '')
    this.anonKey = config?.supabaseAnonKey ?? envConfig.supabaseAnonKey
    this.currentSession = readStoredSession(this.url)
  }

  get isConfigured(): boolean {
    return Boolean(this.url && this.anonKey)
  }

  setSession(session: SupabaseSession | null, event: AuthChangeEvent = 'SIGNED_IN'): void {
    this.currentSession = session
    writeStoredSession(this.url, session)
    for (const listener of this.listeners) {
      try {
        listener(event, session)
      } catch (err) {
        console.error('Error in auth listener:', err)
      }
    }
  }

  getSession(): SupabaseSession | null {
    return this.currentSession
  }

  onAuthStateChange(listener: SupabaseAuthListener): { unsubscribe: () => void } {
    this.listeners.add(listener)
    return {
      unsubscribe: () => {
        this.listeners.delete(listener)
      },
    }
  }

  /**
   * Refreshes a stored session when it is near expiry.
   * Returns null when there is no session or the refresh token is rejected.
   */
  async ensureFreshSession(): Promise<SupabaseSession | null> {
    const current = this.currentSession
    if (!current) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    if (current.expires_at === undefined || current.expires_at > now + 60) {
      return current
    }

    if (!this.isConfigured) {
      this.setSession(null, 'SIGNED_OUT')
      return null
    }

    try {
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: buildApiHeaders(this.anonKey),
        body: JSON.stringify({ refresh_token: current.refresh_token }),
      })
      const json = await res.json()
      if (!res.ok || !json.access_token || !json.refresh_token || !json.user) {
        this.setSession(null, 'SIGNED_OUT')
        return null
      }

      const session: SupabaseSession = {
        access_token: json.access_token,
        token_type: json.token_type ?? 'bearer',
        expires_in: json.expires_in,
        expires_at: json.expires_at ?? now + (json.expires_in ?? 3600),
        refresh_token: json.refresh_token,
        user: json.user,
      }
      this.setSession(session, 'TOKEN_REFRESHED')
      return session
    } catch {
      this.setSession(null, 'SIGNED_OUT')
      return null
    }
  }

  private headers(useSession = true): Record<string, string> {
    const accessToken = useSession ? this.currentSession?.access_token : undefined
    return buildApiHeaders(this.anonKey, accessToken)
  }

  // --- Auth API ---
  async signUp(body: { email: string; password: string; data?: Record<string, unknown> }): Promise<{
    data: { user: AuthUser | null; session: SupabaseSession | null } | null
    error: { message: string; status?: number } | null
  }> {
    if (!this.isConfigured) {
      return { data: null, error: { message: 'Supabase client is not configured.' } }
    }
    try {
      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: this.headers(false),
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: { message: json.msg || json.message || 'Sign up failed', status: res.status } }
      }
      const session = sessionFromAuthPayload(json.session ?? json)
      if (session) {
        this.setSession(session, 'SIGNED_IN')
      }
      return { data: { user: json.user ?? session?.user ?? null, session }, error: null }
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' } }
    }
  }

  async signInWithPassword(body: { email: string; password: string }): Promise<{
    data: { user: AuthUser | null; session: SupabaseSession | null } | null
    error: { message: string; status?: number } | null
  }> {
    if (!this.isConfigured) {
      return { data: null, error: { message: 'Supabase client is not configured.' } }
    }
    try {
      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: this.headers(false),
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: { message: json.msg || json.error_description || 'Invalid credentials', status: res.status } }
      }
      const session = sessionFromAuthPayload(json)
      if (!session) {
        return { data: null, error: { message: 'Sign in did not return a session.' } }
      }
      this.setSession(session, 'SIGNED_IN')
      return { data: { user: session.user, session }, error: null }
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' } }
    }
  }

  async signInAnonymously(): Promise<{
    data: { user: AuthUser | null; session: SupabaseSession | null } | null
    error: { message: string; status?: number } | null
  }> {
    if (!this.isConfigured) {
      return { data: null, error: { message: 'Supabase client is not configured.' } }
    }
    try {
      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: this.headers(false),
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (!res.ok) {
        return {
          data: null,
          error: {
            message: json.msg || json.message || json.error_description || 'Guest sign in failed',
            status: res.status,
          },
        }
      }
      const session = sessionFromAuthPayload(json.session ?? json)
      if (!session?.user.is_anonymous) {
        return {
          data: null,
          error: {
            message: 'Anonymous sign-ins are not enabled for this project.',
            status: res.status,
          },
        }
      }
      this.setSession(session, 'SIGNED_IN')
      return { data: { user: session.user, session }, error: null }
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' } }
    }
  }

  async signOut(): Promise<{ error: { message: string } | null }> {
    if (this.currentSession?.access_token && this.isConfigured) {
      try {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: 'POST',
          headers: this.headers(true),
        })
      } catch {
        // Best effort logout
      }
    }
    this.setSession(null, 'SIGNED_OUT')
    return { error: null }
  }

  // --- RPC & REST API ---
  async rpc<T = unknown>(fnName: string, params: Record<string, unknown> = {}): Promise<{
    data: T | null
    error: { message: string; code?: string; status?: number } | null
  }> {
    if (!this.isConfigured) {
      return { data: null, error: { message: 'Database client unavailable.' } }
    }
    try {
      const res = await fetch(`${this.url}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify(params),
      })
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: { message: json.message || json.msg || 'RPC execution failed', code: json.code, status: res.status } }
      }
      return { data: json as T, error: null }
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' } }
    }
  }

  async query<T = unknown>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
      headers?: Record<string, string>
      body?: unknown
    } = {},
  ): Promise<{
    data: T | null
    error: { message: string; code?: string; status?: number } | null
  }> {
    if (!this.isConfigured) {
      return { data: null, error: { message: 'Database client unavailable.' } }
    }
    try {
      const customHeaders = {
        ...this.headers(true),
        ...(options.headers ?? {}),
      }
      const res = await fetch(`${this.url}/rest/v1/${endpoint}`, {
        method: options.method ?? 'GET',
        headers: customHeaders,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      })
      if (res.status === 204) {
        return { data: null, error: null }
      }
      const json = await res.json()
      if (!res.ok) {
        return { data: null, error: { message: json.message || json.msg || 'Query failed', code: json.code, status: res.status } }
      }
      return { data: json as T, error: null }
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' } }
    }
  }
}

let defaultClient: SupabaseClient | null = null

export function getSupabaseClient(config?: Partial<SupabaseConfig>): SupabaseClient {
  if (config) {
    return new SupabaseClient(config)
  }
  if (!defaultClient) {
    defaultClient = new SupabaseClient()
  }
  return defaultClient
}
