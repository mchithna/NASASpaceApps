import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import { type AvatarId, isAvatarId } from '@/contracts/explorer.ts'
import {
  avatarOptions,
  PageShell,
  PersonaSwitcher,
  ProfileEditForm,
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

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSaveProfile = async ({
    nickname: nextNickname,
    avatarId: nextAvatarId,
  }: {
    nickname: string
    avatarId: AvatarId
  }) => {
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await services.explorer.saveProfile({
        nickname: nextNickname,
        avatarId: nextAvatarId,
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

  const currentAvatarId: AvatarId =
    profile && isAvatarId(profile.avatarId) ? profile.avatarId : 'cadet-1'
  const selectedAvatarOption =
    avatarOptions.find((a) => a.id === currentAvatarId) ?? avatarOptions[0]
  const AvatarIcon = selectedAvatarOption.icon

  // Rank progression
  const rank = profile?.rank
  const totalXp = profile?.totalXp ?? 0
  const bracketSpan =
    rank && rank.nextRankMinXp !== null ? rank.nextRankMinXp - rank.minXp : 100
  const currentLevelProgress =
    rank && rank.nextRankMinXp !== null ? totalXp - rank.minXp : 100
  const progressLabel =
    rank && rank.nextRankMinXp !== null && rank.nextRankName
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

        {/* Profile Settings Form */}
        {profile ? (
          <ProfileEditForm
            key={`${profile.nickname}-${profile.avatarId}`}
            initialNickname={profile.nickname}
            initialAvatarId={currentAvatarId}
            onSave={handleSaveProfile}
            isSaving={isSaving}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onClearStatus={() => {
              setErrorMessage(null)
              setSuccessMessage(null)
            }}
          />
        ) : null}
      </div>
    </PageShell>
  )
}
