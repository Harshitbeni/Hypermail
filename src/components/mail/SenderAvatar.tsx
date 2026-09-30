import { useState } from "react"

import { registrableDomain } from "../../lib/domain"
import {
  faviconSrc,
  isPlaceholderFavicon,
  type FaviconProvider,
} from "../../lib/favicon"
import {
  senderInitials,
  usesTextAvatarForEmail,
} from "../../lib/sender-initials"
import { cn } from "../../lib/utils"

interface SenderAvatarProps {
  name: string
  email: string
  size?: number
  className?: string
}

function TextSenderAvatar({
  name,
  size,
  className,
}: {
  name: string
  size: number
  className?: string
}) {
  const initials = senderInitials(name)
  const twoLetters = initials.length > 1

  return (
    <span
      aria-hidden
      className={cn(
        "sender-avatar sender-avatar--fallback",
        twoLetters && "sender-avatar--fallback-dense",
        className,
      )}
      style={{ width: size, height: size, flexBasis: size }}
    >
      {initials}
    </span>
  )
}

const FAVICON_CHAIN: FaviconProvider[] = ["duckduckgo", "google"]

export function SenderAvatar({
  name,
  email,
  size = 24,
  className,
}: SenderAvatarProps) {
  const [faviconStep, setFaviconStep] = useState(0)
  const domain = registrableDomain(email)
  const provider = FAVICON_CHAIN[faviconStep]
  const preferText =
    usesTextAvatarForEmail(email, domain) || !domain || provider === undefined

  const rejectFavicon = () => {
    setFaviconStep((step) => Math.min(step + 1, FAVICON_CHAIN.length))
  }

  if (preferText) {
    return <TextSenderAvatar className={className} name={name} size={size} />
  }

  return (
    <img
      alt=""
      aria-hidden
      className={cn("sender-avatar", className)}
      height={size}
      onError={rejectFavicon}
      onLoad={(event) => {
        if (isPlaceholderFavicon(event.currentTarget)) {
          rejectFavicon()
        }
      }}
      src={faviconSrc(domain, provider)}
      style={{ width: size, height: size, flexBasis: size }}
      width={size}
    />
  )
}
