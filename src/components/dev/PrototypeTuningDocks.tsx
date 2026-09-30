import { cn } from "../../lib/utils"
import type { ListRowStyle } from "../../lib/list-row-style"
import { ListMinimalSwitch } from "./ListMinimalSwitch"
import { ListRowPaddingInput } from "./ListRowPaddingInput"
import { PrototypeSwitch } from "./PrototypeSwitch"

interface PrototypeTuningDocksProps {
  value: ListRowStyle
  onChange: (style: ListRowStyle) => void
  listMinimal: boolean
  onListMinimalChange: (minimal: boolean) => void
  relativeTime: boolean
  onRelativeTimeChange: (relativeTime: boolean) => void
  listRowPaddingY: number
  onListRowPaddingYChange: (paddingY: number) => void
}

const OPTIONS: { id: ListRowStyle; label: string }[] = [
  { id: "regular-gray-10", label: "Regular · Gray 10" },
  { id: "medium-gray-11", label: "Medium · Gray 11" },
]

export function PrototypeTuningDocks({
  value,
  onChange,
  listMinimal,
  onListMinimalChange,
  relativeTime,
  onRelativeTimeChange,
  listRowPaddingY,
  onListRowPaddingYChange,
}: PrototypeTuningDocksProps) {
  return (
    <div className="prototype-tuning-docks">
      <div
        aria-label="List row typography"
        className="prototype-dock"
        role="group"
      >
        {OPTIONS.map((option) => (
          <button
            aria-pressed={value === option.id}
            className={cn(
              "prototype-dock__option",
              value === option.id && "prototype-dock__option--active",
            )}
            key={option.id}
            onClick={() => onChange(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <span aria-hidden className="prototype-tuning-docks__divider" />
      <ListMinimalSwitch checked={listMinimal} onChange={onListMinimalChange} />
      <PrototypeSwitch
        checked={relativeTime}
        label="Relative time"
        onChange={onRelativeTimeChange}
      />
      <span aria-hidden className="prototype-tuning-docks__divider" />
      <ListRowPaddingInput
        onChange={onListRowPaddingYChange}
        value={listRowPaddingY}
      />
    </div>
  )
}
