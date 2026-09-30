export type FontSmoothing = "antialiased" | "subpixel"

const STORAGE_KEY = "mail-app-font-smoothing"

export function readFontSmoothing(): FontSmoothing {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "antialiased" || stored === "subpixel") {
      return stored
    }
  } catch {
    // ignore unavailable storage
  }
  return "subpixel"
}

export function applyFontSmoothing(mode: FontSmoothing) {
  document.documentElement.dataset.fontSmoothing = mode
}

export function persistFontSmoothing(mode: FontSmoothing) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignore unavailable storage
  }
}

export function toggleFontSmoothing(mode: FontSmoothing): FontSmoothing {
  return mode === "antialiased" ? "subpixel" : "antialiased"
}
