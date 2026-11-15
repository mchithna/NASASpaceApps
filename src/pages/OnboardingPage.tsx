import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { Sparkles, AlertCircle, CheckCircle2, ArrowUpRight, ShieldCheck, Compass, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import {
  validateNickname,
  type AvatarId,
  isAvatarId,
} from '@/contracts/explorer.ts'
import {
  AvatarSelector,
} from '@/pages/components/index.ts'
import { avatarOptions } from '@/pages/components/avatarOptions.ts'
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

  // Active avatar metadata for live preview
  const currentAvatar = avatarOptions.find((a) => a.id === avatarId) ?? avatarOptions[0]
  const AvatarIcon = currentAvatar.icon

  // Steps calculation
  const hasValidCallsign = isNicknameValid && nickname.trim().length >= 2

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <LoadingState label="Preparing Explorer Setup Station..." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full py-4 animate-page-rise">
      {/* Top Header with Eyebrow and Two-Tone Headline */}
      <div className="flex flex-col gap-3">
        <div className="eyebrow-label">
          <span className="eyebrow-dot" />
          <span>NASA EDUCATIONAL EXPERIENCE · ACADEMY INDUCTION</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Explorer <span className="headline-lime">Setup</span>
        </h1>
        <p className="text-[#9aa7bd] text-sm sm:text-base max-w-2xl leading-relaxed">
          Customize your academy callsign and flight insignia before embarking on
          spacecraft investigation missions across the solar system.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-3 gap-3 p-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
        <div
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
            hasValidCallsign
              ? 'bg-[#d4ff9a]/15 text-[#d4ff9a] border border-[#d4ff9a]/30'
              : 'bg-white/10 text-white'
          }`}
        >
          <span
            className={`flex items-center justify-center size-6 rounded-full text-xs font-bold ${
              hasValidCallsign ? 'bg-[#d4ff9a] text-[#050a14]' : 'bg-white/20 text-white'
            }`}
          >
            {hasValidCallsign ? <Check size={13} /> : '1'}
          </span>
          <span className="text-xs sm:text-sm font-semibold truncate">Step 1: Callsign</span>
        </div>

        <div
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
            hasValidCallsign
              ? 'bg-white/10 text-white'
              : 'text-[#9aa7bd] opacity-60'
          }`}
        >
          <span className="flex items-center justify-center size-6 rounded-full text-xs font-bold bg-white/20">
            2
          </span>
          <span className="text-xs sm:text-sm font-semibold truncate">Step 2: Insignia</span>
        </div>

        <div
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
            hasValidCallsign
              ? 'text-white'
              : 'text-[#9aa7bd] opacity-40'
          }`}
        >
          <span className="flex items-center justify-center size-6 rounded-full text-xs font-bold bg-white/20">
            3
          </span>
          <span className="text-xs sm:text-sm font-semibold truncate">Step 3: Launch</span>
        </div>
      </div>

      {/* Guest Explorer Mode Glass Card */}
      {sessionKind === 'guest' ? (
        <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#d4ff9a]/25 bg-[#d4ff9a]/5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#d4ff9a]/15 text-[#d4ff9a]">
            <Compass className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-sm font-semibold text-white">
              Guest Explorer Mode
            </h3>
            <p className="text-xs sm:text-sm text-[#9aa7bd] leading-relaxed">
              {isAcceptance
                ? 'Isolated guest fixture. Profile and training progress are stored in this tab only, with no real account writes.'
                : isLive
                ? 'Guest mission progress and discoveries are saved in this browser tab. Your callsign and avatar stay in memory. Guest progress is not copied to a registered account.'
                : 'Development mock visit. Your guest profile, progress, and discoveries stay in memory and reset on refresh.'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Error or Success Alerts */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-danger/60 bg-danger/10 p-4 text-danger text-sm backdrop-blur-md shadow-lg"
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
          className="flex items-start gap-3 rounded-2xl border border-success/60 bg-success/10 p-4 text-success text-sm backdrop-blur-md shadow-lg"
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
        {/* Callsign / Nickname Glass Card */}
        <Card variant="standard" className="p-6 sm:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-[#d4ff9a]" aria-hidden="true" />
              <h2 className="font-heading text-lg sm:text-xl font-semibold text-white">
                Academy Callsign (Nickname)
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="explorer-nickname"
                className="text-xs font-semibold uppercase tracking-wider text-[#9aa7bd]"
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
                className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3.5 text-base text-white placeholder:text-white/30 backdrop-blur-md transition-all duration-200 focus:border-[#d4ff9a] focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#d4ff9a]/30"
              />
              <div id="nickname-hint" className="flex items-center justify-between text-xs text-[#9aa7bd] px-1">
                <span>2–20 characters. Letters, numbers, spaces, apostrophes, and hyphens.</span>
                <span className="tabular-nums font-mono text-[#d4ff9a]">
                  {nickname.length}/20
                </span>
              </div>
            </div>

            {!isNicknameValid && nickname.length > 0 ? (
              <p className="text-xs font-medium text-danger px-1">
                {validationResult.error.message}
              </p>
            ) : null}
          </div>
        </Card>

        {/* Avatar Selection Glass Card */}
        <Card variant="standard" className="p-6 sm:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg sm:text-xl font-semibold text-white">
                Academy Insignia (Avatar)
              </h2>
              <p className="text-xs sm:text-sm text-[#9aa7bd]">
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

        {/* Live Explorer Credential Badge Preview Card */}
        <div className="p-6 rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#d4ff9a]/15 text-[#d4ff9a] border border-[#d4ff9a]/40 shadow-[0_0_20px_rgba(212,255,154,0.3)]">
              <AvatarIcon className="size-7" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="eyebrow-label text-[10px]">
                <span className="eyebrow-dot" /> LIVE CREDENTIAL PREVIEW
              </span>
              <h3 className="font-heading text-xl font-bold text-white tracking-tight">
                {nickname.trim() ? nickname : 'Unnamed Explorer'}
              </h3>
              <span className="text-xs text-[#9aa7bd]">
                {currentAvatar.name} · {currentAvatar.specialty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#d4ff9a] bg-[#d4ff9a]/10 px-3.5 py-1.5 rounded-full border border-[#d4ff9a]/30 shrink-0">
            <ShieldCheck size={14} />
            <span>Ready for Academy Launch</span>
          </div>
        </div>

        {/* Bottom Actions with Launch Mission CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={isSubmitting}
            disabled={!isNicknameValid || isSubmitting}
            aria-label="Save Profile & Enter Mission Control"
            className="w-full sm:w-auto min-w-[220px]"
          >
            <span>Launch Mission</span>
            <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Button>

          <Link
            to="/dashboard"
            className="text-xs sm:text-sm font-medium text-[#9aa7bd] hover:text-[#d4ff9a] hover:underline transition-colors"
          >
            Skip to Mission Control as Guest &rarr;
          </Link>
        </div>
      </form>
    </div>
  )
}
