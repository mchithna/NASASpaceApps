/**
 * Address checks for scene media and source links.
 * A renderer may show a URL only when the mission definition supplied it
 * and this check accepts it.
 */

function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0
    if (code <= 31 || code === 127) {
      return true
    }
  }

  return false
}

export function safeExternalUrl(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '' || hasControlCharacter(trimmed)) {
    return null
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null
  }

  if (url.username !== '' || url.password !== '') {
    return null
  }

  return url.href
}

/** Site path or a normal web address. Rejects script URLs and parent paths. */
export function safeMediaSrc(value: string): string | null {
  const trimmed = value.trim()
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes('..')
  ) {
    return trimmed
  }

  return safeExternalUrl(trimmed)
}
