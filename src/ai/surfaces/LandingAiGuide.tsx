import { useState } from 'react'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { useNovaAi } from '../context/AiContext.tsx'
import { NovaAi3DOrb } from '../components/NovaAi3DOrb.tsx'

export function LandingAiGuide() {
  const { ask } = useNovaAi()
  const [customQuestion, setCustomQuestion] = useState('')

  const suggestedQuestions = [
    'How does NovaExplorer work?',
    'What five spacecraft are abandoned on other worlds?',
    'Why is Surveyor 3 important to Apollo 12?',
    'How does the Gamified Academy reward progress?',
  ]

  const handleAsk = (q: string) => {
    void ask(q)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customQuestion.trim()) {
      void ask(customQuestion.trim())
      setCustomQuestion('')
    }
  }

  return (
    <section
      aria-label="Interactive AI Space Guide"
      className="relative mx-auto my-12 max-w-5xl overflow-hidden rounded-3xl border border-lime-400/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 p-6 shadow-2xl backdrop-blur-xl md:p-8"
    >
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-4">
          <NovaAi3DOrb size="dialog" />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-lime-300">
                Interactive Space Guide
              </span>
              <span className="text-xs text-sky-300">Live AI Telemetry</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white md:text-2xl">
              Meet Nova — Your Academy Space Guide
            </h2>
            <p className="mt-1 text-xs text-slate-300 md:text-sm">
              Discover why NASA leaves equipment behind on the Moon, Mars, and outer space.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask Nova anything about our missions..."
            className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-lime-400/50 bg-lime-400/20 px-4 py-2.5 text-xs font-bold text-lime-300 shadow-[0_0_12px_rgba(212,255,154,0.15)] transition-all hover:bg-lime-400/30 disabled:opacity-40"
          >
            <span>Ask</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <span className="flex items-center gap-1 text-xs font-semibold text-sky-400">
          <HelpCircle size={14} aria-hidden="true" />
          <span>Quick Inquiries:</span>
        </span>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleAsk(q)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-lime-400/40 hover:bg-lime-400/10 hover:text-lime-200"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  )
}
