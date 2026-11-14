import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button.tsx'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
      titleRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="dialog-surface"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            ref={titleRef}
            tabIndex={-1}
            className="text-xl text-balance text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {title}
          </h2>
          <Button variant="ghost" size="small" onClick={onClose}>
            Close
          </Button>
        </div>
        {description ? (
          <p id={descriptionId} className="max-w-[65ch] text-secondary">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </dialog>
  )
}
