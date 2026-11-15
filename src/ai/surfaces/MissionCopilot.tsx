import { useState } from 'react'
import { Bot, Lightbulb, Mic, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useNovaAi } from '../context/AiContext.tsx'

export interface MissionCopilotProps {
  missionId: string
  sceneTitle: string
  sceneType?: string
}

export function MissionCopilot({
  missionId,
  sceneTitle,
  sceneType = 'Activity',
}: MissionCopilotProps) {
  const { ask, voice } = useNovaAi()
  const [expanded, setExpanded] = useState(false)
  const [copilotQuestion, setCopilotQuestion] = useState('')

  const handleExplainScene = () => {
    void ask(
      `Can you explain the historical and scientific background of "${sceneTitle}" in the ${missionId} mission? Explain the science simply so I can understand the concepts.`,
      {
        persona: 'copilot',
        contextData: {
          currentSceneTitle: sceneTitle,
          currentSceneType: sceneType,
        },
      },
    )
  }

  const handleRequestHint = () => {
    void ask(
      `Without giving away the exact answer to this activity, give me an educational clue or scientific concept hint to help me figure out "${sceneTitle}".`,
      {
        persona: 'copilot',
        contextData: {
          currentSceneTitle: sceneTitle,
          currentSceneType: sceneType,
        },
      },
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (copilotQuestion.trim()) {
      void ask(copilotQuestion.trim(), {
        persona: 'copilot',
        contextData: {
          currentSceneTitle: sceneTitle,
          currentSceneType: sceneType,
        },
      })
      setCopilotQuestion('')
    }
  }

  return (
    <aside
      aria-label="Nova Mission Copilot"
      className="my-4 rounded-xl border border-lime-400/30 bg-slate-950/80 p-4 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-400/40 bg-lime-400/10 text-lime-300">
            <Bot size={18} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-300">
                Nova Mission Copilot
              </span>
              <span className="text-[10px] text-slate-400">
                Learning Assistant · No auto-solve
              </span>
            </div>
            <p className="text-xs text-white">
              Current Scene: <strong>{sceneTitle}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void voice.startSession()}
            className="flex items-center gap-1 rounded-lg border border-sky-400/30 bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-500/25"
            aria-label="Ask Copilot via voice"
          >
            <Mic size={12} aria-hidden="true" />
            <span className="hidden sm:inline">Voice</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse Copilot tools' : 'Expand Copilot tools'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExplainScene}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-400/20"
            >
              <BookOpen size={13} aria-hidden="true" />
              <span>Explain this scene</span>
            </button>
            <button
              onClick={handleRequestHint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/20"
            >
              <Lightbulb size={13} aria-hidden="true" />
              <span>Request concept hint</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={copilotQuestion}
              onChange={(e) => setCopilotQuestion(e.target.value)}
              placeholder="Ask Copilot about this scene or evidence..."
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-lime-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!copilotQuestion.trim()}
              className="rounded-lg border border-lime-400/40 bg-lime-400/20 px-3 py-1.5 text-xs font-bold text-lime-300 hover:bg-lime-400/30 disabled:opacity-40"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </aside>
  )
}
