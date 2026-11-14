import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router'
import { UserCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import {
  validateNickname,
  type AvatarId,
  isAvatarId,
} from '@/contracts/explorer.ts'
import {
  AvatarSelector,
  avatarOptions,
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import { useNovaServices } from '@/pages/context/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

export function ProfilePage() {
  const { services } = useNovaServices()
  const { session, profile, progress, isLoading, error, refresh } =
    usePlatformData()

  useEffect(() => {
    document.title = 'Explorer Profile · NovaExplorer'
  }, [])

  const [nickname, setNickname] = useState('')
  const [avatarId, setAvatarId] = useState<AvatarId>('cadet-1')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sync form inputs when profile loads
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname)
      if (isAvatarId(profile.avatarId)) {
        setAvatarId(profile.avatarId)
      }
    }
  }, [profile])

  const validationResult = validateNickname(nickname)
  const isNicknameValid = validationResult.ok

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()

    if (!isNicknameValid) {
      setErrorMessage(validationResult.error.message)
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await services.explorer.saveProfile({
        nickname: validationResult.data,
        avatarId,
      })

      if (result.ok) {
        setSuccessMessage('Explorer profile updated successfully.')
        await refresh()
      } else {
        setErrorMessage(result.error.message)
      }
    } catch {
      setErrorMessage('Failed to transmit profile updates.')
    } finally {
      setIsSaving(false)
    }
  }

  const isGuest = session?.status === 'guest'
  const isSignedOut = session?.status === 'signed-out'

  const selectedAvatarOption =
    avatarOptions.find((a) => a.id === avatarId) ?? avatarOptions[0]
  const AvatarIcon = selectedAvatarOption.icon

  // Rank progression
  const rank = profile?.rank
  const totalXp = profile?.totalXp ?? 0
  const hasNextRank = rank && rank.nextRankMinXp !== null
  const bracketSpan = hasNextRank ? rank.nextRankMinXp - rank.minXp : 100
  const currentLevelProgress = hasNextRank ? totalXp - rank.minXp : 100
  const progressLabel = hasNextRank
    ? `${currentLevelProgress} / ${bracketSpan} XP to ${rank.nextRankName}`
    : `${totalXp} XP (Maximum Rank Reached)`

  const completedCount =
    progress?.missions.filter((m) => m.status === 'completed').length ?? 0

  return (
    <PageShell
      title="Explorer Profile"
      description="Manage your academy callsign, flight insignia, and career exploration telemetry."
      eyebrow="Academy Personnel"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
        {isSignedOut ? (
          <StatusBanner
            variant="warning"
            title="Signed Out"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are currently exploring without an active identity. Profile
                  customization requires establishing a session.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/auth"
                    className="font-semibold text-science hover:underline"
                  >
                    Sign in to account
                  </Link>
                  <Link
                    to="/onboarding"
                    className="font-semibold text-secondary hover:underline"
                  >
                    Continue as guest
                  </Link>
                </div>
              </div>
            }
          />
        ) : null}

        {isGuest ? (
          <StatusBanner
            variant="info"
            title="Guest Explorer Session"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are operating under a local guest session. Your callsign and flight
                  insignia are kept in memory for this browser session. To preserve your rank
                  and achievements permanently across devices, register an account.
                </p>
                <div>
                  <Link
                    to="/auth"
                    className="font-semibold text-science hover:underline"
                  >
                    Create account to keep progress &rarr;
                  </Link>
                </div>
              </div>
            }
          />
        ) : null}

        {/* Career Telemetry Overview */}
        {profile && rank ? (
          <Card variant="elevated" className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-surface bg-surface border border-science/40 text-science shadow-surface">
                  <AvatarIcon className="size-7" aria-hidden="true" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-science">
                      Active Callsign
                    </span>
                    {isGuest ? (
                      <Badge variant="warning">Guest</Badge>
                    ) : (
                      <Badge variant="neutral">Verified</Badge>
                    )}
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                    {profile.nickname}
                  </h2>
                  <span className="text-xs text-secondary">
                    Role: {selectedAvatarOption.name} · {selectedAvatarOption.specialty}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <Badge variant="science">Level {rank.level}</Badge>
                <Badge variant="reward">{rank.name}</Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                  Total XP
                </span>
                <span className="text-2xl font-bold font-heading text-foreground">
                  {totalXp} XP
                </span>
                <span className="text-xs text-secondary">
                  {rank.xpUntilNextRank !== null
                    ? `${rank.xpUntilNextRank} XP to promotion`
                    : 'Maximum rank reached'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                  Missions Concluded
                </span>
                <span className="text-2xl font-bold font-heading text-foreground">
                  {completedCount} / 5
                </span>
                <span className="text-xs text-secondary">
                  Spacecraft investigated
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                  Rank Progression
                </span>
                <ProgressBar
                  value={currentLevelProgress}
                  max={bracketSpan}
                  valueLabel={progressLabel}
                />
              </div>
            </div>
          </Card>
        ) : null}

        {/* Error or Success Alerts */}
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-surface border border-danger bg-surface p-4 text-danger text-sm shadow-surface"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold font-heading">Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-surface border border-success bg-surface p-4 text-success text-sm shadow-surface"
          >
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold font-heading">Updated</span>
              <span>{successMessage}</span>
            </div>
          </div>
        ) : null}

        {/* Profile Settings Form */}
        {profile ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
            <Card variant="standard" className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-reward" aria-hidden="true" />
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Edit Callsign (Nickname)
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="profile-nickname"
                    className="text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    Academy Callsign
                  </label>
                  <input
                    id="profile-nickname"
                    type="text"
                    required
                    minLength={2}
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value)
                      setErrorMessage(null)
                      setSuccessMessage(null)
                    }}
                    placeholder="e.g. Lunar Voyager"
                    aria-invalid={!isNicknameValid && nickname.length > 0}
                    aria-describedby="profile-nickname-hint"
                    className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science max-w-md"
                  />
                  <div
                    id="profile-nickname-hint"
                    className="flex max-w-md items-center justify-between text-xs text-muted"
                  >
                    <span>2–20 characters. Letters, numbers, spaces, hyphens.</span>
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

            <Card variant="standard" className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Flight Insignia (Avatar)
                  </h3>
                  <p className="text-xs text-secondary">
                    Select your academy specialization insignia.
                  </p>
                </div>

                <AvatarSelector
                  selectedAvatar={avatarId}
                  onSelect={(id) => {
                    setAvatarId(id)
                    setSuccessMessage(null)
                  }}
                  disabled={isSaving}
                />
              </div>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Button
                type="submit"
                variant="primary"
                size="large"
                loading={isSaving}
                disabled={!isNicknameValid || isSaving}
              >
                <UserCheck className="size-4 mr-1.5" aria-hidden="true" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </PageShell>
  )
}
