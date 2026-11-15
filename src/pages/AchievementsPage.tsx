import { SpaceArtwork } from './components/SpaceArtwork.tsx'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { Award, Lock, CheckCircle2, Shield, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { achievementCatalog } from '@/contracts/rewards.ts'
import { lookupMission } from '@/missions/registry.ts'
import {
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'

export function AchievementsPage() {
  const { achievements, session, isLoading, error, refresh } = usePlatformData()

  useEffect(() => {
    document.title = 'Achievements · NovaExplorer'
  }, [])

  const isSignedOut = session?.status === 'signed-out'

  // Map each catalog chapter achievement to its unlocked status
  const chapterBadges = achievementCatalog.map((catalogItem) => {
    const record = achievements.find((a) => a.id === catalogItem.id)
    const missionLookup = lookupMission(catalogItem.missionId)
    const mission =
      missionLookup.status === 'found' ? missionLookup.mission : null

    const isUnlocked = Boolean(record?.unlockedAt)
    return {
      id: catalogItem.id,
      missionId: catalogItem.missionId,
      title: catalogItem.title,
      description: catalogItem.description,
      mission,
      isUnlocked,
      unlockedAt: record?.unlockedAt ?? null,
    }
  })

  const unlockedChapterCount = chapterBadges.filter((b) => b.isUnlocked).length
  const isGuardianUnlocked = unlockedChapterCount === 5
  const totalAchievements = chapterBadges.length + 1 // 5 chapters + 1 Guardian meta badge
  const totalUnlocked = unlockedChapterCount + (isGuardianUnlocked ? 1 : 0)

  return (
    <PageShell
      visual="pioneer-10"
      title="Achievements"
      description="Honors and story insignia awarded by the Academy for investigating abandoned NASA spacecraft."
      eyebrow="Academy Honors"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {isSignedOut ? (
          <StatusBanner
            variant="warning"
            title="Signed Out"
            message={
              <div className="flex flex-col gap-2">
                <p>
                  You are exploring without an active profile. Achievements
                  earned during missions cannot be tracked until you establish
                  an explorer session.
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

        {/* Overview Banner */}
        <Card variant="elevated" className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Award className="size-5 text-reward" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wider text-reward">
                  Trophy Showcase
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Academy Story Honors
              </h2>
              <p className="text-sm text-secondary">
                Conclude mission story chapters to recover the legacy of
                forgotten spacecraft and unlock official academy trophies.
              </p>
            </div>

            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Total Unlocked</span>
                <span>
                  {totalUnlocked} of {totalAchievements}
                </span>
              </div>
              <ProgressBar
                value={totalUnlocked}
                max={totalAchievements}
                valueLabel={`${totalUnlocked} / ${totalAchievements}`}
              />
            </div>
          </div>
        </Card>

        {/* Zero Achievements Empty State */}
        {totalUnlocked === 0 && !isLoading ? (
          <EmptyState
            icon={Award}
            title="No Story Achievements Unlocked Yet"
            description="Your trophy showcase is currently empty. Head over to Mission Control, choose an abandoned spacecraft, and complete its story chapter to earn your first academy medal."
            action={
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 font-semibold text-science hover:underline"
              >
                Go to Mission Control &rarr;
              </Link>
            }
          />
        ) : null}

        {/* Chapter Badges Section */}
        <section
          aria-labelledby="chapter-badges-heading"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <h3
              id="chapter-badges-heading"
              className="font-heading text-xl font-semibold text-foreground"
            >
              Mission Chapter Badges
            </h3>
            <p className="text-xs text-secondary">
              Awarded upon concluding each spacecraft's historical chapter.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapterBadges.map((badge) => {
              const missionName = badge.mission?.displayName ?? badge.title
              const destination = badge.mission?.destination ?? 'Solar System'

              return (
                <Card
                  key={badge.id}
                  variant={badge.isUnlocked ? 'elevated' : 'standard'}
                  className={`achievement-card flex flex-col justify-between p-5 transition-all ${
                    badge.isUnlocked
                      ? 'border-reward/40 bg-gradient-to-b from-surface to-elevated'
                      : 'opacity-85 border-border bg-surface/60'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <SpaceArtwork
                      visual={badge.missionId}
                      className="achievement-image"
                    />
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral">{destination}</Badge>
                      {badge.isUnlocked ? (
                        <Badge variant="success">Unlocked</Badge>
                      ) : (
                        <Badge variant="neutral">
                          <Lock className="size-3 mr-1" aria-hidden="true" />
                          Locked
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-control border ${
                          badge.isUnlocked
                            ? 'border-reward bg-reward/10 text-reward'
                            : 'border-border bg-elevated text-muted'
                        }`}
                      >
                        {badge.isUnlocked ? (
                          <CheckCircle2 className="size-6" aria-hidden="true" />
                        ) : (
                          <Lock className="size-5" aria-hidden="true" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <h4 className="font-heading text-base font-bold text-foreground">
                          {badge.title}
                        </h4>
                        <span className="text-xs font-medium text-reward">
                          {badge.mission?.chapterTitle ?? badge.description}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-secondary">
                      {badge.isUnlocked
                        ? `Verified historical investigation concluded. Telemetry and memory recovered.`
                        : `Complete the ${missionName} story chapter to earn this honor.`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    {badge.isUnlocked ? (
                      <span className="text-success font-medium flex items-center gap-1">
                        <Sparkles
                          className="size-3 text-reward"
                          aria-hidden="true"
                        />
                        15 XP Legacy Awarded
                      </span>
                    ) : (
                      <span className="text-muted">Awaiting Completion</span>
                    )}

                    <Link
                      to={`/missions/${badge.missionId}`}
                      className="text-science hover:underline font-medium"
                    >
                      View dossier &rarr;
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Final Milestone Meta-Badge */}
        <section
          aria-labelledby="meta-badge-heading"
          className="flex flex-col gap-3"
        >
          <h3
            id="meta-badge-heading"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Supreme Academy Honor
          </h3>

          <Card
            variant={isGuardianUnlocked ? 'elevated' : 'standard'}
            className={`p-6 border ${
              isGuardianUnlocked
                ? 'border-reward bg-gradient-to-br from-surface via-elevated to-surface shadow-elevated'
                : 'border-border bg-surface/50 opacity-90'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-surface border ${
                    isGuardianUnlocked
                      ? 'border-reward bg-reward/15 text-reward shadow-surface'
                      : 'border-border bg-elevated text-muted'
                  }`}
                >
                  <Shield className="size-8" aria-hidden="true" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-reward">
                      Culminating Achievement
                    </span>
                    {isGuardianUnlocked ? (
                      <Badge variant="reward">Mastered</Badge>
                    ) : (
                      <Badge variant="neutral">
                        <Lock className="size-3 mr-1" aria-hidden="true" />
                        {unlockedChapterCount} / 5 Chapters
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-heading text-2xl font-bold text-foreground">
                    Guardian of Forgotten Worlds
                  </h4>

                  <p className="max-w-[65ch] text-xs text-secondary sm:text-sm">
                    Honor awarded to explorers who complete all five historical
                    missions, preserving the scientific legacy of humanity's
                    discarded explorers across the solar system.
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                {isGuardianUnlocked ? (
                  <Badge variant="success">Achieved</Badge>
                ) : (
                  <span className="text-xs text-muted">
                    {5 - unlockedChapterCount} chapters remaining
                  </span>
                )}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </PageShell>
  )
}
