import type { VoiceState } from '../types.ts'

export interface VoiceWaveformProps {
  state: VoiceState
  amplitude: number
}

export function VoiceWaveform({ state, amplitude }: VoiceWaveformProps) {
  const barCount = 18

  // Base state color and height scaling
  const getBarHeight = (index: number): number => {
    if (state === 'muted') return 4
    if (state === 'idle') {
      return 6 + Math.sin(index * 0.5) * 3
    }
    if (state === 'thinking') {
      return 10 + Math.sin(index * 0.8) * 6
    }
    // Speaking or listening: reacts to real audio amplitude
    const centerFactor = 1 - Math.abs(index - barCount / 2) / (barCount / 2)
    const dynamicAmp = Math.max(0.1, amplitude) * 40 * centerFactor
    const base = 8
    return Math.min(50, Math.max(4, base + dynamicAmp + (index % 3) * 4))
  }

  const getStateClasses = (): string => {
    switch (state) {
      case 'listening':
        return 'nova-waveform-listening'
      case 'thinking':
        return 'nova-waveform-thinking'
      case 'speaking':
        return 'nova-waveform-speaking'
      case 'muted':
        return 'nova-waveform-muted'
      default:
        return 'nova-waveform-idle'
    }
  }

  return (
    <div
      className={`nova-ai-waveform-container ${getStateClasses()}`}
      role="img"
      aria-label={`Voice activity: ${state}`}
    >
      <div className="nova-ai-waveform-bars">
        {Array.from({ length: barCount }).map((_, i) => (
          <span
            key={i}
            className="nova-ai-waveform-bar"
            style={{
              height: `${getBarHeight(i)}px`,
              transition:
                state === 'thinking' || state === 'idle'
                  ? 'height 0.2s ease'
                  : 'height 0.05s ease-out',
            }}
          />
        ))}
      </div>
    </div>
  )
}
