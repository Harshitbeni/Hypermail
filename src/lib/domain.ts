/**
 * Best-effort registrable domain (strips subdomains, keeps e.g. microsoft.com
 * for careers.microsoft.com). Covers common two-level public suffixes.
 */
const TWO_LEVEL_SUFFIXES = new Set([
  "ac.uk",
  "co.in",
  "co.jp",
  "co.nz",
  "co.uk",
  "com.au",
  "com.br",
  "com.cn",
  "com.mx",
  "com.sg",
  "org.uk",
])

export function registrableDomain(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase().trim() ?? ""
  const parts = domain.split(".").filter(Boolean)
  if (parts.length <= 2) return parts.join(".")
  const lastTwo = parts.slice(-2).join(".")
  if (TWO_LEVEL_SUFFIXES.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join(".")
  }
  return lastTwo
}
