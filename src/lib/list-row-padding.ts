const STORAGE_KEY = "mail-app-list-row-padding-y"
const DEFAULT_PADDING_Y = 6
const MIN_PADDING_Y = 0
const MAX_PADDING_Y = 32

export function clampListRowPaddingY(value: number): number {
  return Math.min(MAX_PADDING_Y, Math.max(MIN_PADDING_Y, Math.round(value)))
}

export function readListRowPaddingY(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return DEFAULT_PADDING_Y
    const parsed = Number(stored)
    if (!Number.isFinite(parsed)) return DEFAULT_PADDING_Y
    return clampListRowPaddingY(parsed)
  } catch {
    return DEFAULT_PADDING_Y
  }
}

export function persistListRowPaddingY(paddingY: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(paddingY))
  } catch {
    // ignore unavailable storage
  }
}
