import * as React from "react"

import { cn } from "../../lib/utils"
import { Button, type ButtonProps } from "./button"
import { KeyboardShortcut } from "./keyboard-shortcut"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

export interface IconTooltipButtonProps extends ButtonProps {
  label: string
  shortcut?: readonly string[]
}

export function IconTooltipButton({
  label,
  shortcut,
  className,
  disabled,
  children,
  size = "icon",
  type = "button",
  ...props
}: IconTooltipButtonProps) {
  const button = (
    <Button
      aria-label={label}
      className={className}
      disabled={disabled}
      size={size}
      type={type}
      {...props}
    >
      {children}
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {disabled ? (
          <span className={cn("inline-flex", disabled && "cursor-not-allowed")}>
            {button}
          </span>
        ) : (
          button
        )}
      </TooltipTrigger>
      <TooltipContent>
        <span className="tooltip-label">
          <span>{label}</span>
          {shortcut ? <KeyboardShortcut keys={shortcut} /> : null}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
