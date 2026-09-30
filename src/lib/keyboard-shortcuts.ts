export const mailShortcuts = {
  toggleSidebar: ["⌘", "B"] as const,
  focusMode: ["⌘", "."] as const,
  compose: ["⌃", "N"] as const,
  archive: ["⌃", "E"] as const,
  delete: ["⌃", "D"] as const,
  star: ["⌃", "S"] as const,
  wait: ["⌃", "W"] as const,
  later: ["⌃", "L"] as const,
  reply: ["⌃", "R"] as const,
  forward: ["⌃", "F"] as const,
  askAI: ["⌃", "A"] as const,
  togglePrototypeTuning: ["⌃", "U"] as const,
  switchAccount1: ["⌃", "1"] as const,
  switchAccount2: ["⌃", "2"] as const,
  previousMessage: ["↑"] as const,
  nextMessage: ["↓"] as const,
}

export function isControlKeyCombo(event: KeyboardEvent): boolean {
  return event.ctrlKey && !event.metaKey && !event.altKey
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable
  )
}
