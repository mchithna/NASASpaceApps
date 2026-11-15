import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Orbit,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { AuthArtwork } from '@/pages/components/AuthArtwork.tsx'
import { AuthField } from '@/pages/components/AuthField.tsx'
import { NovaLogo } from '@/pages/components/landing/NovaLogo.tsx'
import { avatarOptions } from '@/pages/components/avatarOptions.ts'
import styles from './AuthPage.module.css'
import { type AvatarId } from '@/contracts/explorer.ts'
import { StatusBanner } from '@/pages/components/StatusBanner.tsx'
import { useNovaServices } from '@/pages/context/index.ts'
import { AuthAiHelper } from '@/ai/surfaces/AuthAiHelper.tsx'

const demoCredentials = import.meta.env.DEV
  ? (await import('@/mocks/fixtures.ts')).mockRegisteredCredentials
  : null

export function AuthPage() {
  const navigate = useNavigate()
  const { services, isLive, isAcceptance } = useNovaServices()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  useEffect(() => {
    document.title = `${activeTab === 'signin' ? 'Sign In' : 'Create Account'} · NovaExplorer`
  }, [activeTab])
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
        setSuccessNotice(
          'Guest session established. Transferring to Mission Control...',
        )
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
        setSuccessNotice(
          'Academy explorer profile registered! Entering Mission Control...',
        )
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
    if (!demoCredentials) return
    setSignInEmail(demoCredentials.email)
    setSignInPassword(demoCredentials.password)
    setErrorMessage(null)
  }

  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab)
    setErrorMessage(null)
    setSuccessNotice(null)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="NovaExplorer home">
          <NovaLogo />
          <span>
            Nova<span className={styles.science}>Explorer</span>
          </span>
        </Link>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={15} aria-hidden="true" /> Back to home
        </Link>
      </header>

      <div className={styles.shell}>
        <AuthArtwork />
        <section className={styles.formSide} aria-labelledby="auth-heading">
          <div className={styles.formContent}>
            <p className={styles.eyebrow}>
              <Orbit size={15} aria-hidden="true" /> YOUR JOURNEY CONTINUES
            </p>
            <h1 id="auth-heading">
              {activeTab === 'signin'
                ? 'Welcome back, explorer.'
                : 'Your adventure starts here.'}
            </h1>
            <p className={styles.subtitle}>
              {activeTab === 'signin'
                ? 'Sign in and pick up where your curiosity left off.'
                : 'Create your explorer profile. There’s a universe to discover.'}
            </p>

            <div
              role="tablist"
              aria-label="Account Access Options"
              className={styles.tabs}
            >
              {(['signin', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`${tab}-tab`}
                  aria-controls={`${tab}-panel`}
                  aria-selected={activeTab === tab}
                  tabIndex={activeTab === tab ? 0 : -1}
                  disabled={isSubmitting}
                  onClick={() => switchTab(tab)}
                  onKeyDown={(event) => {
                    if (
                      ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                        event.key,
                      )
                    ) {
                      event.preventDefault()
                      const next =
                        event.key === 'Home'
                          ? 'signin'
                          : event.key === 'End'
                            ? 'signup'
                            : tab === 'signin'
                              ? 'signup'
                              : 'signin'
                      switchTab(next)
                      document.getElementById(`${next}-tab`)?.focus()
                    }
                  }}
                >
                  {tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {errorMessage ? (
              <div role="alert" className={styles.error}>
                <AlertCircle size={18} aria-hidden="true" />
                <span>
                  <strong>Authentication Error</strong>
                  {errorMessage}
                </span>
              </div>
            ) : null}
            {successNotice ? (
              <div role="status" className={styles.success}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {successNotice}
              </div>
            ) : null}

            <div
              id="signin-panel"
              role="tabpanel"
              aria-labelledby="signin-tab"
              hidden={activeTab !== 'signin'}
            >
              {activeTab === 'signin' ? (
                <>
                  <form
                    onSubmit={handleSignIn}
                    aria-label="Sign in to NovaExplorer"
                  >
                    <fieldset className={styles.fields} disabled={isSubmitting}>
                      <legend className="sr-only">Sign-in details</legend>
                      <AuthField
                        id="signin-email"
                        kind="email"
                        label="Academy Email"
                        autoComplete="username"
                        required
                        maxLength={120}
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="explorer@example.com"
                      />
                      <AuthField
                        id="signin-password"
                        kind="password"
                        label="Password"
                        autoComplete="current-password"
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={!signInEmail || !signInPassword}
                        className={styles.submit}
                      >
                        Sign In <ArrowRight size={17} aria-hidden="true" />
                      </Button>
                    </fieldset>
                  </form>
                  {import.meta.env.DEV && !isLive && !isAcceptance ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFillDemoCredentials}
                      className={styles.demoButton}
                    >
                      Fill Demo Account Credentials
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>

            <div
              id="signup-panel"
              role="tabpanel"
              aria-labelledby="signup-tab"
              hidden={activeTab !== 'signup'}
            >
              {activeTab === 'signup' ? (
                <form
                  onSubmit={handleSignUp}
                  aria-label="Register a NovaExplorer profile"
                >
                  <fieldset className={styles.fields} disabled={isSubmitting}>
                    <legend className="sr-only">Registration details</legend>
                    <AuthField
                      id="signup-nickname"
                      kind="nickname"
                      label="Callsign / Nickname"
                      autoComplete="nickname"
                      required
                      minLength={2}
                      maxLength={20}
                      value={signUpNickname}
                      onChange={(e) => setSignUpNickname(e.target.value)}
                      placeholder="What should we call you?"
                      hint="2–20 characters. Use letters, numbers, spaces, apostrophes or hyphens."
                    />
                    <AuthField
                      id="signup-email"
                      kind="email"
                      label="Academy Email"
                      autoComplete="email"
                      required
                      maxLength={120}
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="explorer@example.com"
                    />
                    <AuthField
                      id="signup-password"
                      kind="password"
                      label="Password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={72}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Create a password"
                      hint="Use 8–72 characters."
                    />
                    <fieldset className={styles.avatarField}>
                      <legend>Choose your academy avatar</legend>
                      <div className={styles.avatars}>
                        {avatarOptions.map(({ id, name, icon: Icon }) => (
                          <label key={id} className={styles.avatarOption}>
                            <input
                              type="radio"
                              name="avatar"
                              value={id}
                              checked={signUpAvatarId === id}
                              onChange={() => setSignUpAvatarId(id)}
                            />
                            <span>
                              <Icon size={21} aria-hidden="true" />
                              <span>{name}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={
                        !signUpEmail ||
                        signUpPassword.length < 8 ||
                        signUpNickname.trim().length < 2
                      }
                      className={styles.submit}
                    >
                      Register Profile &amp; Begin{' '}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Button>
                  </fieldset>
                </form>
              ) : null}
            </div>

            <div className={styles.divider}>
              <span /> or explore at your own pace <span />
            </div>
            <section className={styles.guest} aria-labelledby="guest-heading">
              <h2 id="guest-heading" className="sr-only">
                Continue as Guest
              </h2>
              <Button
                variant="secondary"
                className={styles.guestButton}
                disabled={isSubmitting}
                onClick={handleGuestSession}
              >
                Enter Mission Control as Guest{' '}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
              <p>No account needed. Guest progress stays in this tab.</p>
              <details className={styles.details}>
                <summary>How is guest progress saved?</summary>
                <p>
                  Guest progress cannot be recovered on other devices or if
                  browser data is cleared. Creating an account does not transfer
                  guest progress or rank.
                </p>
                <Link to="/onboarding">Go to Explorer Setup →</Link>
              </details>

              {isLive ? (
                <div className="mt-3 p-3.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-xs text-[#b8c8dd]">
                  <strong className="font-semibold text-white">Guest Recovery Limitation:</strong> Anonymous guest sessions are tied to this browser only and cannot be recovered if browser data is cleared or on other devices.
                </div>
              ) : null}

              <AuthAiHelper />
            </section>

            {!isLive ? (
              <details className={styles.serviceNotice}>
                <summary>Development environment</summary>
                <StatusBanner
                  variant="info"
                  title="Prototype Notice"
                  message={
                    isAcceptance
                      ? 'Explicit isolated acceptance fixture. Guest progress persists in this tab; registered sign-in is disabled and no real account data is saved.'
                      : 'Development mock services operate in memory. Profiles and progress reset on refresh and are not saved to an account.'
                  }
                />
              </details>
            ) : null}
            <p className={styles.reassurance}>
              <ShieldCheck size={15} aria-hidden="true" /> A little curiosity. A
              whole universe of discovery.
            </p>
          </div>
        </section>
      </div>
      <footer className={styles.footer}>
        <span>Made for curious minds. Built for exploration.</span>
        <span>An independent NASA Space Apps project · 2026</span>
      </footer>
    </div>
  )
}
