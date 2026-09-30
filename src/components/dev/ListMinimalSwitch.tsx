import { PrototypeSwitch } from "./PrototypeSwitch"

interface ListMinimalSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ListMinimalSwitch({ checked, onChange }: ListMinimalSwitchProps) {
  return <PrototypeSwitch checked={checked} label="Minimal" onChange={onChange} />
}
