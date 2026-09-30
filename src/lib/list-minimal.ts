const STORAGE_KEY = "mail-app-list-minimal-v2"

export function readListMinimal(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false"
  } catch {
    return true
  }
}

export function persistListMinimal(minimal: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(minimal))
  } catch {
    // ignore unavailable storage
  }
}
