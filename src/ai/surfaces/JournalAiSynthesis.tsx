import { Sparkles, Brain, HelpCircle } from 'lucide-react'
import type { JournalEntry } from '@/contracts/index.ts'
import { useNovaAi } from '../context/AiContext.tsx'

export interface JournalAiSynthesisProps {
  entries: readonly JournalEntry[]
}

export function JournalAiSynthesis({ entries }: JournalAiSynthesisProps) {
  const { ask } = useNovaAi()

  const handleSynthesize = () => {
    if (entries.length === 0) {
      void ask(
        'I have not logged any space discoveries yet. Can you give me an overview of the kinds of scientific discoveries made by Surveyor 3, Opportunity, Ingenuity, InSight, and Pioneer 10?',
      )
      return
    }

    const titles = entries.map((e) => `"${e.title}" (${e.missionId})`).join(', ')
    void ask(
      `Synthesize the scientific connections between my logged discoveries: ${titles}. What big planetary science questions do these discoveries help answer? Give me 2 follow-up study questions!`,
    )
  }

  const handleCompareMissions = () => {
    void ask(
      'Compare the water and soil evidence gathered by Surveyor 3 on the Moon versus Opportunity and InSight on Mars. How are lunar and Martian soil environments different?',
    )
  }

  return (
    <section
      aria-label="Nova AI Journal Synthesis"
      className="my-6 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/20 p-5 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-sky-300" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">
              Nova AI Discovery Synthesizer
            </h3>
          </div>
          <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
            {entries.length} Discoveries Logged
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-300">
          Nova analyzes your verified scientific discoveries to reveal deep connections across the solar system.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleSynthesize}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-500/25"
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Synthesize My Discoveries</span>
          </button>
          <button
            onClick={handleCompareMissions}
            className="inline-flex items-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/15 px-3.5 py-2 text-xs font-semibold text-lime-300 transition-colors hover:bg-lime-400/25"
          >
            <HelpCircle size={14} aria-hidden="true" />
            <span>Compare Moon vs Mars Science</span>
          </button>
        </div>
      </div>
    </section>
  )
}
