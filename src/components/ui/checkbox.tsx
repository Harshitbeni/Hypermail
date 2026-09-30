import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "../../lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer grid size-4 shrink-0 place-content-center rounded-sm border border-[var(--gray-8)] bg-white text-white shadow-none outline-none transition-none",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-[var(--gray-12)] data-[state=checked]:bg-[var(--gray-12)]",
        className,
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-content-center text-current transition-none">
        <svg
          aria-hidden
          className="size-3.5"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
