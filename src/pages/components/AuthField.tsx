import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import styles from '@/pages/AuthPage.module.css'

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  kind: 'email' | 'password' | 'nickname'
  hint?: string
}

export function AuthField({ id, label, kind, hint, ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false)
  const Icon =
    kind === 'email' ? Mail : kind === 'password' ? LockKeyhole : UserRound
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <Icon size={18} aria-hidden="true" />
        <input
          {...props}
          id={id}
          type={
            kind === 'email'
              ? 'email'
              : kind === 'password' && !visible
                ? 'password'
                : 'text'
          }
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {kind === 'password' ? (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setVisible(!visible)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
