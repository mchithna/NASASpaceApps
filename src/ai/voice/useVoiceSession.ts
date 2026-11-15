import { useCallback, useEffect, useRef, useState } from 'react'
import type { VoiceState, ChatMessage } from '../types.ts'
import { AudioAnalyser } from './audioAnalyser.ts'
import { sendChatMessage, synthesizeSpeech } from '../services/aiClient.ts'

interface SpeechRecognitionEvent {
  resultIndex: number
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
      isFinal: boolean
    }
    length: number
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: () => void
  onend: () => void
  onerror: (event: { error: string }) => void
  onresult: (event: SpeechRecognitionEvent) => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export interface UseVoiceSessionProps {
  missionId?: string
  route: string
  simple: boolean
  onNewMessage?: (msg: ChatMessage) => void
}

export function useVoiceSession({
  missionId,
  route,
  simple,
  onNewMessage,
}: UseVoiceSessionProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [amplitude, setAmplitude] = useState<number>(0)
  const [transcript, setTranscript] = useState<string>('')
  const [lastNovaSpoken, setLastNovaSpoken] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AudioAnalyser | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMutedRef = useRef(false)
  const voiceStateRef = useRef<VoiceState>('idle')

  useEffect(() => {
    voiceStateRef.current = voiceState
  }, [voiceState])

  // Stop current audio playback immediately (interruption)
  const interruptPlayback = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.src = ''
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Process user question through Nova AI and speak answer
  const handleUserQuestion = useCallback(
    async (question: string) => {
      if (!question.trim()) return

      interruptPlayback()
      setVoiceState('thinking')
      setErrorMessage('')

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question.trim(),
        timestamp: Date.now(),
      }
      onNewMessage?.(userMessage)

      try {
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        // 1. Get AI answer
        const aiResult = await sendChatMessage({
          messages: [{ role: 'user', content: question.trim() }],
          simple,
          route,
          missionId,
          signal: abortController.signal,
        })

        const assistantMessage: ChatMessage = {
          id: `nova-${Date.now()}`,
          role: 'assistant',
          content: aiResult.content,
          timestamp: Date.now(),
          sources: aiResult.sources,
          suggestedQuestions: aiResult.suggestedQuestions,
          isLive: aiResult.isLive,
          model: aiResult.model,
        }
        onNewMessage?.(assistantMessage)
        setLastNovaSpoken(aiResult.content)

        // 2. Synthesize speech
        setVoiceState('speaking')
        const ttsResult = await synthesizeSpeech(
          aiResult.content,
          abortController.signal,
        )

        // 3. Play audio through Audio element with analyser
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio()
        }

        const audio = audioPlayerRef.current
        audio.src = `data:${ttsResult.mimeType};base64,${ttsResult.audioBase64}`

        // Connect audio element to analyser so waveform reacts to Nova's voice!
        if (analyserRef.current) {
          analyserRef.current.connectAudioElement(audio, (amp) => {
            setAmplitude(amp)
          })
        }

        audio.onended = () => {
          setVoiceState('listening')
          // Reconnect microphone analyser
          if (streamRef.current && analyserRef.current) {
            void analyserRef.current.connectStream(streamRef.current, (amp) => {
              setAmplitude(amp)
            })
          }
        }

        audio.onerror = () => {
          setVoiceState('listening')
        }

        await audio.play()
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') {
          // Interrupted naturally by user
          return
        }
        setErrorMessage(
          (err as Error).message || 'Voice communication failed. Retrying...',
        )
        setVoiceState('listening')
      }
    },
    [interruptPlayback, missionId, onNewMessage, route, simple],
  )

  // Start live voice session
  const startSession = useCallback(async () => {
    setErrorMessage('')
    interruptPlayback()

    try {
      // Check for SpeechRecognition
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition

      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // 2. Setup audio analyser for mic
      if (!analyserRef.current) {
        analyserRef.current = new AudioAnalyser()
      }
      await analyserRef.current.connectStream(stream, (amp) => {
        setAmplitude(amp)
      })

      // 3. Initialize speech recognition if supported
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setVoiceState('listening')
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            } else {
              interimTranscript += result[0].transcript
            }
          }

          const currentText = (finalTranscript || interimTranscript).trim()
          setTranscript(currentText)

          // If user speaks while Nova is speaking, interrupt Nova!
          if (voiceStateRef.current === 'speaking' && currentText.length > 2) {
            interruptPlayback()
            setVoiceState('listening')
          }

          if (finalTranscript.trim()) {
            void handleUserQuestion(finalTranscript.trim())
            setTranscript('')
          }
        }

        recognition.onerror = (event: { error: string }) => {
          if (event.error === 'no-speech') return
          setErrorMessage(`Microphone note: ${event.error}`)
        }

        recognition.onend = () => {
          // Restart recognition if still active
          if (voiceStateRef.current !== 'idle' && !isMutedRef.current) {
            try {
              recognition.start()
            } catch {
              // Ignore restart error
            }
          }
        }

        recognitionRef.current = recognition
        recognition.start()
      } else {
        setVoiceState('listening')
        setErrorMessage(
          'Browser speech recognition is not supported in this browser. You can still use chat or type your questions.',
        )
      }
    } catch {
      setVoiceState('error')
      setErrorMessage(
        'Microphone access denied or unavailable. Please enable microphone permissions in your browser to speak with Nova.',
      )
    }
  }, [handleUserQuestion, interruptPlayback])

  // Stop/end live voice session
  const stopSession = useCallback(() => {
    interruptPlayback()
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }

    setVoiceState('idle')
    setAmplitude(0)
    setTranscript('')
  }, [interruptPlayback])

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        isMutedRef.current = !audioTrack.enabled
        setVoiceState(audioTrack.enabled ? 'listening' : 'muted')
      }
    }
  }, [])

  // Cleanup on unmount or navigation
  useEffect(() => {
    return () => {
      stopSession()
    }
  }, [stopSession])

  return {
    voiceState,
    amplitude,
    transcript,
    lastNovaSpoken,
    errorMessage,
    startSession,
    stopSession,
    toggleMute,
    interruptPlayback,
    askQuestionManually: handleUserQuestion,
  }
}
