import { clampListRowPaddingY } from "../../lib/list-row-padding"

interface ListRowPaddingInputProps {
  value: number
  onChange: (paddingY: number) => void
}

export function ListRowPaddingInput({ value, onChange }: ListRowPaddingInputProps) {
  return (
    <label className="prototype-row-padding">
      <span className="prototype-row-padding__label">Vertical padding</span>
      <input
        aria-label="Message row vertical padding in pixels"
        className="prototype-row-padding__input"
        inputMode="numeric"
        max={32}
        min={0}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          onChange(clampListRowPaddingY(next))
        }}
        step={1}
        type="number"
        value={value}
      />
    </label>
  )
}
