'use client'

import { useEffect, useRef, useState } from 'react'

interface GoogleAdUnitProps {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical' | 'in-feed'
  responsive?: boolean
  className?: string
  layoutKey?: string // For in-feed native ads
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdUnit({
  slot = '0000000000',
  format = 'auto',
  responsive = true,
  className = '',
  layoutKey,
}: GoogleAdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isInitialized = useRef(false)
  const [mounted, setMounted] = useState(false)

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const isProduction = process.env.NODE_ENV === 'production' && publisherId && publisherId !== 'ca-pub-0000000000000000'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isProduction || isInitialized.current) return

    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        isInitialized.current = true
      }
    } catch (err) {
      console.warn('[GoogleAdUnit] Ad initialization error:', err)
    }
  }, [mounted, isProduction])

  if (!mounted) {
    return null
  }

  // Development or Preview Placeholder (Compliant with AdSense guidelines to avoid blank layout shifts)
  if (!isProduction) {
    return (
      <div
        className={`my-6 mx-auto w-full max-w-5xl rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/70 p-4 text-center transition-all ${className}`}
        aria-label="Advertisement placeholder"
      >
        <div className="flex flex-col items-center justify-center py-4 px-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 bg-neutral-200/60 px-2.5 py-0.5 rounded-full mb-2">
            Advertisement Space
          </span>
          <p className="text-xs font-semibold text-neutral-600">
            Google AdSense Slot ({format.toUpperCase()})
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 max-w-md">
            Visible live after entering your <code className="bg-neutral-200/50 px-1 py-0.5 rounded text-neutral-700">NEXT_PUBLIC_ADSENSE_CLIENT_ID</code> in production.
          </p>
        </div>
      </div>
    )
  }

  // Production Google AdSense Unit
  return (
    <div className={`my-6 mx-auto w-full text-center overflow-hidden ${className}`}>
      {/* Label required by Google AdSense Policies to differentiate ads from organic content */}
      <div className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400 mb-1.5 select-none">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format === 'in-feed' ? undefined : format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  )
}
