'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Star, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  X,
  Compass
} from 'lucide-react'
import { getMapEmbedUrl, getMapExternalUrl, getMapDirectionsUrl } from '@/lib/maps'

interface InteractiveLocationMapProps {
  business: {
    id?: number | string
    name: string
    category?: { name: string; icon?: string | null }
    city?: { name: string }
    subcity?: { name: string } | null
    address?: string | null
    phone?: string | null
    website?: string | null
    mapUrl?: string | null
    latitude?: number | null
    longitude?: number | null
    averageRating?: number
    totalReviews?: number
    verified?: boolean
  }
}

export default function InteractiveLocationMap({ business }: InteractiveLocationMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')
  const [isCardExpanded, setIsCardExpanded] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCoords, setCopiedCoords] = useState(false)

  // Construct best query string for search & fallbacks
  const locationString = [
    business.address,
    business.subcity?.name,
    business.city?.name,
    'Ethiopia'
  ].filter(Boolean).join(', ')

  const searchQuery = business.address 
    ? `${business.name}, ${business.address}` 
    : `${business.name}, ${business.city?.name || 'Ethiopia'}`

  const embedUrl = getMapEmbedUrl(
    business.mapUrl,
    business.latitude,
    business.longitude,
    searchQuery,
    mapType
  )

  const externalMapUrl = getMapExternalUrl(
    business.mapUrl,
    business.latitude,
    business.longitude,
    searchQuery
  )

  const directionsUrl = getMapDirectionsUrl(
    business.latitude,
    business.longitude,
    searchQuery
  )

  const ratingDisplay = business.averageRating && business.averageRating > 0
    ? business.averageRating.toFixed(1)
    : '4.5'

  const reviewCountDisplay = business.totalReviews && business.totalReviews > 0
    ? business.totalReviews
    : 'Verified'

  const handleCopyAddress = () => {
    const textToCopy = business.address || locationString
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyCoords = () => {
    if (business.latitude && business.longitude) {
      navigator.clipboard.writeText(`${business.latitude}, ${business.longitude}`)
      setCopiedCoords(true)
      setTimeout(() => setCopiedCoords(false), 2000)
    }
  }

  // Render the Quick Data Overlay Card (matching the Google Maps place card seen on localhost)
  const renderQuickDataCard = (modalMode = false) => {
    if (!isCardExpanded && !modalMode) {
      return (
        <button
          onClick={() => setIsCardExpanded(true)}
          className="absolute top-3 left-3 z-20 bg-white/95 hover:bg-white backdrop-blur-md shadow-lg hover:shadow-xl rounded-full px-3.5 py-2 border border-neutral-200/90 flex items-center gap-2 text-xs font-semibold text-neutral-800 transition-all transform hover:scale-105 active:scale-95 group"
          title="Click to expand business details card"
        >
          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <MapPin className="w-3 h-3" />
          </span>
          <span className="max-w-[130px] truncate">{business.name}</span>
          <span className="text-amber-500 flex items-center gap-0.5">
            ★ {ratingDisplay}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-transform" />
        </button>
      )
    }

    return (
      <div 
        className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 ${
          modalMode ? 'max-w-[360px]' : 'max-w-[290px] sm:max-w-[340px]'
        } w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-200/90 p-4 sm:p-4.5 transition-all duration-300 animate-in fade-in slide-in-from-top-2`}
      >
        {/* Card Header: Business Title & verified badge & minimize button */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug truncate">
                {business.name}
              </h3>
              {business.verified && (
                <span 
                  className="inline-flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-200" 
                  title="Verified Business"
                >
                  <ShieldCheck className="w-3 h-3 mr-0.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-1 line-clamp-1 flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              <span>
                {business.address 
                  ? business.address 
                  : `${business.subcity?.name ? business.subcity.name + ', ' : ''}${business.city?.name || 'Bahir Dar, Ethiopia'}`
                }
              </span>
            </p>
          </div>

          {!modalMode && (
            <button
              onClick={() => setIsCardExpanded(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0"
              title="Minimize card"
              aria-label="Minimize card"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rating and category row */}
        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
          <div className="flex items-center gap-1">
            <span className="font-bold text-neutral-900">{ratingDisplay}</span>
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-neutral-500">
              ({typeof reviewCountDisplay === 'number' ? `${reviewCountDisplay} reviews` : reviewCountDisplay})
            </span>
          </div>

          {business.category?.name && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-[11px] font-medium truncate max-w-[100px]">
                {business.category.name}
              </span>
            </>
          )}
        </div>

        {/* Action buttons (Styled after Google Maps place card) */}
        <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-neutral-100">
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
          >
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Open in Maps</span>
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1a73e8] border border-blue-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm flex-shrink-0"
            title="Get Directions"
            aria-label="Get Directions"
          >
            <Navigation className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="w-9 h-9 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm flex-shrink-0"
            title={copied ? 'Address Copied!' : 'Copy Address'}
            aria-label="Copy Address"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    )
  }

  // Render Top-Right Map Controls
  const renderMapControls = () => {
    return (
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5">
        {/* Map Type Switcher (Roadmap vs Satellite) */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-neutral-200/90 p-0.5 flex items-center">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mapType === 'roadmap'
                ? 'bg-brand-green text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Standard Roadmap View"
          >
            <Compass className="w-3 h-3" />
            <span className="hidden sm:inline">Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mapType === 'satellite'
                ? 'bg-brand-green text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Satellite Aerial View"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Satellite</span>
          </button>
        </div>

        {/* Fullscreen Expand Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/95 backdrop-blur-md hover:bg-white text-neutral-700 p-2 rounded-xl shadow-md border border-neutral-200/90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-premium border border-neutral-100 p-6 sm:p-10 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-3">
          <span className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-blue-600" />
          </span>
          <div>
            <span>Location Map</span>
            <span className="block text-xs font-normal text-neutral-500 mt-0.5">
              Interactive Google Maps view & verified navigation
            </span>
          </div>
        </h2>

        {/* Navigation Shortcut Badge */}
        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Get Directions</span>
          </a>
          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <span>Open in Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Interactive Map Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] min-h-[380px] sm:min-h-[440px] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-inner group">
        {/* Quick Data Card (Top-Left) */}
        {renderQuickDataCard()}

        {/* Map View Controls (Top-Right) */}
        {renderMapControls()}

        {/* Google Maps Iframe */}
        <iframe
          key={`${embedUrl}-${mapType}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full rounded-2xl"
          title={`${business.name} Location Map`}
        />
      </div>

      {/* Map Footer Bar: Details, Address & Coordinates */}
      <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-600">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-neutral-700">
            <MapPin className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
            <span>{business.address || locationString}</span>
          </span>

          {business.latitude && business.longitude && (
            <button
              type="button"
              onClick={handleCopyCoords}
              className="inline-flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors"
              title="Click to copy GPS coordinates"
            >
              <span>{Number(business.latitude).toFixed(4)}°, {Number(business.longitude).toFixed(4)}°</span>
              {copiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-neutral-400" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-[11px] font-medium text-neutral-500">
          <span>Mode: <strong className="text-neutral-700 capitalize">{mapType}</strong></span>
          <span>•</span>
          <a 
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-green hover:underline inline-flex items-center gap-1 font-semibold"
          >
            Start Route Navigation <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{business.name}</h3>
                  <p className="text-xs text-neutral-500">{business.address || locationString}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                  aria-label="Close Fullscreen"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Map View */}
            <div className="relative flex-1 w-full bg-neutral-100">
              {renderQuickDataCard(true)}
              {renderMapControls()}
              <iframe
                key={`modal-${embedUrl}-${mapType}`}
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title={`${business.name} Fullscreen Location Map`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
