import type { MockPersona } from '@/mocks/createMockServices.ts'
import { useNovaServices } from '@/pages/context/index.ts'

const personas: { id: MockPersona; label: string }[] = [
  { id: 'registered', label: 'Registered (Nova Cadet)' },
  { id: 'guest', label: 'Guest Explorer' },
  { id: 'signed-out', label: 'Signed Out' },
  { id: 'initializing', label: 'Initializing / Loading' },
]

export function PersonaSwitcher() {
  const { currentPersona, switchPersona, isLive } = useNovaServices()

  if (Boolean(import.meta.env.PROD) || isLive || currentPersona === 'custom') {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-xs">
      <span className="font-semibold uppercase tracking-wider text-muted">
        Mock Persona:
      </span>
      <div className="flex flex-wrap gap-1">
        {personas.map((p) => {
          const isActive = currentPersona === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => switchPersona(p.id)}
              className={`rounded px-2 py-0.5 font-medium transition-colors ${
                isActive
                  ? 'bg-science text-on-bright'
                  : 'text-secondary hover:bg-elevated hover:text-foreground'
              }`}
              aria-pressed={isActive}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
