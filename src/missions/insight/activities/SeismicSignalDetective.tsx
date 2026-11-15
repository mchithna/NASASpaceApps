import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button.tsx'
import type { ActivityRenderProps } from '@/engine/activityRegistry.ts'
import { useActivityAttempt } from '@/engine/activities/useActivityAttempt.ts'
import styles from './InsightSignals.module.css'

const audioSrc = '/assets/missions/insight/first-likely-marsquake.wav'

type SignalId = 'wind' | 'arm' | 'quake'

const signals: readonly {
  id: SignalId
  code: string
  name: string
  summary: string
  clue: string
  miss: string
  path: string
}[] = [
  {
    id: 'wind',
    code: 'Signal A',
    name: 'Wind-Related Vibrations',
    summary:
      'Martian winds can create vibrations that a sensitive seismometer detects.',
    clue: 'This vibration grows and fades together with the wind record from the weather sensors.',
    miss: 'Wind can shake the ground, but a vibration that follows the wind is weather noise, not a marsquake. Compare it with the other clues.',
    path: 'M0 36 C12 18 20 54 32 34 S52 14 64 40 S84 60 98 28 S118 10 132 46 S152 62 168 30 S188 12 204 44 S226 64 242 32 S262 16 280 36',
  },
  {
    id: 'arm',
    code: 'Signal B',
    name: 'Spacecraft Movement',
    summary:
      'Moving parts on the lander, including the robotic arm, can also shake the instrument.',
    clue: 'These short jolts start and stop at the same time the robotic arm moves to take a picture.',
    miss: 'A vibration that lines up with the arm comes from the spacecraft, not from inside Mars. Look for a clue that does not match the lander’s own motion.',
    path: 'M0 44 H78 L86 14 L94 44 H168 L176 18 L184 44 H280',
  },
  {
    id: 'quake',
    code: 'Signal C',
    name: 'Possible Marsquake',
    summary:
      'Scientists compare a vibration with wind, spacecraft motion, and other observations before they investigate it as a seismic event.',
    clue: 'This vibration continues after the arm is still, and it does not follow the wind. On April 6, 2019, the clearest signal of this kind was the first event the team called a likely marsquake. A drawing alone cannot identify every real marsquake.',
    miss: '',
    path: 'M0 44 H68 L78 8 L92 64 L106 16 L120 54 L134 26 L150 46 L168 38 H280',
  },
]

function Waveform({ path }: { path: string }) {
  return (
    <svg className={styles.wave} viewBox="0 0 280 72" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export function SeismicSignalDetective(props: ActivityRenderProps) {
  const identity = `${props.sceneId}:${props.activityId}`
  const attempt = useActivityAttempt(identity, props.completed || props.replay)
  const [selected, setSelected] = useState<SignalId | null>(null)
  const [identified, setIdentified] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioNote, setAudioNote] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const solved = identified || attempt.phase === 'correct'
  const chosen = signals.find((signal) => signal.id === selected)

  function analyze(): void {
    if (attempt.inputsLocked || identified) {
      return
    }

    if (!chosen) {
      attempt.miss()
      setFeedback('Choose a signal before you analyze it.')
      return
    }

    if (chosen.id !== 'quake') {
      attempt.miss()
      setFeedback(chosen.miss)
      return
    }

    setFeedback(null)
    setIdentified(true)
  }

  function save(): void {
    attempt.succeed(props.onComplete)
  }

  async function toggleAudio(): Promise<void> {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (!audio.paused) {
      audio.pause()
      return
    }

    try {
      await audio.play()
      setAudioNote(null)
    } catch {
      setAudioNote(
        'The recording could not be played. Use the signal descriptions instead.',
      )
    }
  }

  return (
    <div className={styles.panel}>
      <div>
        <h3 className="font-heading text-xl font-semibold">Decode the Marsquake</h3>
        <p className={styles.copy}>
          InSight&apos;s seismometer has detected several unusual vibrations.
          Some come from the Martian environment, while others may originate
          deep within the planet. Can you identify the likely marsquake?
        </p>
      </div>
      <p className={styles.copy}>
        <strong className="text-white">Examine the signals and identify the strongest evidence of a marsquake.</strong>
      </p>
      <p className={styles.note}>
        Educational drawings, not NASA measurements. The optional recording is
        the real April 6, 2019 event sped up 60 times. It mixes wind, the
        seismic signal, and the robotic arm. These cards separate those ideas
        for practice. Looking at a waveform is not how scientists identify
        every marsquake.
      </p>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          aria-pressed={playing}
          onClick={() => void toggleAudio()}
        >
          {playing ? 'Pause NASA recording' : 'Play NASA recording'}
        </Button>
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      </div>
      <p className={styles.note}>
        Credit: NASA/JPL-Caltech/CNES/IPGP/Imperial College London. The original
        vibrations were too low to hear. You can finish this activity without
        playing the recording.
      </p>
      {audioNote ? (
        <p role="status" className={styles.note}>
          {audioNote}
        </p>
      ) : null}
      <div className={styles.cards}>
        {signals.map((signal) => (
          <button
            key={signal.id}
            type="button"
            className={styles.card}
            aria-pressed={selected === signal.id}
            disabled={solved}
            onClick={() => setSelected(signal.id)}
          >
            <span className={styles.kicker}>{signal.code}</span>
            <span className={styles.title}>{signal.name}</span>
            <Waveform path={signal.path} />
            <span className={styles.copy}>{signal.summary}</span>
            {selected === signal.id ? (
              <span className={styles.kicker}>Selected</span>
            ) : null}
          </button>
        ))}
      </div>
      <div className={styles.clue}>
        <p>
          {chosen
            ? chosen.clue
            : 'Select each signal to read the clue that came with it.'}
        </p>
      </div>
      {feedback && !solved ? (
        <p role="status" className={styles.note}>
          {feedback}
        </p>
      ) : null}
      {solved ? (
        <div className={styles.success} role="status">
          <p className="font-semibold text-white">Investigation Complete</p>
          <p>
            InSight detected its first likely marsquake in April 2019. By
            recording vibrations from Mars, scientists gained a new way to
            investigate the planet&apos;s interior.
          </p>
          <p>
            That April 6, 2019 signal, on sol 128, was clearer than several
            earlier ambiguous events. The team compared it with wind and with
            the robotic arm. They did not identify it merely by listening to an
            audio clip.
          </p>
        </div>
      ) : (
        <Button onClick={analyze}>Analyze Signal</Button>
      )}
      {solved ? (
        <Button
          onClick={save}
          disabled={props.completed || props.replay}
        >
          Save signal investigation
        </Button>
      ) : null}
    </div>
  )
}
