'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone, Download, CheckCircle2, ArrowDownToLine } from 'lucide-react'

export default function DownloadAppBanner() {
  const [isDismissed, setIsDismissed] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [pwaPrompt, setPwaPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(isPWA)

      // Check session dismissal
      const dismissed = sessionStorage.getItem('helloet_app_banner_dismissed')
      if (!dismissed && !isPWA) {
        setIsDismissed(false)
      }

      // Check for PWA install prompt
      if (window.deferredPrompt) {
        setPwaPrompt(window.deferredPrompt)
      }

      const handlePwaAvailable = (e: any) => {
        setPwaPrompt(e.detail || window.deferredPrompt)
      }

      window.addEventListener('helloet-pwa-installable', handlePwaAvailable)
      return () => {
        window.removeEventListener('helloet-pwa-installable', handlePwaAvailable)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('helloet_app_banner_dismissed', 'true')
  }

  const handleDownloadApk = async () => {
    setIsDownloading(true)
    try {
      // 1. Trigger the APK direct download
      const link = document.createElement('a')
      link.href = '/api/download/apk'
      link.download = 'HelloET-v1.0.0.apk'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 2. If PWA install prompt is also available, offer PWA installation
      if (pwaPrompt && typeof pwaPrompt.prompt === 'function') {
        setTimeout(async () => {
          try {
            await pwaPrompt.prompt()
            const choiceResult = await pwaPrompt.userChoice
            if (choiceResult?.outcome === 'accepted') {
              console.log('[PWA] User accepted installation')
            }
          } catch (e) {
            console.log('[PWA] Prompt skipped or closed')
          }
        }, 1500)
      }

      setDownloadSuccess(true)
      setTimeout(() => {
        setDownloadSuccess(false)
        setIsDownloading(false)
      }, 3500)
    } catch (err) {
      console.error('Download error:', err)
      setIsDownloading(false)
    }
  }

  // If running as an installed PWA or dismissed, do not render
  if (isStandalone || isDismissed) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#16A34A]/10 to-transparent py-2 sm:py-2.5 px-3 sm:px-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-[#120826] border border-purple-900/50 shadow-xl shadow-black/25 rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          
          {/* Subtle background ambient light */}
          <div className="absolute -top-8 -left-8 w-28 h-28 bg-[#00E575]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left section: App Icon & Texts */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Green Rounded App Icon */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#00E575] to-[#10B981] flex items-center justify-center text-[#0A2616] font-bold shrink-0 shadow-md shadow-[#00E575]/20 ring-2 ring-emerald-400/30">
              <div className="flex items-center justify-center">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] text-[#0A2616]" />
                <ArrowDownToLine className="w-2.5 h-2.5 absolute text-[#0A2616] stroke-[3] -translate-y-0.5" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                  Download HelloET App
                </span>
                <span className="inline-flex items-center bg-[#00E575] text-[#0A2616] text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  APK
                </span>
              </div>
              <p className="text-xs text-purple-200/80 sm:text-zinc-300 truncate font-normal">
                Official Android APK • Direct Install for Phones & Tablets
              </p>
            </div>
          </div>

          {/* Right section: CTA Button & Dismiss Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={handleDownloadApk}
              disabled={isDownloading}
              className="w-full sm:w-auto bg-[#00E575] hover:bg-[#00D06C] active:scale-95 text-[#0A2616] font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00E575]/25 disabled:opacity-80 cursor-pointer"
              aria-label="Download HelloET Android APK"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0A2616]" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">📲</span>
                  <span>{isDownloading ? 'Starting Download...' : 'Download APK'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-purple-300/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none shrink-0"
              aria-label="Dismiss app download banner"
              title="Dismiss"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
