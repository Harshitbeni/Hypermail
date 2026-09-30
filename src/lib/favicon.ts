export type FaviconProvider = "duckduckgo" | "google"

export function faviconSrc(domain: string, provider: FaviconProvider): string {
  switch (provider) {
    case "duckduckgo":
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`
    case "google":
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
    default: {
      const _exhaustive: never = provider
      return _exhaustive
    }
  }
}

/** DuckDuckGo serves a 1×1 transparent GIF when it has no icon. */
export function isPlaceholderFavicon(img: HTMLImageElement): boolean {
  return img.naturalWidth <= 1 || img.naturalHeight <= 1
}
