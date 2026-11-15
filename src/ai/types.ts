import type { MissionId } from '@/missions/types.ts'

export interface GroundingSource {
  title: string
  url: string
  relevance?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  sources?: GroundingSource[]
  suggestedQuestions?: string[]
  isLive?: boolean
  model?: string
  isStreaming?: boolean
}

export type CompanionMode = 'ask' | 'briefing' | 'glossary' | 'voice'

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'muted'
  | 'error'

export interface AiContextState {
  route: string
  missionId?: MissionId
}

export interface ExplorerAiProfile {
  callsign?: string
  rank?: string
  xp?: number
  completedMissions?: string[]
}
