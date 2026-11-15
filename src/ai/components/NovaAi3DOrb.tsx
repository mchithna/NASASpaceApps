import type { VoiceState } from '../types.ts'

export interface NovaAi3DOrbProps {
  size?: 'compact' | 'dialog' | 'inline'
  state?: VoiceState | 'disconnected'
}

export function NovaAi3DOrb({ size = 'compact', state = 'idle' }: NovaAi3DOrbProps) {
  const sizeClasses = {
    compact: 'w-10 h-10',
    dialog: 'w-16 h-16',
    inline: 'w-8 h-8',
  }[size]

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses} rounded-full select-none`}
      data-testid="nova-ai-orb"
      data-state={state}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-pulse" />
      <div className="relative w-full h-full rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-900/60 via-slate-900/90 to-blue-950/80 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden">
        <div className="absolute inset-1 rounded-full border border-cyan-300/30 animate-[spin_8s_linear_infinite]" />
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8]" />
      </div>
    </div>
  )
}
