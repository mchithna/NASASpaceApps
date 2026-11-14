# Auth Service Integration Note for Integration Owner (Phase 4B)

## Service Factory
- Exported from: `src/features/auth/authService.ts` via `createAuthService(options)`.
- Implements: `AuthService` from `src/contracts/services.ts`.

## Providing to App Shell in Phase 4B
In Phase 4B, the integration owner can wire `createAuthService()` into the root `AppProviders`:

```tsx
import { createAuthService } from '@/features/auth/authService.ts'
import { getSupabaseClient } from '@/features/auth/supabaseClient.ts'

// Provide singleton services
const client = getSupabaseClient()
const authService = createAuthService({ client })
```

## Security & Session Handling
- Credentials (passwords) are strictly handled in memory and submitted directly to Supabase Auth.
- Anonymous guest authentication creates a valid session identity (`{ status: 'guest', identity: { explorerId, kind: 'guest' } }`).
- Listener subscriptions return an unsubscription cleanup function (`() => void`).
- Account linking: The Phase 1.5 `AuthService` contract defines guest sessions and registered sign-in / sign-up separately without an explicit `linkAccount` signature. To maintain strict contract fidelity without breaking types, account linking is documented as deferred to a future contract extension.
