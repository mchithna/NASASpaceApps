import { useState, type FormEvent } from 'react'
import { validateNickname, type AvatarId } from '@/contracts/explorer.ts'
import { avatarOptions } from '@/pages/components/avatarOptions.ts'
import styles from '@/pages/components/profile/profile.module.css'

type ProfileAcademyFormProps = {
  initialNickname: string
  initialAvatarId: AvatarId
  onSave: (data: { nickname: string; avatarId: AvatarId }) => Promise<void>
  isSaving: boolean
  errorMessage: string | null
  successMessage: string | null
  onClearStatus: () => void
}

export function ProfileAcademyForm({
  initialNickname,
  initialAvatarId,
  onSave,
  isSaving,
  errorMessage,
  successMessage,
  onClearStatus,
}: ProfileAcademyFormProps) {
  const [nickname, setNickname] = useState(initialNickname)
  const [avatarId, setAvatarId] = useState<AvatarId>(initialAvatarId)
  const validationResult = validateNickname(nickname)
  const isNicknameValid = validationResult.ok
  const showNicknameError = !isNicknameValid && nickname.length > 0

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!isNicknameValid) return
    await onSave({ nickname: validationResult.data, avatarId })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className={`${styles.notice} ${styles.noticeError}`} role="alert">
          <strong>Error</strong>
          <span>{errorMessage}</span>
        </div>
      ) : null}
      {successMessage ? (
        <div className={`${styles.notice} ${styles.noticeOk}`} role="status">
          <strong>Updated</strong>
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Edit Callsign (Nickname)</h3>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="profile-nickname">
            Academy Callsign
          </label>
          <input
            id="profile-nickname"
            className={styles.input}
            type="text"
            required
            minLength={2}
            maxLength={20}
            value={nickname}
            placeholder="e.g. Lunar Voyager"
            aria-invalid={showNicknameError}
            aria-describedby="profile-nickname-hint"
            onChange={(event) => {
              setNickname(event.target.value)
              onClearStatus()
            }}
          />
          <div className={styles.hint} id="profile-nickname-hint">
            <span>2–20 characters. Letters, numbers, spaces, hyphens.</span>
            <span>{nickname.length}/20</span>
          </div>
        </div>
        {!validationResult.ok && nickname.length > 0 ? (
          <p className={styles.validation}>{validationResult.error.message}</p>
        ) : null}
      </div>

      <div className={styles.panel}>
        <div>
          <h3 className={styles.panelTitle}>Flight Insignia (Avatar)</h3>
          <p className={styles.panelNote}>Select your academy specialization insignia.</p>
        </div>
        <div
          className={styles.avatars}
          role="radiogroup"
          aria-label="Choose your academy avatar"
        >
          {avatarOptions.map((option) => {
            const Icon = option.icon
            const selected = avatarId === option.id
            return (
              <button
                key={option.id}
                className={styles.avatarOption}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isSaving}
                onClick={() => {
                  setAvatarId(option.id)
                  onClearStatus()
                }}
              >
                <span className={styles.orbit}>
                  <span className={styles.orbitRing} aria-hidden="true" />
                  <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <ellipse cx="32" cy="32" rx="28" ry="12" transform="rotate(-24 32 32)" />
                  </svg>
                  <Icon aria-hidden="true" width="22" height="22" />
                </span>
                <span className={styles.avatarCopy}>
                  <span className={styles.avatarName}>{option.name}</span>
                  <span className={styles.avatarSpecialty}>{option.specialty}</span>
                </span>
                {selected ? <span className={styles.selectedMark}>Selected</span> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.saveRow}>
        <button
          className={styles.save}
          type="submit"
          disabled={!isNicknameValid || isSaving}
          aria-busy={isSaving || undefined}
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
