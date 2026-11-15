import { useState } from 'react'
import { Sparkles, HelpCircle } from 'lucide-react'
import type { MissionDefinition } from '@/missions/types.ts'
import { useNovaAi } from '../context/AiContext.tsx'
import { NASA_MISSIONS_KNOWLEDGE } from '../../../services/ai/grounding.ts'

export interface MissionScienceGuideProps {
  mission: MissionDefinition
}

export function MissionScienceGuide({ mission }: MissionScienceGuideProps) {
  const { ask } = useNovaAi()
  const [inquiry, setInquiry] = useState('')

  const knowledge = NASA_MISSIONS_KNOWLEDGE[mission.id]

  const suggestions = [
    `What instruments did ${mission.displayName} carry?`,
    `Why was ${mission.displayName} left behind?`,
    `What was the biggest discovery of ${mission.displayName}?`,
    `How does ${mission.displayName} help future human space exploration?`,
  ]

  const handleAsk = (q: string) => {
    void ask(q, {
      persona: 'guide',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inquiry.trim()) {
      handleAsk(inquiry.trim())
      setInquiry('')
    }
  }

  return (
    <section
      aria-label={`${mission.displayName} AI Science Guide`}
      className="rounded-2xl border border-sky-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/30 p-5 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-lime-300" aria-hidden="true" />
            <h3 className="text-base font-bold text-white">
              Nova AI Science Guide: {mission.displayName}
            </h3>
          </div>
          <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-300">
            Verified NASA Grounding
          </span>
        </div>

        {knowledge && (
          <p className="text-xs leading-relaxed text-slate-300">
            {knowledge.summary}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            placeholder={`Ask Nova about ${mission.displayName} science or history...`}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inquiry.trim()}
            className="rounded-xl border border-sky-400/50 bg-sky-500/20 px-4 py-2 text-xs font-bold text-sky-200 transition-all hover:bg-sky-500/30 disabled:opacity-40"
          >
            Ask
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <HelpCircle size={12} aria-hidden="true" />
            <span>Suggested:</span>
          </span>
          {suggestions.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-lime-400/30 hover:bg-lime-400/10 hover:text-lime-200"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
