'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Building2,
  Star,
  Tags,
  LogOut,
  ChevronRight,
  Settings,
  Menu,
  X,
  Home,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-[#64748B]">Loading HelloET Admin...</span>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#16A34A]/20 selection:text-[#16A34A]">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#000000]/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - HelloET Brand Styled */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0 !w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-20 px-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            {/* HelloET Official Logo */}
            {!isSidebarCollapsed || isMobileMenuOpen ? (
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo-icon.svg"
                    alt="HelloET Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="font-extrabold text-[#0F172A] text-lg tracking-tight leading-none flex items-center gap-1.5">
                    HelloET
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A]">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-[#64748B] mt-0.5">Business Platform</div>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] p-1.5 flex items-center justify-center shadow-sm mx-auto group-hover:scale-105 transition-transform">
                <Image
                  src="/logo-icon.svg"
                  alt="HelloET"
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            className="lg:hidden text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav List */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="px-3 pb-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-semibold transition-all group ${
                  active
                    ? 'bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25'
                    : 'text-[#64748B] hover:bg-[#F0FDF4] hover:text-[#16A34A]'
                } ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center !px-2' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-white' : 'text-[#64748B] group-hover:text-[#16A34A]'
                  }`}
                />
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
                {(!isSidebarCollapsed || isMobileMenuOpen) && active && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white/80" />
                )}
              </Link>
            )
          })}

          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="pt-6 px-3 pb-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Management
            </div>
          )}

          {/* User Dashboard / Portal Link */}
          <Link
            href="/dashboard"
            title={isSidebarCollapsed && !isMobileMenuOpen ? 'User Portal' : undefined}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-semibold text-[#64748B] hover:bg-[#F0FDF4] hover:text-[#16A34A] transition-all group ${
              isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center !px-2' : ''
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0 text-[#64748B] group-hover:text-[#16A34A] transition-transform group-hover:rotate-45" />
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <span className="truncate">Settings & Portal</span>
            )}
          </Link>
        </div>


        {/* User Footer & Logout */}
        <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2 bg-white">
          <div
            className={`flex items-center gap-3 overflow-hidden ${
              isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#0F172A] truncate">{session.user.name}</div>
                <div className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Super Admin
                </div>
              </div>
            )}
          </div>
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              title="Sign Out"
              className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand Icon + Hamburger + Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
            {/* Mobile / Desktop Hamburger Toggle */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed)
                }
              }}
              className="p-2.5 rounded-xl text-[#64748B] hover:text-[#16A34A] hover:bg-[#F0FDF4] transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* HelloET Pill Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-[#16A34A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search businesses, users, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] pl-11 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#16A34A]/50 focus:ring-4 focus:ring-[#16A34A]/10 transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Right: Language Flag + Notification Bell + Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector Dropdown */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] cursor-pointer transition-colors text-xs font-bold text-[#0F172A]">
              <span className="text-base leading-none">🇪🇹</span>
              <span>ET (Amharic / EN)</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </div>

            {/* Notification Bell in warm peach box */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-10 h-10 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] flex items-center justify-center transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#D97706]" />
                {/* Red Alert Dot */}
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse" />
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 z-50 animate-fade-in-up">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                    <span className="font-extrabold text-sm text-[#0F172A]">Notifications</span>
                    <span className="text-[11px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="py-2 divide-y divide-[#F8FAFC]">
                    <div className="py-2.5 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#0F172A]">New business verification requested</p>
                        <p className="text-[#64748B] text-[11px] mt-0.5">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="py-2.5 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-[#0F172A]">5 new reviews submitted today</p>
                        <p className="text-[#64748B] text-[11px] mt-0.5">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Home Quick Action */}
            <Link
              href="/"
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] hover:bg-[#BBF7D0] rounded-xl transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Platform Home</span>
            </Link>

            {/* User Profile Pill / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-[#F1F5F9] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center font-extrabold text-sm shadow-sm ring-2 ring-white">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-extrabold text-[#0F172A] leading-tight flex items-center gap-1">
                    {session.user.name}
                    <ChevronDown className="w-3 h-3 text-[#64748B]" />
                  </div>
                  <div className="text-[11px] text-[#16A34A] font-bold">Administrator</div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-fade-in-up">
                  <div className="px-3 py-2 border-b border-[#F1F5F9]">
                    <div className="text-xs font-extrabold text-[#0F172A] truncate">{session.user.name}</div>
                    <div className="text-[11px] text-[#64748B] truncate">{session.user.email}</div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F0FDF4] hover:text-[#16A34A] rounded-xl transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>User Dashboard</span>
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F0FDF4] hover:text-[#16A34A] rounded-xl transition-colors"
                    >
                      <Home className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Browse Portal</span>
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
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

        {/* Page Content View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
