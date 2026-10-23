/**
 * Utility functions for Google Maps URLs and Embed HTML codes.
 * Supports:
 * - Full <iframe> embed HTML: <iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>
 * - Direct embed URLs: https://www.google.com/maps/embed?pb=...
 * - Truncated or malformed embed URLs (salvages coordinates and converts to clean embed)
 * - Standard Google Maps links: https://www.google.com/maps/place/... or https://maps.google.com/?q=...
 * - Coordinate links: https://www.google.com/maps/@lat,lng,z
 * - Google Maps shortlinks (e.g. maps.app.goo.gl)
 */

/**
 * Extracts a clean URL from either an <iframe> HTML snippet or a raw URL string.
 */
export function extractMapUrl(input: string | null | undefined): string {
  if (!input) return ''
  let trimmed = input.trim()

  // 1. If it contains an <iframe> tag, extract the src attribute
  const srcMatch = trimmed.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i)
  if (srcMatch && srcMatch[1]) {
    return decodeHtmlEntities(srcMatch[1].trim())
  }

  // 2. If it has double quotes around a URL or starts with src=
  const altSrcMatch = trimmed.match(/^src=["']([^"']+)["']/i)
  if (altSrcMatch && altSrcMatch[1]) {
    return decodeHtmlEntities(altSrcMatch[1].trim())
  }

  // 3. Strip surrounding quotation marks if pasted with quotes
  trimmed = trimmed.replace(/^["']|["']$/g, '')

  return decodeHtmlEntities(trimmed)
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/**
 * Detects whether a Google Maps embed URL is truncated or malformed.
 * Standard embed URLs end with parameters like !5e0!3m2!...
 * If truncated (e.g. by a VARCHAR(191) MySQL column), Google returns HTTP 400 Bad Request.
 */
export function isTruncatedOrBrokenEmbed(url: string | null | undefined): boolean {
  if (!url || !url.includes('/maps/embed')) return false
  // A complete Google Maps embed pb parameter is typically > 200 chars and ends with !5e or !4v
  if (url.includes('pb=')) {
    const hasViewParams = url.includes('!5e') || url.includes('!4v') || url.includes('!5m')
    if (!hasViewParams) return true
  }
  return false
}

/**
 * Converts any Google Maps URL, embed code, or coordinates into a guaranteed working embeddable URL for <iframe> src.
 */
export function getMapEmbedUrl(
  input?: string | null,
  fallbackLat?: number | null,
  fallbackLng?: number | null,
  fallbackQuery?: string | null,
  mapType: 'roadmap' | 'satellite' = 'roadmap'
): string {
  const cleanUrl = extractMapUrl(input)
  const typeParam = mapType === 'satellite' ? '&t=k' : ''

  // 1. If input is provided and contains /maps/embed
  if (cleanUrl && cleanUrl.includes('/maps/embed')) {
    // If it's broken or truncated, salvage coordinates and prefer business place query
    if (isTruncatedOrBrokenEmbed(cleanUrl)) {
      if (fallbackQuery && fallbackQuery.trim()) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&hl=en&z=16&output=embed${typeParam}`
      }
      const coords = extractCoordinatesFromMapUrl(cleanUrl)
      if (coords) {
        return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=16&output=embed${typeParam}`
      }
      if (fallbackLat != null && fallbackLng != null && !isNaN(Number(fallbackLat)) && !isNaN(Number(fallbackLng))) {
        return `https://maps.google.com/maps?q=${fallbackLat},${fallbackLng}&hl=en&z=16&output=embed${typeParam}`
      }
    }
    // If not broken but satellite mode requested
    if (mapType === 'satellite' && !cleanUrl.includes('t=k')) {
      const sep = cleanUrl.includes('?') ? '&' : '?'
      return `${cleanUrl}${sep}t=k`
    }
    return cleanUrl
  }

  // 2. Try extracting coordinates directly from the URL if present
  if (cleanUrl) {
    const coords = extractCoordinatesFromMapUrl(cleanUrl)
    if (coords) {
      if (fallbackQuery && fallbackQuery.trim()) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&ll=${coords.lat},${coords.lng}&hl=en&z=16&output=embed${typeParam}`
      }
      return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&hl=en&z=16&output=embed${typeParam}`
    }

    // Handle standard maps with ?q= coordinates or place name
    const qMatch = cleanUrl.match(/[?&]q=([^&]+)/)
    if (qMatch && qMatch[1]) {
      const query = qMatch[1]
      return `https://maps.google.com/maps?q=${query}&hl=en&z=16&output=embed${typeParam}`
    }

    // Handle place URLs: /maps/place/Place+Name/...
    const placeMatch = cleanUrl.match(/\/maps\/place\/([^/@?]+)/)
    if (placeMatch && placeMatch[1]) {
      const placeName = placeMatch[1].replace(/\+/g, ' ')
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&hl=en&z=16&output=embed${typeParam}`
    }
  }

  // 3. Fallback to passed text query (address or business name)
  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery.trim())}&hl=en&z=16&output=embed${typeParam}`
  }

  // 4. Fallback to passed coordinates
  if (fallbackLat != null && fallbackLng != null && !isNaN(Number(fallbackLat)) && !isNaN(Number(fallbackLng))) {
    return `https://maps.google.com/maps?q=${fallbackLat},${fallbackLng}&hl=en&z=16&output=embed${typeParam}`
  }

  // 5. If it's a generic URL, try appending output=embed
  if (cleanUrl && cleanUrl.startsWith('http') && !cleanUrl.includes('maps.app.goo.gl')) {
    if (cleanUrl.includes('output=embed')) {
      return mapType === 'satellite' && !cleanUrl.includes('t=k') ? `${cleanUrl}&t=k` : cleanUrl
    }
    const separator = cleanUrl.includes('?') ? '&' : '?'
    return `${cleanUrl}${separator}output=embed${typeParam}`
  }

  return cleanUrl || ''
}

/**
 * Returns a Google Maps directions URL to navigate to the business.
 */
export function getMapDirectionsUrl(
  lat?: number | null,
  lng?: number | null,
  fallbackQuery?: string | null
): string {
  if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fallbackQuery.trim())}`
  }
  return 'https://www.google.com/maps'
}

/**
 * Converts an embed URL or standard URL into an external clickable URL for viewing in Google Maps.
 */
export function getMapExternalUrl(
  input?: string | null,
  fallbackLat?: number | null,
  fallbackLng?: number | null,
  fallbackQuery?: string | null
): string {
  const cleanUrl = extractMapUrl(input)

  // Direct short links work natively when clicked externally
  if (cleanUrl && (cleanUrl.includes('maps.app.goo.gl') || cleanUrl.includes('goo.gl/maps'))) {
    return cleanUrl
  }

  // If it's an embed URL or broken embed URL, extract coordinates
  if (cleanUrl && cleanUrl.includes('/maps/embed')) {
    const coords = extractCoordinatesFromMapUrl(cleanUrl)
    if (coords) {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    }
    const qMatch = cleanUrl.match(/[?&]q=([^&]+)/)
    if (qMatch && qMatch[1]) {
      return `https://www.google.com/maps?q=${qMatch[1]}`
    }
  }

  // If coordinates are extractable from any input format
  if (cleanUrl) {
    const coords = extractCoordinatesFromMapUrl(cleanUrl)
    if (coords) {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    }
    // Clean standard URL with output=embed
    if (cleanUrl.includes('output=embed')) {
      return cleanUrl.replace(/[?&]output=embed/, '')
    }
    if (cleanUrl.startsWith('http')) {
      return cleanUrl
    }
  }

  // Fallback to coordinates
  if (fallbackLat != null && fallbackLng != null && !isNaN(Number(fallbackLat)) && !isNaN(Number(fallbackLng))) {
    return `https://www.google.com/maps?q=${fallbackLat},${fallbackLng}`
  }

  // Fallback to search query
  if (fallbackQuery && fallbackQuery.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery.trim())}`
  }

  return ''
}

/**
 * Extracts latitude and longitude from any map URL or embed code.
 */
export function extractCoordinatesFromMapUrl(input: string | null | undefined): { lat: number; lng: number } | null {
  if (!input) return null
  const url = extractMapUrl(input)
  if (!url) return null

  try {
    // 1. Check for pb parameter with !2d<lng>!3d<lat> (Standard in Google Maps Embeds)
    // Note: in Google Maps pb format, !2d is longitude and !3d is latitude
    const pbMatch = url.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/)
    if (pbMatch && pbMatch[1] && pbMatch[2]) {
      return {
        lat: parseFloat(pbMatch[2]),
        lng: parseFloat(pbMatch[1])
      }
    }

    // 2. Query param: q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch && qMatch[1] && qMatch[2]) {
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2])
      }
    }

    // 3. Path format: /@lat,lng
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch && atMatch[1] && atMatch[2]) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      }
    }

    // 4. Parameter: ll=lat,lng
    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (llMatch && llMatch[1] && llMatch[2]) {
      return {
        lat: parseFloat(llMatch[1]),
        lng: parseFloat(llMatch[2])
      }
    }

    // 5. Destination parameter
    const destMatch = url.match(/[?&]destination=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (destMatch && destMatch[1] && destMatch[2]) {
      return {
        lat: parseFloat(destMatch[1]),
        lng: parseFloat(destMatch[2])
      }
    }

    // 6. Direct comma-separated coordinates: "9.0242, 38.7468"
    const rawMatch = url.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/)
    if (rawMatch && rawMatch[1] && rawMatch[2]) {
      return {
        lat: parseFloat(rawMatch[1]),
        lng: parseFloat(rawMatch[2])
      }
    }

    return null
  } catch {
    return null
  }
}

