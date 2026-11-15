/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { MissionId } from '@/missions/types.ts'
import type { ChatMessage, VoiceState } from '../types.ts'
import { checkAiHealth, sendChatMessage } from '../services/aiClient.ts'
import { useVoiceSession } from '../voice/useVoiceSession.ts'

export interface AiContextValue {
  messages: ChatMessage[]
  simple: boolean
  setSimple: (simple: boolean) => void
  route: string
  missionId?: MissionId
  setMissionId: (id: MissionId) => void
  isStreaming: boolean
  isLive: boolean
  providerName: string
  isChatOpen: boolean
  setChatOpen: (open: boolean) => void
  ask: (
    question: string,
    options?: {
      persona?: 'guide' | 'commander' | 'copilot'
      contextData?: {
        rank?: string
        xp?: number
        completedMissions?: string[]
        currentSceneTitle?: string
        currentSceneType?: string
      }
    },
  ) => Promise<void>
  stopGeneration: () => void
  clear: () => void
  voice: {
    state: VoiceState
    amplitude: number
    transcript: string
    lastNovaSpoken: string
    errorMessage: string
    startSession: () => Promise<void>
    stopSession: () => void
    toggleMute: () => void
    interrupt: () => void
  }
}

const AiContext = createContext<AiContextValue | null>(null)

export interface AiProviderProps {
  children: ReactNode
  route: string
  missionId?: MissionId
  identityVersion?: number
}

export function NovaAiProvider({
  children,
  route,
  missionId: initialMissionId,
  identityVersion = 0,
}: AiProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [simple, setSimple] = useState(false)
  const [missionId, setMissionId] = useState<MissionId | undefined>(
    initialMissionId,
  )
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [providerName, setProviderName] = useState('Checking AI status...')
  const [isChatOpen, setChatOpen] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const messageIdCounter = useRef(0)

  // Check backend provider status on mount
  useEffect(() => {
    let mounted = true
    void checkAiHealth().then((health) => {
      if (mounted) {
        setIsLive(health.isConfigured)
        setProviderName(
          health.isConfigured ? health.provider : 'Source Guide Mode (Offline)',
        )
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const clear = useCallback(() => {
    stopGeneration()
    setMessages([])
  }, [stopGeneration])

  const ask = useCallback(
    async (
      question: string,
      options?: {
        persona?: 'guide' | 'commander' | 'copilot'
        contextData?: {
          rank?: string
          xp?: number
          completedMissions?: string[]
          currentSceneTitle?: string
          currentSceneType?: string
        }
      },
    ) => {
      if (!question.trim()) return

      setChatOpen(true)
      stopGeneration()
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const userMsgId = `msg-${++messageIdCounter.current}`
      const assistantMsgId = `msg-${++messageIdCounter.current}`

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: question.trim(),
        timestamp: Date.now(),
      }

      const initialAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      }

      setMessages((prev) => [
        ...prev.slice(-18),
        userMessage,
        initialAssistantMessage,
      ])
      setIsStreaming(true)

      let streamedText = ''

      try {
        const historyForApi = [
          ...messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user' as const, content: question.trim() },
        ]

        const result = await sendChatMessage({
          messages: historyForApi,
          simple,
          route,
          missionId,
          persona: options?.persona,
          contextData: options?.contextData,
          stream: true,
          signal: abortController.signal,
          onChunk: (chunk) => {
            streamedText += chunk
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: streamedText } : m,
              ),
            )
          },
        })

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: result.content || streamedText,
                  sources: result.sources,
                  suggestedQuestions: result.suggestedQuestions,
                  isLive: result.isLive,
                  model: result.model,
                  isStreaming: false,
                }
              : m,
          ),
        )
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') {
          // Keep whatever was streamed so far
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: streamedText || 'Generation stopped.',
                    isStreaming: false,
                  }
                : m,
            ),
          )
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      (err as Error).message ||
                      'Sorry, I could not complete that request. Please try again.',
                    isStreaming: false,
                  }
                : m,
            ),
          )
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          setIsStreaming(false)
          abortControllerRef.current = null
        }
      }
    },
    [messages, missionId, route, simple, stopGeneration],
  )

  const onVoiceMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev.slice(-19), msg])
  }, [])

  const voice = useVoiceSession({
    missionId,
    route,
    simple,
    onNewMessage: onVoiceMessage,
  })

  const stopVoiceSession = voice.stopSession
  useEffect(() => {
    setMissionId(initialMissionId)
    clear()
    stopVoiceSession()
    setChatOpen(false)
  }, [route, initialMissionId, identityVersion, clear, stopVoiceSession])

  useEffect(() => () => abortControllerRef.current?.abort(), [])

  const value: AiContextValue = {
    messages,
    simple,
    setSimple,
    route,
    missionId,
    setMissionId: (id) => setMissionId(id),
    isStreaming,
    isLive,
    providerName,
    isChatOpen,
    setChatOpen,
    ask,
    stopGeneration,
    clear,
    voice: {
      state: voice.voiceState,
      amplitude: voice.amplitude,
      transcript: voice.transcript,
      lastNovaSpoken: voice.lastNovaSpoken,
      errorMessage: voice.errorMessage,
      startSession: voice.startSession,
      stopSession: voice.stopSession,
      toggleMute: voice.toggleMute,
      interrupt: voice.interruptPlayback,
    },
  }

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>
}

export function useOptionalNovaAi(): AiContextValue | null {
  return useContext(AiContext)
}

export function useNovaAi(): AiContextValue {
  const context = useContext(AiContext)
  if (!context) {
    throw new Error('useNovaAi must be used within a NovaAiProvider')
  }
  return context
}
