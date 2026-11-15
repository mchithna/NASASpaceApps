import { useState } from 'react'
import { Link } from 'react-router'
import {
  Sparkles,
  Compass,
  Mic,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { MissionDefinition } from '@/missions/types.ts'
import type { MissionProgressOverview, MissionProgress } from '@/contracts/progress.ts'
import type { ExplorerProfile } from '@/contracts/index.ts'
import { NovaAi3DOrb } from '../components/NovaAi3DOrb.tsx'
import { useNovaAi } from '../context/AiContext.tsx'

export interface NovaMissionCommanderProps {
  profile: ExplorerProfile | null
  progress: MissionProgressOverview | null
  missions: readonly MissionDefinition[]
  journalCount: number
}

interface QuestionOfTheDay {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  nasaReference: string
}

const DAILY_QUESTIONS: QuestionOfTheDay[] = [
  {
    id: 'q1',
    question:
      'What did Opportunity discover inside eagle and endurance craters on Mars?',
    options: [
      'Subsurface liquid lakes',
      'Hematite spherules ("blueberries") formed in ancient water',
      'Frozen volcanic lava tubes',
      'Active water geysers',
    ],
    correctIndex: 1,
    explanation:
      'Opportunity discovered tiny gray hematite spheres nicknamed "blueberries" that precipitated from ancient, acidic groundwater billions of years ago.',
    nasaReference: 'NASA Mars Exploration Rover Opportunity Science Archive',
  },
  {
    id: 'q2',
    question:
      'Why did Ingenuity need ultra-fast rotor blades spinning around 2,400 RPM?',
    options: [
      'Mars has intense gale-force hurricane winds',
      'Mars gravity is twice as strong as Earth',
      'Martian atmospheric density is less than 1% of Earth’s',
      'To burn through frozen carbon dioxide fog',
    ],
    correctIndex: 2,
    explanation:
      'The Martian atmosphere has less than 1% the density of Earth’s surface air, requiring ultra-lightweight carbon fiber blades spinning roughly 5 times faster than standard helicopters.',
    nasaReference: 'NASA JPL Ingenuity Mars Helicopter Aerodynamics Report',
  },
]

export function NovaMissionCommander({
  profile,
  progress,
  missions,
  journalCount,
}: NovaMissionCommanderProps) {
  const { ask, voice } = useNovaAi()

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const completedMissions =
    progress?.missions.filter((m: MissionProgress) => m.status === 'completed') ?? []
  const completedIds = new Set(completedMissions.map((m: MissionProgress) => m.missionId))

  // Find next best mission to recommend based on real progress
  const unstartedMission = missions.find((m: MissionDefinition) => !completedIds.has(m.id))
  const recommendedMission = unstartedMission ?? missions[0]

  const dailyQ = DAILY_QUESTIONS[0]

  const handleStartVoice = () => {
    void voice.startSession()
  }

  const handleAskCommander = () => {
    void ask(
      `As Mission Commander, analyze my learning roadmap. I am a ${profile?.rank.name ?? 'Cadet'} with ${profile?.totalXp ?? 0} XP, ${completedMissions.length} completed missions, and ${journalCount} discoveries. What should I focus on next?`,
      {
        persona: 'commander',
        contextData: {
          rank: profile?.rank.name,
          xp: profile?.totalXp,
          completedMissions: completedMissions.map((m: MissionProgress) => m.missionId),
        },
      },
    )
  }

  return (
    <section
      aria-label="Nova AI Mission Commander"
      className="relative overflow-hidden rounded-2xl border border-lime-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 p-6 shadow-2xl backdrop-blur-xl"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Commander Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <NovaAi3DOrb size="dialog" state={voice.state} />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-lime-300">
                  Mission Commander
                </span>
                <span className="flex items-center gap-1.5 text-xs text-sky-300">
                  <span className="inline-block h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
                  AI Academy Telemetry Active
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:text-2xl">
                Academy Briefing & Learning Roadmap
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStartVoice}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2.5 text-sm font-semibold text-sky-200 transition-all hover:bg-sky-500/25 active:scale-95"
            >
              <Mic size={16} aria-hidden="true" />
              <span>Voice Commander</span>
            </button>
            <button
              onClick={handleAskCommander}
              className="inline-flex items-center gap-2 rounded-xl border border-lime-400/50 bg-lime-400/20 px-4 py-2.5 text-sm font-semibold text-lime-300 shadow-[0_0_15px_rgba(212,255,154,0.15)] transition-all hover:bg-lime-400/30 active:scale-95"
            >
              <Sparkles size={16} aria-hidden="true" />
              <span>Ask Commander</span>
            </button>
          </div>
        </div>

        {/* Commander Content Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column: Personalized Mission Recommendation */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-300">
                <Compass size={14} aria-hidden="true" />
                <span>Recommended Exploration</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-white">
                {recommendedMission ? recommendedMission.displayName : 'Next Objective'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {completedMissions.length === 0
                  ? 'Welcome Cadet! Nova recommends starting with Surveyor 3 to inspect the first lunar lander sampled by Apollo astronauts.'
                  : completedMissions.length === missions.length
                    ? 'Superb work, Explorer! You have completed all five historic dossiers. Continue reviewing scientific discoveries in your journal.'
                    : `Based on your ${profile?.rank.name ?? 'Cadet'} telemetry and ${completedMissions.length} completed dossiers, Nova recommends investigating ${recommendedMission.displayName} next.`}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-xs text-slate-400">
                Destination: {recommendedMission.destination}
              </span>
              <Link
                to={`/missions/${recommendedMission.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300 hover:text-lime-200"
              >
                <span>Open Dossier</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Column: AI Science Question of the Day */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                  <HelpCircle size={14} aria-hidden="true" />
                  Science Question of the Day
                </span>
                <span className="text-xs text-slate-400">Daily Challenge</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white">
                {dailyQ.question}
              </p>

              <div className="mt-3 flex flex-col gap-2">
                {dailyQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrect = idx === dailyQ.correctIndex

                  let btnStyle =
                    'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  if (showAnswer) {
                    if (isCorrect) {
                      btnStyle =
                        'border-lime-400/50 bg-lime-400/20 text-lime-200'
                    } else if (isSelected) {
                      btnStyle =
                        'border-red-400/50 bg-red-400/20 text-red-200'
                    }
                  } else if (isSelected) {
                    btnStyle =
                      'border-sky-400/50 bg-sky-400/20 text-sky-200'
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(idx)
                        setShowAnswer(true)
                      }}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {showAnswer && isCorrect && (
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-lime-300"
                        />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <AlertCircle
                          size={14}
                          className="shrink-0 text-red-400"
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {showAnswer && (
                <div className="mt-3 rounded-lg border border-lime-400/20 bg-lime-400/10 p-3 text-xs leading-relaxed text-lime-200">
                  <p>{dailyQ.explanation}</p>
                  <p className="mt-1 text-[10px] text-lime-400/70">
                    Source: {dailyQ.nasaReference}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
