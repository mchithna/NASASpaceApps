export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GroundingSource {
  title: string
  url: string
  relevance?: string
}

export interface ChatRequestOptions {
  messages: ChatMessage[]
  simple?: boolean
  route?: string
  missionId?: string
  stream?: boolean
  persona?: 'guide' | 'commander' | 'copilot'
  contextData?: {
    rank?: string
    xp?: number
    completedMissions?: string[]
    currentSceneTitle?: string
    currentSceneType?: string
  }
}

export interface ChatResponse {
  content: string
  sources: GroundingSource[]
  suggestedQuestions: string[]
  isLive: boolean
  model: string
}

export interface TtsRequestOptions {
  text: string
  voiceName?: string
}

export interface TtsResponse {
  audioBase64: string
  mimeType: string
}

export interface AiProvider {
  name: string
  isAvailable(): boolean
  generateChat(options: ChatRequestOptions): Promise<ChatResponse>
  streamChat(
    options: ChatRequestOptions,
    onChunk: (chunk: string) => void,
  ): Promise<ChatResponse>
  synthesizeSpeech(options: TtsRequestOptions): Promise<TtsResponse>
}
