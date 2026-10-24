'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu,
  X,
  Search,
  Bell,
  Home,
  ChevronDown,
  ShieldCheck,
  Settings,
  LogOut,
  Star,
  CheckCircle2,
  Compass,
  Building2,
  Activity
} from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import TrafficAnalysisModal from '@/components/dashboard/TrafficAnalysisModal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isTrafficModalOpen, setIsTrafficModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-[#64748B]">Loading HelloET Dashboard...</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  const isAdmin = session.user.role === 'ADMIN'

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#16A34A]/20 selection:text-[#16A34A]">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dabang Style */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileSidebarOpen ? 'translate-x-0 !w-64' : '-translate-x-full md:translate-x-0'}`}
      >
        <Sidebar
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed && !isMobileSidebarOpen}
        />
      </aside>

      {/* Main Content View */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Navbar - Dabang Style */}
        <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left: Hamburger & Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen)
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed)
                }
              }}
              className="p-2.5 rounded-xl text-[#64748B] hover:text-[#16A34A] hover:bg-[#F0FDF4] transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Pill Search */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-[#16A34A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search businesses, reviews, places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] pl-11 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#16A34A]/50 focus:ring-4 focus:ring-[#16A34A]/10 transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Traffic Analysis Button - Owner Scope */}
            <button
              onClick={() => setIsTrafficModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 group"
              title="View your business traffic (Daily, 7D, Monthly)"
            >
              <Activity className="w-4 h-4 text-[#DCFCE7] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">My Business Traffic</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86EFAC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DCFCE7]"></span>
              </span>
            </button>

            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] cursor-pointer transition-colors text-xs font-bold text-[#0F172A]">
              <span className="text-base leading-none">🇪🇹</span>
              <span>ET (Amharic / EN)</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-10 h-10 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] flex items-center justify-center transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#D97706]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse" />
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 z-50 animate-fade-in-up">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                    <span className="font-extrabold text-sm text-[#0F172A]">Activity Updates</span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>
                  <div className="py-2 divide-y divide-[#F8FAFC]">
                    <div className="py-2.5 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#0F172A]">Profile synced successfully</p>
                        <p className="text-[#64748B] text-[11px] mt-0.5">Just now</p>
                      </div>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#0F172A]">Discover trending Addis spots</p>
                        <p className="text-[#64748B] text-[11px] mt-0.5">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Portal Shortcut if Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold text-[#16A34A] bg-[#DCFCE7] hover:bg-[#BBF7D0] rounded-xl transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* Back to Home Quick Action */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#64748B] hover:text-[#16A34A] bg-[#F1F5F9] hover:bg-[#F0FDF4] rounded-xl transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>

            {/* User Profile Pill / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-[#F1F5F9] transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ''}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center font-extrabold text-sm shadow-sm ring-2 ring-white">
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-extrabold text-[#0F172A] leading-tight flex items-center gap-1">
                    {session.user.name}
                    <ChevronDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                  <div className="text-[11px] text-[#16A34A] font-bold">
                    {session.user.role === 'BUSINESS_OWNER'
                      ? 'Business Partner'
                      : session.user.role === 'ADMIN'
                      ? 'Administrator'
                      : 'Explorer Member'}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-fade-in-up">
                  <div className="px-3 py-2 border-b border-[#F1F5F9]">
                    <div className="text-xs font-extrabold text-[#0F172A] truncate">
                      {session.user.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F0FDF4] hover:text-[#16A34A] rounded-xl transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/businesses"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F0FDF4] hover:text-[#16A34A] rounded-xl transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Explore Ethiopia</span>
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/businesses"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#DCFCE7] hover:text-[#16A34A] rounded-xl transition-colors"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Manage All Businesses</span>
                        </Link>
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#DCFCE7] hover:text-[#16A34A] rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Traffic Analysis Modal - Business Owner Scope Only */}
      <TrafficAnalysisModal
        isOpen={isTrafficModalOpen}
        onClose={() => setIsTrafficModalOpen(false)}
        scope="business"
      />
    </div>
  )
}
