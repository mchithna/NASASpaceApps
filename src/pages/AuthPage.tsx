import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { KeyRound, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { mockRegisteredCredentials } from '@/mocks/fixtures.ts'
import { type AvatarId } from '@/contracts/explorer.ts'
import {
  AvatarSelector,
  StatusBanner,
} from '@/pages/components/index.ts'
import { useNovaServices } from '@/pages/context/index.ts'

export function AuthPage() {
  const navigate = useNavigate()
  const { services } = useNovaServices()

  useEffect(() => {
    document.title = 'Sign In · NovaExplorer'
  }, [])

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up fields
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpNickname, setSignUpNickname] = useState('')
  const [signUpAvatarId, setSignUpAvatarId] = useState<AvatarId>('cadet-1')

  const handleGuestSession = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await services.auth.startGuestSession()
      if (result.ok) {
        setSuccessNotice('Guest session established. Transferring to Mission Control...')
        navigate('/dashboard')
      } else {
        setErrorMessage(result.error.message)
      }
    } catch {
      setErrorMessage('Unable to connect to authorization services.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await services.auth.signIn({
        email: signInEmail,
        password: signInPassword,
      })

      if (result.ok) {
        setSuccessNotice('Credentials verified. Entering Mission Control...')
        navigate('/dashboard')
      } else {
        setErrorMessage(result.error.message)
      }
    } catch {
      setErrorMessage('Authorization request failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await services.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        nickname: signUpNickname,
        avatarId: signUpAvatarId,
      })

      if (result.ok) {
        setSuccessNotice('Academy explorer profile registered! Entering Mission Control...')
        navigate('/dashboard')
      } else {
        setErrorMessage(result.error.message)
      }
    } catch {
      setErrorMessage('Account registration request failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFillDemoCredentials = () => {
    setSignInEmail(mockRegisteredCredentials.email)
    setSignInPassword(mockRegisteredCredentials.password)
    setErrorMessage(null)
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <Badge variant="science">Academy Access Gate</Badge>
          <span className="text-xs uppercase tracking-wider text-muted">
            Telemetry Authentication
          </span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Sign In to NovaExplorer
        </h1>
        <p className="text-secondary text-sm sm:text-base">
          Choose between an instant guest session or signing into a registered
          explorer profile.
        </p>
      </div>

      {/* Prominent Guest Option */}
      <Card variant="elevated" className="p-6 border-science/40 relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-science" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider text-science">
                  Recommended For Fast Exploration
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                Continue as Guest
              </h2>
            </div>
            <Badge variant="warning">No Account Required</Badge>
          </div>

          <p className="text-sm text-secondary">
            Jump directly into spacecraft stories, analyze telemetry, and earn
            milestones immediately. Progress is maintained in memory for this
            browser session.
          </p>

          <Button
            variant="primary"
            size="large"
            loading={isSubmitting}
            onClick={handleGuestSession}
            className="w-full sm:w-auto"
          >
            Enter Mission Control as Guest &rarr;
          </Button>
        </div>
      </Card>

      {/* Status Notice & In-Memory Warning */}
      <StatusBanner
        variant="info"
        title="Prototype Notice"
        message="Development services operate in-memory. Browser-refresh persistence is out of scope until persistent cloud database integration in Phase 4B."
      />

      {/* Error or Success Alerts */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-surface border border-danger bg-surface p-4 text-danger text-sm shadow-surface"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold font-heading">Authentication Error</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}

      {successNotice ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-surface border border-success bg-surface p-4 text-success text-sm shadow-surface"
        >
          <CheckCircle2 className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold font-heading">Success</span>
            <span>{successNotice}</span>
          </div>
        </div>
      ) : null}

      {/* Account Authentication Section */}
      <Card variant="standard" className="p-6">
        <div className="flex flex-col gap-6">
          {/* Tab Selection */}
          <div
            role="tablist"
            aria-label="Account Access Options"
            className="grid grid-cols-2 gap-2 border-b border-border pb-4"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signin'}
              aria-controls="signin-panel"
              id="signin-tab"
              onClick={() => {
                setActiveTab('signin')
                setErrorMessage(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'signin'
                  ? 'bg-elevated text-science shadow-surface border border-science/50'
                  : 'text-secondary hover:text-foreground hover:bg-surface/50'
              }`}
            >
              <KeyRound className="size-4" aria-hidden="true" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signup'}
              aria-controls="signup-panel"
              id="signup-tab"
              onClick={() => {
                setActiveTab('signup')
                setErrorMessage(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'bg-elevated text-science shadow-surface border border-science/50'
                  : 'text-secondary hover:text-foreground hover:bg-surface/50'
              }`}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' ? (
            <form
              id="signin-panel"
              role="tabpanel"
              aria-labelledby="signin-tab"
              onSubmit={handleSignIn}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signin-email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Academy Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="explorer@example.com"
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signin-password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={!signInEmail || !signInPassword}
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>

                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="text-xs text-science hover:underline cursor-pointer"
                >
                  Fill Demo Account Credentials
                </button>
              </div>

              {/* Demo Account Box */}
              <div className="rounded-control border border-border bg-surface/40 p-3 text-xs text-muted">
                <strong className="text-foreground">Pre-seeded Demo Explorer: </strong>
                <code>nova.cadet@example.com</code> / <code>academy-demo</code> (Level 2 Lunar Explorer with 160 XP).
              </div>
            </form>
          ) : (
            /* Sign Up Form */
            <form
              id="signup-panel"
              role="tabpanel"
              aria-labelledby="signup-tab"
              onSubmit={handleSignUp}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signup-nickname"
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Callsign / Nickname
                </label>
                <input
                  id="signup-nickname"
                  type="text"
                  required
                  minLength={2}
                  maxLength={20}
                  value={signUpNickname}
                  onChange={(e) => setSignUpNickname(e.target.value)}
                  placeholder="e.g. Starbound 42"
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science"
                />
                <span className="text-xs text-muted">
                  2 to 20 characters (letters, numbers, spaces, apostrophes, hyphens).
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signup-email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Academy Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="cadet@example.com"
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signup-password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Select Academy Avatar
                </span>
                <AvatarSelector
                  selectedAvatar={signUpAvatarId}
                  onSelect={setSignUpAvatarId}
                  disabled={isSubmitting}
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={
                    !signUpEmail ||
                    signUpPassword.length < 8 ||
                    signUpNickname.trim().length < 2
                  }
                  className="w-full sm:w-auto"
                >
                  Register Profile & Begin
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      <div className="text-center text-xs text-muted">
        Need to change explorer settings without registering?{' '}
        <Link to="/onboarding" className="text-science hover:underline">
          Go to Explorer Setup &rarr;
        </Link>
      </div>
    </div>
  )
}
