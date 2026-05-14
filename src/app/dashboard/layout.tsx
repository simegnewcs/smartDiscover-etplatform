'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'

const ADMIN_ALLOWED_PATHS = ['/dashboard/businesses/new']

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isAdminAllowedPath = ADMIN_ALLOWED_PATHS.some(p => pathname?.startsWith(p))

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !isAdminAllowedPath) {
      router.replace('/admin')
    }
  }, [status, session, router, isAdminAllowedPath])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#006747] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !isAdminAllowedPath) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <div className="flex h-screen pt-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
