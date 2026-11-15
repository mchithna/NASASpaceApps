import { HelpCircle } from 'lucide-react'
import { useNovaAi } from '../context/AiContext.tsx'

export function AuthAiHelper() {
  const { ask } = useNovaAi()

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-sky-400/20 bg-sky-950/30 p-3.5 text-xs text-sky-200">
      <div className="flex items-center gap-2 font-semibold text-sky-300">
        <HelpCircle size={14} aria-hidden="true" />
        <span>Need guidance on choosing Guest vs Account?</span>
      </div>
      <p className="text-[11px] text-slate-300">
        Guest mode saves progress locally in this browser tab. An account lets you save your rank, XP, and badges across devices.
      </p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() =>
            void ask(
              'What is the difference between exploring as a guest and creating an academy account?',
            )
          }
          className="text-left text-[11px] font-bold text-lime-300 hover:underline"
        >
          Ask Nova about explorer accounts ↗
        </button>
      </div>
    </div>
  )
}
