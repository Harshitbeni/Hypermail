interface CountBadgeProps {
  count: number
}

export function CountBadge({ count }: CountBadgeProps) {
  return <span className="count-badge">{count}</span>
}
