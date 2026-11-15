import { Sparkles, Trophy, Target, BookMarked } from 'lucide-react'
import type { ExplorerProfile } from '@/contracts/index.ts'
import type { MissionProgressOverview, MissionProgress } from '@/contracts/progress.ts'
import { useNovaAi } from '../context/AiContext.tsx'

export interface ProfileAiInsightsProps {
  profile: ExplorerProfile | null
  progress: MissionProgressOverview | null
  journalCount: number
}

export function ProfileAiInsights({
  profile,
  progress,
  journalCount,
}: ProfileAiInsightsProps) {
  const { ask } = useNovaAi()

  const completedCount =
    progress?.missions.filter((m: MissionProgress) => m.status === 'completed').length ?? 0

  const handleAskGoals = () => {
    void ask(
      `As my space academy advisor, help me understand what skills and scientific concepts I have explored as a ${profile?.rank.name ?? 'Cadet'} with ${profile?.totalXp ?? 0} XP and ${completedCount} completed missions. Give me 3 encouraging study goals for my next exploration!`,
      {
        persona: 'commander',
        contextData: {
          rank: profile?.rank.name,
          xp: profile?.totalXp,
        },
      },
    )
  }

  return (
    <section
      aria-label="Nova AI Learning Insights"
      className="rounded-2xl border border-lime-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 p-5 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-lime-300" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">
              Nova AI Learning Insights
            </h3>
          </div>
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-300">
            Explorer Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-lime-300">
              <Trophy size={14} aria-hidden="true" />
              <span>Current Standing</span>
            </div>
            <p className="mt-1 text-sm font-bold text-white">
              {profile ? profile.rank.name : 'Cadet'}
            </p>
            <p className="text-[11px] text-slate-400">
              {profile ? `${profile.totalXp} Total XP Earned` : '0 XP'}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Target size={14} aria-hidden="true" />
              <span>Missions Finished</span>
            </div>
            <p className="mt-1 text-sm font-bold text-white">
              {completedCount} / 5 Dossiers
            </p>
            <p className="text-[11px] text-slate-400">
              {completedCount === 5
                ? 'Master Explorer achieved!'
                : `${5 - completedCount} dossiers remaining`}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <BookMarked size={14} aria-hidden="true" />
              <span>Discoveries</span>
            </div>
            <p className="mt-1 text-sm font-bold text-white">
              {journalCount} Logged
            </p>
            <p className="text-[11px] text-slate-400">
              Scientific artifacts analyzed
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <p className="text-xs text-slate-300">
            Nova provides personalized scientific feedback based on your academy progress.
          </p>
          <button
            onClick={handleAskGoals}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-lime-400/40 bg-lime-400/15 px-3 py-1.5 text-xs font-bold text-lime-300 hover:bg-lime-400/25"
          >
            <Sparkles size={13} aria-hidden="true" />
            <span>Ask for Study Goals</span>
          </button>
        </div>
      </div>
    </section>
  )
}
