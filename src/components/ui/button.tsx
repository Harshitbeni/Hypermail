import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md outline-none",
  {
    variants: {
      variant: {
        ghost: "bg-transparent text-[var(--gray-11)]",
        toolbar:
          "border border-[var(--gray-6)] bg-[var(--gray-1)] text-[var(--gray-11)]",
      },
      size: {
        icon: "size-7",
        compact: "size-6",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "icon",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      type={asChild ? undefined : type}
      tabIndex={-1}
      {...props}
    />
  )
}
