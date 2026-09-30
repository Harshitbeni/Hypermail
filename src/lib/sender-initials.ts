/** Up to two initials from the sender display name (e.g. Costco → C, Costco Same → CS). */
export function senderInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"

  if (words.length === 1) {
    return words[0]!.charAt(0).toUpperCase()
  }

  return `${words[0]!.charAt(0)}${words[1]!.charAt(0)}`.toUpperCase()
}

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"])

export function usesTextAvatarForEmail(email: string, domain: string | null): boolean {
  if (!domain) return true
  return GMAIL_DOMAINS.has(domain)
}
