import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { AlertCircle, RotateCcw, Send, X } from 'lucide-react'
import { MarkdownView } from './MarkdownView.tsx'
import { useOptionalNovaAi } from './context/AiContext.tsx'
import type { GroundingSource } from './types.ts'
import './chatWindow.css'

const STORAGE_KEY = 'nova_chat_messages'

export type ChatMessage = {
  id: string
  role: 'user' | 'bot'
  text: string
  isError?: boolean
  retryQuery?: string
  sources?: GroundingSource[]
  isLive?: boolean
}

const STARTER_QUESTIONS = [
  'Tell me about Surveyor 3',
  'What did Opportunity discover?',
  'How did Ingenuity fly on Mars?',
  'What did InSight detect?',
  'Which mission went farthest?',
] as const

let messageCounter = 0
function generateMessageId(prefix: string): string {
  messageCounter += 1
  return `${prefix}-${messageCounter}`
}

async function streamResponseBody(
  body: ReadableStream<Uint8Array>,
  onChunk: (accumulated: string, isFirstToken: boolean) => void,
) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let isFirst = true

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    if (chunk) {
      accumulated += chunk
      onChunk(accumulated, isFirst)
      isFirst = false
    }
  }
}

export type ChatWindowProps = {
  open: boolean
  onClose: () => void
  missionId?: string
}

