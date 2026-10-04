'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const isAdminAllowedPath = ADMIN_ALLOWED_PATHS.some(p => pathname?.startsWith(p))

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !isAdminAllowedPath) {
      router.replace('/admin')
    }
  }, [status, session, router, isAdminAllowedPath])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#047857] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !isAdminAllowedPath) {
    return null
  }

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex-none bg-white border-b border-neutral-200 p-4 flex items-center justify-between z-30">
        <span className="font-semibold text-neutral-800">Dashboard</span>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Wrapper */}
        <div className={`
          fixed md:relative inset-y-0 left-0 z-50 transform 
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 h-full
        `}>
          <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
