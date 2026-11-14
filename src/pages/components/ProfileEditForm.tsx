import { useState, type FormEvent } from 'react'
import { UserCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button.tsx'
import { Card } from '@/components/ui/Card.tsx'
import { validateNickname, type AvatarId } from '@/contracts/explorer.ts'
import { AvatarSelector } from '@/pages/components/AvatarSelector.tsx'

export type ProfileEditFormProps = {
  initialNickname: string
  initialAvatarId: AvatarId
  onSave: (data: { nickname: string; avatarId: AvatarId }) => Promise<void>
  isSaving: boolean
  errorMessage: string | null
  successMessage: string | null
  onClearStatus: () => void
}

export function ProfileEditForm({
  initialNickname,
  initialAvatarId,
  onSave,
  isSaving,
  errorMessage,
  successMessage,
  onClearStatus,
}: ProfileEditFormProps) {
  const [nickname, setNickname] = useState(initialNickname)
  const [avatarId, setAvatarId] = useState<AvatarId>(initialAvatarId)

  const validationResult = validateNickname(nickname)
  const isNicknameValid = validationResult.ok

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isNicknameValid) return
    await onSave({ nickname: validationResult.data, avatarId })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-surface border border-danger bg-surface p-4 text-danger text-sm shadow-surface"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold font-heading">Error</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-surface border border-success bg-surface p-4 text-success text-sm shadow-surface"
        >
          <CheckCircle2 className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold font-heading">Updated</span>
            <span>{successMessage}</span>
          </div>
        </div>
      ) : null}

      <Card variant="standard" className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-reward" aria-hidden="true" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Edit Callsign (Nickname)
            </h3>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="profile-nickname"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Academy Callsign
            </label>
            <input
              id="profile-nickname"
              type="text"
              required
              minLength={2}
              maxLength={20}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                onClearStatus()
              }}
              placeholder="e.g. Lunar Voyager"
              aria-invalid={!isNicknameValid && nickname.length > 0}
              aria-describedby="profile-nickname-hint"
              className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-science focus:outline-none focus:ring-1 focus:ring-science max-w-md"
            />
            <div
              id="profile-nickname-hint"
              className="flex max-w-md items-center justify-between text-xs text-muted"
            >
              <span>2–20 characters. Letters, numbers, spaces, hyphens.</span>
              <span className="tabular-nums">{nickname.length}/20</span>
            </div>
          </div>

          {!isNicknameValid && nickname.length > 0 ? (
            <p className="text-xs font-medium text-danger">
              {validationResult.error.message}
            </p>
          ) : null}
        </div>
      </Card>

      <Card variant="standard" className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Flight Insignia (Avatar)
            </h3>
            <p className="text-xs text-secondary">
              Select your academy specialization insignia.
            </p>
          </div>

          <AvatarSelector
            selectedAvatar={avatarId}
            onSelect={(id) => {
              setAvatarId(id)
              onClearStatus()
            }}
            disabled={isSaving}
          />
        </div>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button
          type="submit"
          variant="primary"
          size="large"
          loading={isSaving}
          disabled={!isNicknameValid || isSaving}
        >
          <UserCheck className="size-4 mr-1.5" aria-hidden="true" />
          <span>Save Changes</span>
        </Button>
      </div>
    </form>
  )
}
