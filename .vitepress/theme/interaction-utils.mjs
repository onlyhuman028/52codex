export async function copyText(text, clipboard = globalThis.navigator?.clipboard) {
  try {
    if (!clipboard?.writeText) return false
    await clipboard.writeText(text)
    return true
  } catch { return false }
}

export function navigationIndex(key, current, count) {
  if (!count) return null
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowDown') return (current + 1) % count
  if (key === 'ArrowUp') return current < 0 ? count - 1 : (current + count - 1) % count
  return null
}
