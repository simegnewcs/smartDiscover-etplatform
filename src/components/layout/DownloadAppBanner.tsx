'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone, Download, CheckCircle2, ArrowDownToLine, MoreVertical, Share, ExternalLink, Sparkles, AlertCircle } from 'lucide-react'

export default function DownloadAppBanner() {
  const [isDismissed, setIsDismissed] = useState(true)
  const [pwaPrompt, setPwaPrompt] = useState<any>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk'>('android')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Detect if already installed & running as standalone PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(isPWA)

      // 2. Check session dismissal
      const dismissed = sessionStorage.getItem('helloet_app_banner_dismissed')
      if (!dismissed && !isPWA) {
        setIsDismissed(false)
      }

      // 3. Detect OS to set initial tab
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        setActiveTab('ios')
      } else {
        setActiveTab('android')
      }

      // 4. Capture PWA install prompt
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

  const handleCtaClick = async () => {
    // If browser supports native PWA prompt, trigger it directly for seamless 0-error installation!
    if (pwaPrompt && typeof pwaPrompt.prompt === 'function') {
      try {
        await pwaPrompt.prompt()
        const choice = await pwaPrompt.userChoice
        if (choice?.outcome === 'accepted') {
          setIsDismissed(true)
          return
        }
      } catch (err) {
        console.warn('Native prompt cancelled or failed, opening instructions modal:', err)
      }
    }

    // Open guide modal with 1-tap instructions for Android and iOS
    setShowModal(true)
  }

  const triggerDirectApkDownload = () => {
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = '/api/download/apk'
    link.download = 'HelloET-v1.0.0.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloadSuccess(true)
    setTimeout(() => {
      setDownloadSuccess(false)
      setIsDownloading(false)
    }, 4000)
  }

  if (isStandalone || isDismissed) {
    return null
  }

  return (
    <>
      <div className="w-full bg-gradient-to-b from-[#16A34A]/10 to-transparent py-2 sm:py-2.5 px-3 sm:px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-[#120826] border border-purple-900/50 shadow-xl shadow-black/25 rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            
            {/* Ambient glows */}
            <div className="absolute -top-8 -left-8 w-28 h-28 bg-[#00E575]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left section: App Icon & Texts */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#00E575] to-[#10B981] flex items-center justify-center text-[#0A2616] font-bold shrink-0 shadow-md shadow-[#00E575]/20 ring-2 ring-emerald-400/30">
                <div className="flex items-center justify-center">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] text-[#0A2616]" />
                  <ArrowDownToLine className="w-2.5 h-2.5 absolute text-[#0A2616] stroke-[3] -translate-y-0.5" />
                </div>
              </div>

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

            {/* Right section: CTA Button & Dismiss */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto bg-[#00E575] hover:bg-[#00D06C] active:scale-95 text-[#0A2616] font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00E575]/25 cursor-pointer"
                aria-label="Download or install HelloET App"
              >
                <span className="text-sm">📲</span>
                <span>Download APK</span>
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

      {/* Install App Guidance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0F0826] border border-purple-800/60 rounded-3xl p-6 sm:p-7 text-white shadow-2xl">
            
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E575] to-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/20 text-[#0A2616]">
                <Smartphone className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Install HelloET App</h3>
                  <span className="bg-[#00E575] text-[#0A2616] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">PWA + APK</span>
                </div>
                <p className="text-xs text-purple-200/80">Direct Install for Android, iOS & Tablets</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-5">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'android'
                    ? 'bg-[#00E575] text-[#0A2616] shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'ios'
                    ? 'bg-[#00E575] text-[#0A2616] shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                iPhone / Safari
              </button>
              <button
                onClick={() => setActiveTab('apk')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'apk'
                    ? 'bg-[#00E575] text-[#0A2616] shadow-sm'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Direct APK File
              </button>
            </div>

            {/* Tab 1: Android PWA (Official WebAPK - No Parse Errors!) */}
            {activeTab === 'android' && (
              <div className="space-y-4">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-100 flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#00E575] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#00E575] block font-semibold mb-0.5">Recommended (Zero Error Install)</strong>
                    Install directly from Chrome as an official Android WebAPK. It installs seamlessly without any "problem with app file" package error!
                  </div>
                </div>

                {pwaPrompt ? (
                  <button
                    onClick={async () => {
                      if (pwaPrompt && typeof pwaPrompt.prompt === 'function') {
                        await pwaPrompt.prompt()
                        setShowModal(false)
                      }
                    }}
                    className="w-full py-3 bg-[#00E575] hover:bg-[#00c965] text-[#0A2616] font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>⚡ Install HelloET Now (1-Click)</span>
                  </button>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
                    <p className="font-semibold text-white">How to install directly from your browser:</p>
                    <div className="flex items-center gap-3 text-purple-200">
                      <span className="w-6 h-6 rounded-full bg-[#00E575]/20 text-[#00E575] flex items-center justify-center font-bold shrink-0">1</span>
                      <span>Tap the <strong>3 dots (⋮)</strong> in Chrome at the top right</span>
                    </div>
                    <div className="flex items-center gap-3 text-purple-200">
                      <span className="w-6 h-6 rounded-full bg-[#00E575]/20 text-[#00E575] flex items-center justify-center font-bold shrink-0">2</span>
                      <span>Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>)</span>
                    </div>
                    <div className="flex items-center gap-3 text-purple-200">
                      <span className="w-6 h-6 rounded-full bg-[#00E575]/20 text-[#00E575] flex items-center justify-center font-bold shrink-0">3</span>
                      <span>Tap <strong>Install</strong> — HelloET will appear on your phone home screen!</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: iOS Safari */}
            {activeTab === 'ios' && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
                  <p className="font-semibold text-white">How to install on iPhone & iPad:</p>
                  <div className="flex items-center gap-3 text-purple-200">
                    <span className="w-6 h-6 rounded-full bg-[#00E575]/20 text-[#00E575] flex items-center justify-center font-bold shrink-0">1</span>
                    <span>Open <strong>Safari</strong> and tap the <strong>Share button (⎋)</strong> at the bottom</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-200">
                    <span className="w-6 h-6 rounded-full bg-[#00E575]/20 text-[#00E575] flex items-center justify-center font-bold shrink-0">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-200">
                    <span className="w-6 h-6 rounded-full bg-[#00E575]/20 text-[#00E575] flex items-center justify-center font-bold shrink-0">3</span>
                    <span>Tap <strong>Add</strong> at top right to complete installation</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Direct APK */}
            {activeTab === 'apk' && (
              <div className="space-y-4">
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block font-semibold mb-0.5">Android APK Notice</strong>
                    For sideloading raw `.apk` files, Android requires granting <em>"Install unknown apps"</em> permission in your phone Settings. For 100% error-free install without permissions, use the <strong>Android (Chrome)</strong> tab above.
                  </div>
                </div>

                <button
                  onClick={triggerDirectApkDownload}
                  disabled={isDownloading}
                  className="w-full py-3 bg-[#00E575] hover:bg-[#00c965] text-[#0A2616] font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Download Started! Check Notifications</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isDownloading ? 'Downloading...' : 'Download HelloET-v1.0.0.apk'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <span className="text-[11px] text-purple-300/70">
                Deployed at <a href="https://helloet.devvoltz.com/" target="_blank" rel="noopener noreferrer" className="text-[#00E575] underline">helloet.devvoltz.com</a>
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
