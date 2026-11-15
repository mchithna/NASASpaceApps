import { useRef, useState } from 'react'
import type { MissionId } from '@/missions/types.ts'
import { ChatLauncher } from './ChatLauncher.tsx'
import { ChatWindow } from './ChatWindow.tsx'
import './companion.css'

export type AiContext = { route: string; missionId?: MissionId }
export type AiCompanionProps = { context: AiContext }

export function AiCompanion({ context }: AiCompanionProps) {
  const [open, setOpen] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)

  function close() {
    setOpen(false)
    launcher.current?.focus()
  }

  return (
    <>
      <ChatLauncher
        ref={launcher}
        open={open}
        onClick={() => setOpen((previous) => !previous)}
      />
      <ChatWindow
        open={open}
        onClose={close}
        missionId={context.missionId}
      />
    </>
  )
}
