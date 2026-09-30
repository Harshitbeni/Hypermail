import { useEffect } from "react"

import { isControlKeyCombo, isTypingTarget } from "../lib/keyboard-shortcuts"

interface MailKeyboardShortcutsOptions {
  onToggleSidebar: () => void
  onToggleFocus: () => void
  onCompose: () => void
  onArchive: () => void
  onDelete: () => void
  onToggleStar: () => void
  onToggleWaiting: () => void
  onToggleLater: () => void
  onReply: () => void
  onForward: () => void
  onToggleAskAI: () => void
  onTogglePrototypeTuning: () => void
  onSwitchAccount: (slot: 1 | 2) => void
}

export function useMailKeyboardShortcuts({
  onToggleSidebar,
  onToggleFocus,
  onCompose,
  onArchive,
  onDelete,
  onToggleStar,
  onToggleWaiting,
  onToggleLater,
  onReply,
  onForward,
  onToggleAskAI,
  onTogglePrototypeTuning,
  onSwitchAccount,
}: MailKeyboardShortcutsOptions) {
  useEffect(() => {
    function runControlShortcut(event: KeyboardEvent, key: string, action: () => void) {
      if (!isControlKeyCombo(event)) return false
      if (event.key.toLowerCase() !== key) return false
      event.preventDefault()
      action()
      return true
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (event.metaKey && !event.ctrlKey && !event.altKey && key === "b") {
        event.preventDefault()
        onToggleSidebar()
        return
      }

      if (event.metaKey && !event.ctrlKey && !event.altKey && key === ".") {
        event.preventDefault()
        onToggleFocus()
        return
      }

      if (runControlShortcut(event, "n", onCompose)) return
      if (runControlShortcut(event, "e", onArchive)) return
      if (runControlShortcut(event, "d", onDelete)) return
      if (runControlShortcut(event, "s", onToggleStar)) return
      if (runControlShortcut(event, "w", onToggleWaiting)) return
      if (runControlShortcut(event, "l", onToggleLater)) return
      if (runControlShortcut(event, "r", onReply)) return
      if (runControlShortcut(event, "f", onForward)) return
      if (runControlShortcut(event, "a", onToggleAskAI)) return
      if (runControlShortcut(event, "u", onTogglePrototypeTuning)) return
      if (runControlShortcut(event, "1", () => onSwitchAccount(1))) return
      if (runControlShortcut(event, "2", () => onSwitchAccount(2))) return

    }

    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [
    onArchive,
    onCompose,
    onDelete,
    onForward,
    onReply,
    onSwitchAccount,
    onToggleAskAI,
    onTogglePrototypeTuning,
    onToggleFocus,
    onToggleLater,
    onToggleSidebar,
    onToggleStar,
    onToggleWaiting,
  ])
}
