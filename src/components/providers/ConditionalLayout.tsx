'use client'

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

