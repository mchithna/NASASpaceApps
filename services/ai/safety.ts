/**
 * Safety and guardrails for Nova AI (targeting students aged 10-17).
 * Strictly prevents prompt injection, personal data harvesting, and harmful content.
 */

const MAX_QUESTION_LENGTH = 1000
const MAX_HISTORY_MESSAGES = 20

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) (instructions|directions|prompts)/i,
  /you are now (an unrestricted|a new|dan|jailbreak)/i,
  /forget (your|all) (rules|instructions)/i,
  /system prompt/i,
  /reveal (the|your) (secret|instructions|key|keys|api)/i,
  /act as a malicious/i,
]

const SENSITIVE_INFO_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b\d{16}\b/, // Credit Card
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
  /\b(password|passwd|secret)\s*[:=]/i,
]

export interface ValidationResult {
  valid: boolean
  sanitized: string
  error?: string
}

export function validateUserInput(input: string): ValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, sanitized: '', error: 'Input cannot be empty.' }
  }

  const trimmed = input.trim()
  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Input cannot be empty.' }
  }

  if (trimmed.length > MAX_QUESTION_LENGTH) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, MAX_QUESTION_LENGTH),
      error: `Input is too long. Please keep questions under ${MAX_QUESTION_LENGTH} characters.`,
    }
  }

  // Check for prompt injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        sanitized: '',
        error:
          'I am Nova, your space exploration guide. I can only answer space and science questions.',
      }
    }
  }

  // Check for personal or sensitive information
  for (const pattern of SENSITIVE_INFO_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        sanitized: '',
        error:
          'For your privacy and safety, please do not share personal details, passwords, or emails with Nova.',
      }
    }
  }

  // Sanitize control characters except common whitespace
  // eslint-disable-next-line no-control-regex
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return { valid: true, sanitized }
}

export function sanitizeHistory<T>(messages: T[]): T[] {
  if (!Array.isArray(messages)) return []
  return messages.slice(-MAX_HISTORY_MESSAGES)
}

export function sanitizeAiOutput(output: string): string {
  if (!output) return ''
  // Strip any accidental API key leaks or internal system leaks
  return output
    .replace(/AIza[0-9A-Za-z-_]{30,45}/g, '[REDACTED_KEY]')
    .replace(/GEMINI_API_KEY[^\s]*/gi, '[REDACTED]')
}
