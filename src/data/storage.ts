/**
 * Simple localStorage persistence layer.
 * All data is stored as JSON under a single key namespace.
 */

const NS = 'oacm_v1_'

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value))
  } catch {
    // Storage quota exceeded or private mode – silently ignore
  }
}

export function clearStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(NS))
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}
