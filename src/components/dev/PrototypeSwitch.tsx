import { cn } from "../../lib/utils"

interface PrototypeSwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function PrototypeSwitch({ label, checked, onChange }: PrototypeSwitchProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn("prototype-switch", checked && "prototype-switch--on")}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span className="prototype-switch__label">{label}</span>
      <span aria-hidden className="prototype-switch__track">
        <span className="prototype-switch__thumb" />
      </span>
    </button>
  )
}
