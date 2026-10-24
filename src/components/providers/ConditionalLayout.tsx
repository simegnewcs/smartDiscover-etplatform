'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/layout/ChatWidget'
import DownloadAppBanner from '@/components/layout/DownloadAppBanner'
import PwaRegister from '@/components/providers/PwaRegister'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isDashboardRoute = pathname?.startsWith('/dashboard')
  const shouldHideLayout = isAdminRoute || isDashboardRoute

  // Automatically track real visitor browsing in the background
  useEffect(() => {
    if (!pathname || pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return

    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          eventType: 'PAGE_VIEW',
          referrer: typeof document !== 'undefined' ? document.referrer || null : null
        })
      }).catch(() => {})
    } catch {}
  }, [pathname])

  return (
    <>
      <PwaRegister />
      {!shouldHideLayout && <Navbar />}
      {!shouldHideLayout && <DownloadAppBanner />}
      {children}
      {!shouldHideLayout && <Footer />}
      {!shouldHideLayout && <ChatWidget />}
    </>
  )
}