export function ChatWindow({ open, onClose, missionId }: ChatWindowProps) {
  const ai = useOptionalNovaAi()
  const [localMessages, setMessages] = useState<ChatMessage[]>(() => {
    if (ai) return []
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    }
    return []
  })

  const [input, setInput] = useState('')
  const [localLoading, setLoading] = useState(false)
  const loading = ai?.isStreaming ?? localLoading
  const messages: ChatMessage[] = ai
    ? ai.messages.map((message) => ({
        id: message.id,
        role: message.role === 'user' ? 'user' : 'bot',
        text: message.content,
        sources: message.sources,
        isLive: message.isLive,
      }))
    : localMessages
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  // Sync valid conversation history to sessionStorage
  useEffect(() => {
    if (ai) return
    try {
      const persistable = messages.filter((m) => !m.isError)
      if (persistable.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Ignore storage errors
    }
  }, [ai, messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      panelRef.current?.focus()
      const timer = setTimeout(() => {
        if (!loading) inputRef.current?.focus()
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [open, loading])

  // Auto-scroll to newest message
  useEffect(() => {
    if (open && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages, loading, open])

  // Escape key closes panel
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'Tab') {
      const controls = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), textarea:not(:disabled), a[href]',
      )
      const first = controls?.[0]
      const last = controls?.[controls.length - 1]
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === panelRef.current)
      ) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  }

  const handleSend = async (questionToSend?: string) => {
    const text = (questionToSend ?? input).trim()
    if (!text || loading) return

    if (ai) {
      setInput('')
      await ai.ask(text)
      inputRef.current?.focus()
      return
    }

    // Clean out previous error message if retrying
    const cleanHistory = messages.filter((m) => !m.isError)

    const userMsg: ChatMessage = {
      id: generateMessageId('msg-user'),
      role: 'user',
      text,
    }

    const updatedMessages = [...cleanHistory, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const botMsgId = generateMessageId('msg-bot')

    try {
      const isSimulatedError =
        text.toLowerCase() === '/error' ||
        text.toLowerCase() === 'simulate error'

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          mission: missionId,
          route: window.location.pathname,
          simulateError: isSimulatedError,
        }),
      })

      if (!response.ok) {
        let errData: { error?: string } = {}
        try {
          errData = await response.json()
        } catch {
          // Non-JSON error body
        }
        throw new Error(
          errData.error ||
            (response.status === 429
              ? 'Too many requests. Please wait a minute before asking again.'
              : 'Nova encountered a temporary issue. Please try again.'),
        )
      }

      if (!response.body) {
        throw new Error('No response stream received from Nova server.')
      }

      await streamResponseBody(
        response.body,
        (accumulatedText, isFirstToken) => {
          if (isFirstToken) {
            setLoading(false)
            setMessages((prev) => [
              ...prev,
              { id: botMsgId, role: 'bot', text: accumulatedText },
            ])
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId ? { ...m, text: accumulatedText } : m,
              ),
            )
          }
        },
      )
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Network error. Please try again.'
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId('err'),
          role: 'bot',
          text: errorMessage,
          isError: true,
          retryQuery: text,
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  const handleNewChat = () => {
    ai?.clear()
    setMessages([])
    setInput('')
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
    inputRef.current?.focus()
  }

  return (
    <>
      <div
        className={`nova-chat-backdrop ${open ? 'open' : ''}`.trim()}
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        ref={panelRef}
        tabIndex={-1}
        inert={!open}
        aria-hidden={!open}
        className={`nova-chat-window ${open ? 'open' : ''}`.trim()}
        role="dialog"
        aria-label="Nova AI chat"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        id="novaChatPanel"
      >
        {/* Header */}
        <header className="nova-chat-header">
          <div className="nova-chat-title-group">
            <div className="nova-chat-title-row">
              <span className="nova-online-dot" aria-hidden="true" />
              <span>Nova AI</span>
            </div>
            <span className="nova-chat-subtitle">NASA missions guide</span>
          </div>

          <div className="nova-chat-actions">
            <button
              type="button"
              className="nova-action-btn"
              onClick={handleNewChat}
              title="Start new chat"
              aria-label="New chat"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>New chat</span>
            </button>
            <button
              type="button"
              className="nova-close-btn"
              onClick={onClose}
              aria-label="Close Nova AI chat"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Message List */}
        <div
          ref={messagesContainerRef}
          className="nova-chat-messages"
          aria-live="polite"
          role="log"
          aria-label="Message history"
        >
          {/* Welcome greeting bubble */}
          <div className="nova-chat-msg bot">
            <MarkdownView content="Hi, I’m **Nova**, your NASA missions guide! Ask me about Surveyor 3, Opportunity, Ingenuity, InSight, Pioneer 10, or any mission on this site." />
          </div>

          {/* Conversation history */}
          {messages.map((msg) => {
            if (msg.isError) {
              return (
                <div key={msg.id} className="nova-chat-msg error" role="alert">
                  <div className="nova-error-content">
                    <AlertCircle size={16} aria-hidden="true" />
                    <span>{msg.text}</span>
                  </div>
                  {msg.retryQuery && (
                    <button
                      type="button"
                      className="nova-retry-btn"
                      onClick={() => handleSend(msg.retryQuery)}
                      aria-label={`Try again: ${msg.retryQuery}`}
                    >
                      <RotateCcw size={13} aria-hidden="true" />
                      <span>Try again</span>
                    </button>
                  )}
                </div>
              )
            }

            return (
              <div key={msg.id} className={`nova-chat-msg ${msg.role}`}>
                {msg.role === 'bot' ? (
                  <>
                    <MarkdownView content={msg.text} />
                    {msg.isLive === false && (
                      <p>Source guide answer — live AI is unavailable.</p>
                    )}
                    {Boolean(msg.sources?.length) && (
                      <ul aria-label="NASA sources">
                        {msg.sources?.map((source) => (
                          <li key={source.url}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                )}
              </div>
            )
          })}

          {/* Starter question chips shown before user sends first message */}
          {messages.length === 0 && (
            <div className="nova-starter-section">
              <span className="nova-starter-label">Suggested Questions</span>
              <div className="nova-starter-chips">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="nova-starter-chip"
                    onClick={() => handleSend(q)}
                  >
                    <span>{q}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3 bouncing dots typing indicator */}
          {loading && (
            <div className="nova-chat-msg bot">
              <div
                className="nova-typing-indicator"
                aria-label="Nova is replying"
              >
                <span className="nova-typing-dot" />
                <span className="nova-typing-dot" />
                <span className="nova-typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <footer className="nova-chat-footer">
          <form className="nova-chat-form" onSubmit={handleFormSubmit}>
            <textarea
              ref={inputRef}
              className="nova-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask about a mission... (Enter sends, Shift+Enter new line)"
              rows={1}
              disabled={loading}
              aria-label="Ask about a mission"
            />
            <button
              type="submit"
              className="nova-chat-send-btn"
              disabled={loading || !input.trim()}
              aria-label="Send question"
            >
              <Send size={15} aria-hidden="true" />
            </button>
          </form>
        </footer>
      </section>
    </>
  )
}
