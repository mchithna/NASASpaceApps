import { useEffect } from 'react'
import { Link } from 'react-router'
import { Award } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { achievementCatalog } from '@/contracts/rewards.ts'
import { lookupMission } from '@/missions/registry.ts'
import {
  PageShell,
  PersonaSwitcher,
  StatusBanner,
} from '@/pages/components/index.ts'
import { usePlatformData } from '@/pages/hooks/usePlatformData.ts'
import { AchievementsHero } from './components/achievements/AchievementsHero.tsx'
import {
  AchievementCard,
  type ChapterBadgeItem,
} from './components/achievements/AchievementCard.tsx'
import { GuardianMetaBadge } from './components/achievements/GuardianMetaBadge.tsx'
import styles from './components/achievements/achievements.module.css'

export function AchievementsPage() {
  const { achievements, session, isLoading, error, refresh } = usePlatformData()

  useEffect(() => {
    document.title = 'Achievements · NovaExplorer'
  }, [])

  const isSignedOut = session?.status === 'signed-out'

  // Map each catalog chapter achievement to its unlocked status
  const chapterBadges: ChapterBadgeItem[] = achievementCatalog.map(
    (catalogItem) => {
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
    },
  )

  const unlockedChapterCount = chapterBadges.filter((b) => b.isUnlocked).length
  const isGuardianUnlocked = unlockedChapterCount === 5
  const totalAchievements = chapterBadges.length + 1 // 5 chapters + 1 Guardian meta badge
  const totalUnlocked = unlockedChapterCount + (isGuardianUnlocked ? 1 : 0)

  return (
    <PageShell
      visual="surveyor-3"
      title="Achievements"
      description="Honors and story insignia awarded by the Academy for investigating abandoned NASA spacecraft."
      eyebrow="Academy Honors"
      isLoading={isLoading}
      error={error}
      onRetry={() => void refresh()}
      actions={<PersonaSwitcher />}
    >
      <div className={styles.achievementsContainer}>
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

        {/* Overview Hero Banner */}
        <AchievementsHero
          totalUnlocked={totalUnlocked}
          totalAchievements={totalAchievements}
        />

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
          className={styles.badgesSection}
        >
          <div className={styles.sectionHeader}>
            <h3 id="chapter-badges-heading" className={styles.sectionTitle}>
              Mission Chapter Badges
            </h3>
            <p className={styles.sectionSubtitle}>
              Awarded upon concluding each spacecraft&apos;s historical chapter.
            </p>
          </div>

          <div className={styles.badgeGrid}>
            {chapterBadges.map((badge) => (
              <AchievementCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>

        {/* Final Milestone Meta-Badge */}
        <GuardianMetaBadge
          isGuardianUnlocked={isGuardianUnlocked}
          unlockedChapterCount={unlockedChapterCount}
        />
      </div>
    </PageShell>
  )
}
