/**
 * Utility functions for Google Maps URLs and Embed HTML codes.
 * Supports:
 * - Full <iframe> embed HTML: <iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>
 * - Direct embed URLs: https://www.google.com/maps/embed?pb=...
 * - Standard Google Maps links: https://www.google.com/maps/place/... or https://maps.google.com/?q=...
 * - Coordinate links: https://www.google.com/maps/@lat,lng,z
 */

/**
 * Extracts a clean URL from either an <iframe> HTML snippet or a raw URL string.
 */
export function extractMapUrl(input: string | null | undefined): string {
  if (!input) return ''
  const trimmed = input.trim()

  // 1. If it contains an <iframe> tag, extract the src attribute
  const srcMatch = trimmed.match(/<iframe[^>]*\s+src=["']([^"']+)["']/i)
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1].trim()
  }

  // 2. If it has double quotes around a URL or starts with src=
  const altSrcMatch = trimmed.match(/^src=["']([^"']+)["']/i)
  if (altSrcMatch && altSrcMatch[1]) {
    return altSrcMatch[1].trim()
  }

  return trimmed
}

/**
 * Converts any Google Maps URL or embed code into an embeddable URL for <iframe> src.
 */
export function getMapEmbedUrl(input: string | null | undefined): string {
  if (!input) return ''
  const cleanUrl = extractMapUrl(input)
  if (!cleanUrl) return ''

  // Already an official embed URL
  if (cleanUrl.includes('/maps/embed')) {
    return cleanUrl
  }

  // Handle standard maps with ?q= coordinates or place name
  const qMatch = cleanUrl.match(/[?&]q=([^&]+)/)
  if (qMatch && qMatch[1]) {
    const query = qMatch[1]
    return `https://maps.google.com/maps?q=${query}&output=embed`
  }

  // Handle URLs with @lat,lng format: /@9.0242,38.7468
  const atMatch = cleanUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (atMatch && atMatch[1] && atMatch[2]) {
    const lat = atMatch[1]
    const lng = atMatch[2]
    return `https://maps.google.com/maps?q=${lat},${lng}&output=embed`
  }

  // Handle place URLs: /maps/place/Place+Name/...
  const placeMatch = cleanUrl.match(/\/maps\/place\/([^/@?]+)/)
  if (placeMatch && placeMatch[1]) {
    const placeName = placeMatch[1].replace(/\+/g, ' ')
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`
  }

  // Fallback: if it's a standard URL, try appending output=embed
  if (cleanUrl.startsWith('http')) {
    if (cleanUrl.includes('output=embed')) return cleanUrl
    const separator = cleanUrl.includes('?') ? '&' : '?'
    return `${cleanUrl}${separator}output=embed`
  }

  return cleanUrl
}

/**
 * Converts an embed URL or standard URL into an external clickable URL for viewing in Google Maps.
 */
export function getMapExternalUrl(input: string | null | undefined): string {
  if (!input) return ''
  const cleanUrl = extractMapUrl(input)
  if (!cleanUrl) return ''

  // If it's an embed URL, attempt to extract coordinates or query for a direct view link
  if (cleanUrl.includes('/maps/embed')) {
    const coords = extractCoordinatesFromMapUrl(cleanUrl)
    if (coords) {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    }
    const qMatch = cleanUrl.match(/[?&]q=([^&]+)/)
    if (qMatch && qMatch[1]) {
      return `https://www.google.com/maps?q=${qMatch[1]}`
    }
  }

  // If it's standard URL with output=embed, remove output=embed
  return cleanUrl.replace(/[?&]output=embed/, '')
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
    // Note: in pb format, !2d is longitude and !3d is latitude
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

    return null
  } catch {
    return null
  }
}
