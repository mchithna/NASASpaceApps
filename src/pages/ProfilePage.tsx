import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { type AvatarId, isAvatarId } from '@/contracts/explorer.ts'
import { listMissions } from '@/missions/registry.ts'
import {
  avatarOptions,
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import {
  ProfileEditRegion,
  ProfileIdentity,
} from '@/pages/components/profile/ProfileIdentity.tsx'
import { ProfileAcademyForm } from '@/pages/components/profile/ProfileAcademyForm.tsx'
import styles from '@/pages/components/profile/profile.module.css'
import { useNovaServices } from '@/pages/context/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

export function ProfilePage() {
  const navigate = useNavigate()
  const { services, isLive, isAcceptance } = useNovaServices()
  const { session, profile, progress, isLoading, error, refresh } =
    usePlatformData()

  useEffect(() => {
    document.title = 'Explorer Profile · NovaExplorer'
  }, [])

  const [isSaving, setIsSaving] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await services.auth.signOut()
      navigate('/')
    } catch {
      setErrorMessage('Failed to sign out of explorer session.')
    } finally {
      setIsSigningOut(false)
    }
  }

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
  const missionTotal = listMissions().length

  return (
    <PageShell
      title="Explorer Profile"
      description="Your callsign, rank, and the profile details you can edit."
      eyebrow="Academy Personnel"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className={styles.layout}>
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
                  {isAcceptance ? 'Isolated training profile and rewards are saved in this browser tab. They are not real account data.' : isLive
                    ? 'Guest mission progress is saved in this browser tab. Your callsign and avatar stay in memory. Guest progress is separate from registered account progress.'
                    : 'Development mock visit. Guest progress and profile changes stay in memory and reset on refresh.'}
                </p>
                <div>
                  <Link
                    to="/auth"
                    className="font-semibold text-science hover:underline"
                  >
                    Create a separate account &rarr;
                  </Link>
                </div>
              </div>
            }
          />
        ) : null}

        {profile && rank ? (
          <ProfileIdentity
            nickname={profile.nickname}
            role={`Role: ${selectedAvatarOption.name} · ${selectedAvatarOption.specialty}`}
            avatar={AvatarIcon}
            isGuest={isGuest}
            level={rank.level}
            rankName={rank.name}
            totalXp={totalXp}
            xpDetail={
              rank.xpUntilNextRank !== null
                ? `${rank.xpUntilNextRank} XP to promotion`
                : 'Maximum rank reached'
            }
            completedLabel={`${completedCount} / ${missionTotal}`}
            progressValue={currentLevelProgress}
            progressMax={bracketSpan}
            progressLabel={progressLabel}
          />
        ) : null}

        {profile ? (
          <ProfileEditRegion>
            <ProfileAcademyForm
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
          </ProfileEditRegion>
        ) : null}

        {/* Account & Session Management Card */}
        {session && session.status !== 'signed-out' ? (
          <section className={styles.session} aria-labelledby="session-heading">
            <div>
              <h3 id="session-heading" className={styles.sessionTitle}>
                {isGuest ? 'Guest Session Controls' : 'Explorer Account Session'}
              </h3>
              <p className={styles.sessionNote}>
                {isGuest
                  ? isAcceptance ? 'Isolated test progress is saved in this browser tab.' : isLive ? 'Guest progress is saved in this browser tab.' : 'Mock progress is kept in memory.'
                  : 'Authenticated with academy credentials. Exploration progress is preserved.'}
              </p>
            </div>
            <div className={styles.sessionActions}>
              {isGuest ? (
                <Link className={styles.register} to="/auth">
                  Register Account
                </Link>
              ) : null}
              <Button
                variant="secondary"
                size="small"
                onClick={handleSignOut}
                loading={isSigningOut}
              >
                <LogOut className="size-3.5 mr-1.5" aria-hidden="true" />
                <span>{isGuest ? 'End Guest Session' : 'Sign Out'}</span>
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  )
}
