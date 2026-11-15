import { Trophy, Sparkles } from 'lucide-react'
import type { AchievementRecord } from '@/contracts/rewards.ts'
import { useNovaAi } from '../context/AiContext.tsx'

export interface AchievementsAiGuideProps {
  unlockedAchievements: readonly AchievementRecord[]
}

export function AchievementsAiGuide({
  unlockedAchievements,
}: AchievementsAiGuideProps) {
  const { ask } = useNovaAi()

  const handleAskNextMilestone = () => {
    const unlockedIds = unlockedAchievements.map((a) => a.id).join(', ')
    void ask(
      `I currently have unlocked these official achievements: [${unlockedIds}]. Based on the official reward milestones (First Discovery, Story Finisher, Activity Master, Mission Complete), what milestones should I target next across the 5 missions?`,
      {
        persona: 'commander',
      },
    )
  }

  return (
    <section
      aria-label="Nova AI Achievement Guide"
      className="my-6 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-5 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-300" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">
              Nova AI Achievement Guide
            </h3>
          </div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Official Catalog Grounding
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-300">
          Earn XP and achievements by completing real mission activities, discovering scientific evidence, and finishing chapters. Nova helps you map out your milestone goals.
        </p>

        <div>
          <button
            onClick={handleAskNextMilestone}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/25"
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Plan Next Achievement Milestones</span>
          </button>
        </div>
      </div>
    </section>
  )
}
