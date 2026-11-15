import { useRef, useState } from 'react'
import type { MissionId } from '@/missions/types.ts'
import { ChatLauncher } from './ChatLauncher.tsx'
import { ChatWindow } from './ChatWindow.tsx'
import { useOptionalNovaAi } from './context/AiContext.tsx'
import './companion.css'

export type AiContext = { route: string; missionId?: MissionId }
export type AiCompanionProps = { context: AiContext }

export function AiCompanion({ context }: AiCompanionProps) {
  const ai = useOptionalNovaAi()
  const [localOpen, setLocalOpen] = useState(false)
  const open = ai?.isChatOpen ?? localOpen
  const setOpen = ai?.setChatOpen ?? setLocalOpen
  const launcher = useRef<HTMLButtonElement>(null)

  function close() {
    setOpen(false)
    launcher.current?.focus()
  }

  return (
    <>
      <ChatLauncher ref={launcher} open={open} onClick={() => setOpen(!open)} />
      <ChatWindow open={open} onClose={close} missionId={context.missionId} />
    </>
  )
}
