export type ListRowStyle = "regular-gray-10" | "medium-gray-11"

const STORAGE_KEY = "mail-app-list-row-style"

export function readListRowStyle(): ListRowStyle {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "regular-gray-10" || stored === "medium-gray-11") {
      return stored
    }
    const legacyWeight = localStorage.getItem("mail-app-list-subject-weight")
    const legacyColor = localStorage.getItem("mail-app-list-preview-color")
    if (legacyWeight === "regular" && legacyColor === "gray-10") {
      return "regular-gray-10"
    }
    if (legacyWeight === "medium" && legacyColor === "gray-11") {
      return "medium-gray-11"
    }
  } catch {
    // ignore unavailable storage
  }
  return "regular-gray-10"
}

export function persistListRowStyle(style: ListRowStyle) {
  try {
    localStorage.setItem(STORAGE_KEY, style)
  } catch {
    // ignore unavailable storage
  }
}
