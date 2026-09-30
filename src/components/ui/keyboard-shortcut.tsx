interface KeyboardShortcutProps {
  keys: readonly string[]
}

export function KeyboardShortcut({ keys }: KeyboardShortcutProps) {
  return (
    <span className="keyboard-shortcut">
      {keys.map((key, index) => (
        <span className="keyboard-shortcut__part" key={`${key}-${index}`}>
          {index > 0 ? <span className="keyboard-shortcut__sep">+</span> : null}
          <kbd className="keyboard-shortcut__key">{key}</kbd>
        </span>
      ))}
    </span>
  )
}
