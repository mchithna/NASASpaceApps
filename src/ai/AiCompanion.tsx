import { useRef, useState, type FormEvent } from 'react'
import { Bot, BookOpen, Mic, Send, Sparkles } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog.tsx'
import { listMissions } from '@/missions/registry.ts'
import type { MissionId } from '@/missions/types.ts'
import {
  answerLocally,
  briefings,
  glossary,
  type LocalAnswer,
} from './knowledge.ts'
import './companion.css'

export type AiContext = { route: string; missionId?: MissionId }
export type AiCompanionProps = { context: AiContext }
type Message = LocalAnswer & { question: string; id: number }

function NovaAi3DOrb({ size = 'launcher' }: { size?: 'launcher' | 'dialog' }) {
  return (
    <span
      className={`nova-ai-3d-orb ${size === 'dialog' ? 'nova-ai-3d-orb-lg' : ''}`}
      aria-hidden="true"
    >
      <span className="nova-ai-3d-halo" />
      <span className="nova-ai-3d-ring nova-ai-3d-ring-outer" />
      <span className="nova-ai-3d-ring nova-ai-3d-ring-inner" />
      <span className="nova-ai-3d-core">
        <span className="nova-ai-3d-visor">
          <span className="nova-ai-3d-eye" />
          <span className="nova-ai-3d-eye" />
        </span>
      </span>
      <span className="nova-ai-3d-node" />
    </span>
  )
}

export function AiCompanion({ context }: AiCompanionProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'ask' | 'briefing' | 'glossary' | 'voice'>(
    'ask',
  )
  const [missionId, setMissionId] = useState<MissionId>(
    context.missionId ?? 'surveyor-3',
  )
  const [simple, setSimple] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const nextId = useRef(0)
  const launcher = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  const card = briefings[missionId]

  function close() {
    setOpen(false)
    launcher.current?.focus()
  }

  function ask(value: string) {
    if (!value.trim()) return
    const answer = answerLocally(value, simple)
    setMessages((previous) => [
      ...previous.slice(-19),
      { ...answer, question: value.trim(), id: ++nextId.current },
    ])
    setQuestion('')
    setNotice('Source guide answer ready. Newest answer appears first.')
    input.current?.focus()
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    ask(question)
  }

  return (
    <>
      <button
        ref={launcher}
        className="nova-ai-launcher"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Ask Nova AI"
      >
        <NovaAi3DOrb size="launcher" />
        <span className="nova-ai-launcher-copy">
          <span className="nova-ai-launcher-kicker" aria-hidden="true">
            3D AI Telemetry Guide
          </span>
          <span className="nova-ai-launcher-title">Ask Nova AI</span>
        </span>
      </button>
      <Dialog
        open={open}
        onClose={close}
        title="Nova AI companion"
        description="Your space learning companion. Source guide mode is available now; live AI chat and voice are not connected."
      >
        <div className="nova-ai-panel">
          <div className="nova-ai-hero-banner">
            <NovaAi3DOrb size="dialog" />
            <p className="nova-ai-disclosure">
              Reviewed NASA summaries · Runs on this device · No XP or journal
              changes
            </p>
          </div>
          <nav aria-label="Companion tools" className="nova-ai-tools">
            {(
              [
                ['ask', 'Ask Nova', Bot],
                ['briefing', 'Mission briefing', Sparkles],
                ['glossary', 'Space glossary', BookOpen],
                ['voice', 'Live voice', Mic],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                aria-pressed={mode === value}
                onClick={() => {
                  setMode(value)
                  setNotice('')
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
          <label className="nova-ai-simple">
            <input
              type="checkbox"
              checked={simple}
              onChange={(event) => setSimple(event.target.checked)}
            />{' '}
            Explain simply
          </label>
          {mode === 'ask' && (
            <section aria-label="Ask Nova source guide">
              <p>
                Choose a topic or enter its name. Answers are fixed source
                summaries, not generated conversation.
              </p>
              <div className="nova-ai-topics">
                {['Opportunity', 'InSight', 'Telemetry', 'App help'].map(
                  (topic) => (
                    <button key={topic} onClick={() => ask(topic)}>
                      {topic}
                    </button>
                  ),
                )}
              </div>
              <form onSubmit={submit} className="nova-ai-form">
                <label htmlFor="nova-ai-question">
                  What would you like to explore?
                </label>
                <div>
                  <input
                    ref={input}
                    id="nova-ai-question"
                    value={question}
                    maxLength={500}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Try: What is a seismometer?"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!question.trim()}
                    aria-label="Ask source guide"
                  >
                    <Send size={18} aria-hidden="true" />
                  </button>
                </div>
              </form>
              <p role="status" className="nova-ai-status">
                {notice}
              </p>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([])
                    setQuestion('')
                    setNotice('Conversation cleared.')
                  }}
                >
                  Clear conversation
                </button>
              )}
              <ol aria-label="Conversation" className="nova-ai-messages">
                {[...messages].reverse().map((message) => (
                  <li key={message.id}>
                    <h3>{message.question}</h3>
                    <p>{message.text}</p>
                    {message.source && (
                      <a
                        href={message.source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {message.source.title} ↗
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {mode === 'briefing' && (
            <section aria-label="Mission briefing">
              <label htmlFor="nova-ai-mission">Choose a spacecraft</label>
              <select
                id="nova-ai-mission"
                value={missionId}
                onChange={(event) =>
                  setMissionId(event.target.value as MissionId)
                }
              >
                {listMissions().map((mission) => (
                  <option key={mission.id} value={mission.id}>
                    {mission.displayName}
                  </option>
                ))}
              </select>
              <h3>{card.title}</h3>
              <p>{simple ? card.simple : card.explanation}</p>
              <a href={card.source.url} target="_blank" rel="noreferrer">
                {card.source.title} ↗
              </a>
              <p className="nova-ai-disclosure">
                Briefings are reading guides. Chapter availability is shown on
                the mission page.
              </p>
            </section>
          )}
          {mode === 'glossary' && (
            <section aria-label="Space glossary">
              <dl>
                {glossary.map((term) => (
                  <div key={term.title}>
                    <dt>{term.title}</dt>
                    <dd>
                      <p>{simple ? term.simple : term.explanation}</p>
                      <a
                        href={term.source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {term.source.title} ↗
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {mode === 'voice' && (
            <section aria-label="Voice availability">
              <h3>Live voice is not available yet</h3>
              <p>
                Voice conversations need a connected service approved for this
                app’s learners. Your microphone is not being accessed. Use the
                source guide to keep exploring.
              </p>
              <button onClick={() => setMode('ask')}>Use source guide</button>
            </section>
          )}
        </div>
      </Dialog>
    </>
  )
}
