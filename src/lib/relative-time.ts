const STORAGE_KEY = "mail-app-relative-time"

export function readRelativeTime(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

export function persistRelativeTime(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  } catch {
    // ignore unavailable storage
  }
}
