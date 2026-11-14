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

export function getSupabaseConfig(): SupabaseConfig {
  const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL ?? '').trim()
  const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '').trim()

  return { supabaseUrl, supabaseAnonKey }
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
  }

  get isConfigured(): boolean {
    return Boolean(this.url && this.anonKey)
  }

  setSession(session: SupabaseSession | null, event: AuthChangeEvent = 'SIGNED_IN'): void {
    this.currentSession = session
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

  private headers(requireAuth = true): Record<string, string> {
    const h: Record<string, string> = {
      'apikey': this.anonKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    if (requireAuth && this.currentSession?.access_token) {
      h['Authorization'] = `Bearer ${this.currentSession.access_token}`
    } else {
      h['Authorization'] = `Bearer ${this.anonKey}`
    }
    return h
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
      const session = json.session ?? (json.access_token ? json : null)
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
      const session: SupabaseSession = {
        access_token: json.access_token,
        token_type: json.token_type,
        expires_in: json.expires_in,
        refresh_token: json.refresh_token,
        user: json.user,
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
        body: JSON.stringify({ data: { is_anonymous: true } }),
      })
      const json = await res.json()
      if (!res.ok) {
        // Fallback: anonymous signin endpoint
        const anonRes = await fetch(`${this.url}/auth/v1/token?grant_type=anonymous`, {
          method: 'POST',
          headers: this.headers(false),
          body: JSON.stringify({}),
        })
        const anonJson = await anonRes.json()
        if (!anonRes.ok) {
          return { data: null, error: { message: anonJson.msg || 'Guest sign in failed', status: anonRes.status } }
        }
        const session: SupabaseSession = anonJson
        this.setSession(session, 'SIGNED_IN')
        return { data: { user: session.user, session }, error: null }
      }
      const session = json.session ?? json
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
