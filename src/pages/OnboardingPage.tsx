import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { UserCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  validateNickname,
  type AvatarId,
  isAvatarId,
} from '@/contracts/explorer.ts'
import {
  AvatarSelector,
  StatusBanner,
} from '@/pages/components/index.ts'
import { useNovaServices } from '@/pages/context/index.ts'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { services, isLive, isAcceptance } = useNovaServices()

  useEffect(() => {
    document.title = 'Explorer Setup · NovaExplorer'
  }, [])

  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [avatarId, setAvatarId] = useState<AvatarId>('cadet-1')
  const [sessionKind, setSessionKind] = useState<'guest' | 'registered' | 'none'>('none')

  // Load current session & profile or initialize guest session
  useEffect(() => {
    let ignore = false

    const initialize = async () => {
      try {
        let sessionResult = await services.auth.getSession()

        // If signed out, start a guest session so profile can be customized
        if (
          sessionResult.ok &&
          (sessionResult.data.status === 'signed-out' ||
            sessionResult.data.status === 'initializing')
        ) {
          const guestResult = await services.auth.startGuestSession()
          if (guestResult.ok) {
            sessionResult = guestResult
          }
        }

        if (ignore) return

        if (sessionResult.ok && sessionResult.data.status === 'guest') {
          setSessionKind('guest')
        } else if (sessionResult.ok && sessionResult.data.status === 'authenticated') {
          setSessionKind('registered')
        }

        const profileResult = await services.explorer.getProfile()
        if (ignore) return

        if (profileResult.ok) {
          setNickname(profileResult.data.nickname)
          if (isAvatarId(profileResult.data.avatarId)) {
            setAvatarId(profileResult.data.avatarId)
          }
        }
      } catch {
        if (!ignore) {
          setErrorMessage('Unable to load explorer profile from services.')
        }
      } finally {
        if (!ignore) {
          setIsLoadingProfile(false)
        }
      }
    }

    void initialize()

    return () => {
      ignore = true
    }
  }, [services])

  // Real-time nickname validation feedback
  const validationResult = validateNickname(nickname)
  const isNicknameValid = validationResult.ok

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isNicknameValid) {
      setErrorMessage(validationResult.error.message)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await services.explorer.saveProfile({
        nickname: validationResult.data,
        avatarId,
      })

      if (result.ok) {
        setSuccessNotice('Explorer callsign verified and registered! Entering Mission Control...')
        navigate('/dashboard')
      } else {
        setErrorMessage(result.error.message)
      }
    } catch {
      setErrorMessage('Failed to save profile telemetry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingState label="Preparing Explorer Setup Station..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="science">Academy Induction</Badge>
          <span className="text-xs uppercase tracking-wider text-muted">
            Explorer Registration
          </span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Explorer Setup
        </h1>
        <p className="text-secondary text-sm sm:text-base">
          Customize your academy callsign and flight insignia before embarking on
          spacecraft investigation missions.
        </p>
      </div>

      {/* Active Session Notice */}
      {sessionKind === 'guest' ? (
        <StatusBanner
          variant="info"
          title="Guest Explorer Mode"
          message={isAcceptance ? 'Isolated guest fixture. Profile and training progress are stored in this tab only, with no real account writes.' : isLive
            ? 'Guest mission progress and discoveries are saved in this browser tab. Your callsign and avatar stay in memory. Guest progress is not copied to a registered account.'
            : 'Development mock visit. Your guest profile, progress, and discoveries stay in memory and reset on refresh.'}
        />
      ) : null}

      {/* Error or Success Alerts */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-surface border border-danger bg-surface p-4 text-danger text-sm shadow-surface"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold font-heading">Validation Error</span>
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
            <span className="font-semibold font-heading">Profile Updated</span>
            <span>{successNotice}</span>
          </div>
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Callsign / Nickname Card */}
        <Card variant="standard" className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-reward" aria-hidden="true" />
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Academy Callsign (Nickname)
              </h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="explorer-nickname"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Choose Callsign
              </label>
              <input
                id="explorer-nickname"
                type="text"
                required
                minLength={2}
                maxLength={20}
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setErrorMessage(null)
                }}
                placeholder="e.g. Lunar Pathfinder"
                aria-invalid={!isNicknameValid && nickname.length > 0}
                aria-describedby="nickname-hint"
                className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science"
              />
              <div id="nickname-hint" className="flex items-center justify-between text-xs text-muted">
                <span>2–20 characters. Letters, numbers, spaces, apostrophes, and hyphens.</span>
                <span className="tabular-nums">{nickname.length}/20</span>
              </div>
            </div>

            {!isNicknameValid && nickname.length > 0 ? (
              <p className="text-xs font-medium text-danger">
                {validationResult.error.message}
              </p>
            ) : null}
          </div>
        </Card>

        {/* Avatar Selection Card */}
        <Card variant="standard" className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Academy Insignia (Avatar)
              </h2>
              <p className="text-xs text-secondary">
                Select the specialization role that represents your explorer.
              </p>
            </div>

            <AvatarSelector
              selectedAvatar={avatarId}
              onSelect={setAvatarId}
              disabled={isSubmitting}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={isSubmitting}
            disabled={!isNicknameValid || isSubmitting}
            className="w-full sm:w-auto"
          >
            <UserCheck className="size-4 mr-1" aria-hidden="true" />
            <span>Save Profile & Enter Mission Control</span>
          </Button>

          <Link
            to="/dashboard"
            className="text-xs font-medium text-secondary hover:text-science hover:underline"
          >
            Skip to Mission Control as Guest &rarr;
          </Link>
        </div>
      </form>
    </div>
  )
}
