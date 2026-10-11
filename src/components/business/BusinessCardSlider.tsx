'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Bookmark, Camera } from 'lucide-react'

interface BusinessCardSliderProps {
  images?: string[]
  fallbackImage?: string
  businessName: string
  slug: string
  verified?: boolean
  isSaved?: boolean
  onToggleSave?: (e: React.MouseEvent) => void
  isSaving?: boolean
  containerClassName?: string
  imageClassName?: string
  heightClassName?: string
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'

export default function BusinessCardSlider({
  images,
  fallbackImage = DEFAULT_FALLBACK,
  businessName,
  slug,
  verified = false,
  isSaved = false,
  onToggleSave,
  isSaving = false,
  containerClassName = '',
  imageClassName = '',
  heightClassName = 'h-[180px]'
}: BusinessCardSliderProps) {
  // Clean valid image URLs
  const validImages: string[] = Array.isArray(images)
    ? images.filter(url => typeof url === 'string' && url.trim().length > 0)
    : []

  // If no images provided or empty array, use fallbackImage
  const photoList = validImages.length > 0 ? validImages : [fallbackImage]
  const hasMultiple = photoList.length > 1

  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? photoList.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev === photoList.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(index)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !hasMultiple) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX
    if (diff > 40) {
      // Swiped left -> next
      setCurrentIndex(prev => (prev === photoList.length - 1 ? 0 : prev + 1))
    } else if (diff < -40) {
      // Swiped right -> prev
      setCurrentIndex(prev => (prev === 0 ? photoList.length - 1 : prev - 1))
    }
    setTouchStartX(null)
  }

  return (
    <div 
      className={`relative group overflow-hidden select-none bg-neutral-100 ${heightClassName} ${containerClassName}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track */}
      <div 
        className="flex w-full h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {photoList.map((url, idx) => (
          <div key={`${url}-${idx}`} className="w-full h-full flex-shrink-0 relative">
            <Link href={`/businesses/${slug}`} className="block w-full h-full cursor-pointer">
              <img
                src={url}
                alt={`${businessName} - photo ${idx + 1}`}
                className={`w-full h-full object-cover ${imageClassName}`}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FALLBACK
                }}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Prev Arrow */}
      {hasMultiple && (
        <button
          type="button"
          onClick={handlePrev}
          title="Previous photo"
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-neutral-800 flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm z-20 hover:scale-110 active:scale-95 cursor-pointer opacity-85 hover:opacity-100 border border-black/5"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Next Arrow */}
      {hasMultiple && (
        <button
          type="button"
          onClick={handleNext}
          title="Next photo"
          aria-label="Next photo"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-neutral-800 flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm z-20 hover:scale-110 active:scale-95 cursor-pointer opacity-85 hover:opacity-100 border border-black/5"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Dots Indicator */}
      {hasMultiple && (
        <div 
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm z-20"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {photoList.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              aria-label={`Go to slide ${dotIdx + 1}`}
              onClick={(e) => handleDotClick(e, dotIdx)}
              className="p-1 cursor-pointer flex items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-200 ${
                  dotIdx === currentIndex 
                    ? 'w-4 bg-white shadow-sm' 
                    : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Photo Count Badge */}
      {hasMultiple && (
        <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm z-20 flex items-center gap-1 shadow-sm pointer-events-none">
          <Camera className="w-3 h-3" />
          <span>{currentIndex + 1}/{photoList.length}</span>
        </div>
      )}

      {/* Verified Badge */}
      {verified && (
        <div className="absolute top-3 left-3 bg-[#16A34A] text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md flex items-center gap-1 z-10">
          <span>✓</span> Verified
        </div>
      )}

      {/* Bookmark Button */}
      {onToggleSave && (
        <button
          type="button"
          onClick={onToggleSave}
          disabled={isSaving}
          title={isSaved ? 'Remove from saved' : 'Save business'}
          aria-label={isSaved ? 'Remove from saved' : 'Save business'}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all z-10 ${
            isSaved
              ? 'bg-[#16A34A] text-white'
              : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#16A34A]'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  )
}
