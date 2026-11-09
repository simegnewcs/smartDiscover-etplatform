'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  LogIn, 
  LogOut, 
  Plus, 
  ChevronDown, 
  Compass, 
  LayoutDashboard, 
  Search, 
  Building2, 
  Bell, 
  Bookmark, 
  CreditCard, 
  HelpCircle,
  Home,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import UniversalSidebar from '@/components/layout/UniversalSidebar'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [savedCount, setSavedCount] = useState<number>(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0)
  
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  
  const isLoggedIn = status === 'authenticated'
  const isRegularUser = session?.user?.role === 'USER'
  const isAdmin = session?.user?.role === 'ADMIN'
  const isBusinessOwner = session?.user?.role === 'BUSINESS_OWNER'

  // Global search submission
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (globalSearchQuery.trim()) {
      router.push(`/businesses?search=${encodeURIComponent(globalSearchQuery.trim())}`)
      setIsMobileSearchOpen(false)
    }
  }

  // Smooth scroll handler for anchor links (e.g. /#faq)
  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '')
      const el = document.getElementById(elementId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Helper to determine if navigation item is currently active
  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/#')) return false
    return pathname.startsWith(href)
  }

  // Fetch saved places and notifications count for logged in users
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/saved')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setSavedCount(data.data.total ?? data.data.savedBusinesses?.length ?? 0)
          }
        })
        .catch(() => {})

      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUnreadNotificationsCount(data.data.unreadCount ?? 0)
          }
        })
        .catch(() => {})
    }
  }, [isLoggedIn])

  // Real-time synchronization of saved count across components
  useEffect(() => {
    const handleSavedUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (typeof customEvent.detail?.count === 'number') {
        setSavedCount(customEvent.detail.count)
      } else {
        fetch('/api/saved')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              setSavedCount(data.data.total ?? data.data.savedBusinesses?.length ?? 0)
            }
          })
          .catch(() => {})
      }
    }

    window.addEventListener('saved-count-updated', handleSavedUpdated)
    return () => window.removeEventListener('saved-count-updated', handleSavedUpdated)
  }, [])
  
  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isMobileSearchOpen])

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-mobile-menu-trigger]')
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [pathname])

  // Primary navigation items
  const navigationItems = [
    { name: 'Businesses', href: '/businesses', icon: Building2 },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'FAQ', href: '/#faq', icon: HelpCircle },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#16A34A]/95 backdrop-blur-md shadow-md border-b border-[#036246] py-2' 
            : 'bg-[#16A34A] border-b border-[#036246] py-2.5 sm:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-11 sm:h-12">
            
            {/* Left Section: Sidebar Toggle & Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Explore Categories & Locations"
                title="Explore Categories & Cities"
              >
                <Compass className="w-5 h-5 sm:w-5 sm:h-5 text-white/95" />
              </button>
              
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105 bg-white flex-shrink-0">
                  <Image 
                    src="/HELLOTLOGO.png" 
                    alt="HelloET Logo" 
                    fill 
                    sizes="(max-width: 640px) 36px, 40px"
                    className="object-cover" 
                    priority 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    Hello<span className="text-[#FBBF24]">ET</span>
                  </span>
                  <span className="text-[10px] text-white/70 font-medium tracking-wider hidden sm:block leading-tight">
                    Ethiopia Discovery
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Section: Responsive Search & Desktop Nav */}
            <div className="hidden md:flex flex-1 items-center justify-center px-3 lg:px-6 space-x-2 lg:space-x-4 max-w-2xl">
              {/* Search Bar for Tablet & Desktop */}
              <form onSubmit={handleGlobalSearch} className="relative w-full max-w-xs xl:max-w-sm">
                <div className="flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-white/20 rounded-full px-3.5 py-1.5 transition-all shadow-inner focus-within:border-white/50">
                  <Search className="w-4 h-4 text-white/75 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/60 ml-2 text-xs sm:text-sm font-medium"
                  />
                  {globalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGlobalSearchQuery('')}
                      className="text-white/60 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Navigation Items (Visible on md and above) */}
              <nav className="flex items-center space-x-1 flex-shrink-0">
                {navigationItems.map((item) => {
                  const active = isItemActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                        active
                          ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 opacity-90" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              
              {/* Mobile Search Toggle Button */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`md:hidden p-2 rounded-xl text-white transition-colors ${
                  isMobileSearchOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10'
                }`}
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Quick User Actions for Logged-In Regular Users (Saved & Notifications) */}
              {isLoggedIn && isRegularUser && (
                <>
                  <Link 
                    href="/saved" 
                    className="relative p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-all border border-transparent hover:border-white/20"
                    title="Saved Places"
                    aria-label="Saved Places"
                  >
                    <Bookmark className="w-5 h-5 text-white transition-transform hover:scale-110" />
                    {savedCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                        {savedCount > 99 ? '99+' : savedCount}
                      </span>
                    )}
                  </Link>

                  <Link 
                    href="/notifications" 
                    className="relative p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-all border border-transparent hover:border-white/20"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-white transition-transform hover:scale-110" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1 bg-amber-400 text-neutral-900 text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center shadow-md animate-pulse">
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Add Business Button (Desktop / Tablet - Hidden for regular users) */}
              {!isRegularUser && (
                <Link 
                  href="/dashboard/listings/new" 
                  className="hidden md:inline-flex items-center space-x-1.5 bg-white hover:bg-neutral-100 text-[#16A34A] px-3.5 lg:px-4 py-2 rounded-xl font-bold text-xs lg:text-sm transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#16A34A]" />
                  <span className="hidden lg:inline">Add Business</span>
                  <span className="lg:hidden">Add</span>
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-2 py-1.5 rounded-xl transition-all border ${
                    isLoggedIn 
                      ? 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/20' 
                      : 'bg-white/15 border-white/20 hover:bg-white/25 text-white'
                  }`}
                  aria-expanded={isProfileMenuOpen}
                  aria-label="User account menu"
                >
                  {isLoggedIn ? (
                    <>
                      {session?.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt="" 
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover shadow-inner" 
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg flex items-center justify-center shadow-inner flex-shrink-0">
                          <span className="text-[#16A34A] font-black text-xs">
                            {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-white hidden sm:block max-w-[90px] truncate">
                        {session?.user?.name?.split(' ')[0] || 'Account'}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white hidden sm:block">
                        Sign In
                      </span>
                    </>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2.5 z-50 transform opacity-100 scale-100 transition-all origin-top-right">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-3 border-b border-neutral-100 mb-1.5">
                          <p className="text-sm font-extrabold text-neutral-800 truncate">
                            {session?.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {session?.user?.email}
                          </p>
                          {session?.user?.role && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#DCFCE7] text-[#16A34A]">
                              {session.user.role === 'BUSINESS_OWNER' ? 'Business Owner' : session.user.role}
                            </span>
                          )}
                        </div>

                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/saved"
                          className="flex items-center justify-between px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <Bookmark className="w-4 h-4 text-neutral-400" />
                            <span>Saved Places</span>
                          </div>
                          {savedCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                              {savedCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/notifications"
                          className="flex items-center justify-between px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <Bell className="w-4 h-4 text-neutral-400" />
                            <span>Notifications</span>
                          </div>
                          {unreadNotificationsCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-neutral-900 font-bold">
                              {unreadNotificationsCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/pricing"
                          className="flex items-center space-x-3 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <CreditCard className="w-4 h-4 text-neutral-400" />
                          <span>Pricing & Packages</span>
                        </Link>

                        <div className="border-t border-neutral-100 my-1.5"></div>
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsProfileMenuOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors mx-1.5 rounded-xl"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-800 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LogIn className="w-4 h-4 text-[#16A34A]" />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          href="/auth/register"
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-800 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span>Create Account</span>
                        </Link>
                        <div className="border-t border-neutral-100 my-1.5"></div>
                        <Link
                          href="/pricing"
                          className="flex items-center space-x-3 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-[#16A34A] hover:bg-neutral-50 transition-colors mx-1.5 rounded-xl"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <CreditCard className="w-4 h-4 text-neutral-400" />
                          <span>Pricing & Packages</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Navigation Drawer Toggle */}
              <button
                data-mobile-menu-trigger
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Search Expandable Bar */}
          {isMobileSearchOpen && (
            <div className="md:hidden w-full pt-2 pb-1.5 animate-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleGlobalSearch} className="relative w-full">
                <div className="flex items-center bg-white/15 backdrop-blur-md hover:bg-white/20 border border-white/25 rounded-2xl px-3.5 py-2.5 transition-colors focus-within:bg-white/25 focus-within:border-white/50 shadow-inner">
                  <Search className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search businesses, restaurants, hotels..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white placeholder-white/70 ml-2.5 text-sm font-medium"
                  />
                  {globalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGlobalSearchQuery('')}
                      className="p-1 text-white/70 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-2 px-3 py-1 bg-white text-[#16A34A] font-bold text-xs rounded-xl shadow-sm"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Dropdown Panel */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-2xl z-40 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-3 duration-200"
          >
            <div className="p-4 space-y-4">
              
              {/* Top Quick Profile / Status Card for Mobile */}
              {isLoggedIn ? (
                <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] font-black text-sm flex items-center justify-center">
                      {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-800 leading-tight">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-neutral-500 truncate max-w-[170px]">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A]">
                    {session?.user?.role === 'BUSINESS_OWNER' ? 'Owner' : 'Active'}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-[#16A34A] hover:bg-[#036246] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>Join Free</span>
                  </Link>
                </div>
              )}

              {/* Navigation Links Group */}
              <div className="space-y-1 border-t border-neutral-100 pt-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 mb-1">
                  Menu
                </p>
                <Link
                  href="/"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pathname === '/'
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4 text-neutral-400" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/businesses"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pathname.startsWith('/businesses')
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  <span>All Businesses</span>
                </Link>

                <Link
                  href="/pricing"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pathname === '/pricing'
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-neutral-400" />
                    <span>Pricing & Packages</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#FBBF24]/20 text-neutral-900 px-2 py-0.5 rounded-md">
                    0% Fee
                  </span>
                </Link>

                <Link
                  href="/#faq"
                  className="flex items-center space-x-3 text-neutral-700 hover:bg-neutral-50 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleNavClick('/#faq')
                  }}
                >
                  <HelpCircle className="w-4 h-4 text-neutral-400" />
                  <span>Frequently Asked Questions</span>
                </Link>

                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pathname.startsWith('/dashboard')
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                  <span>Dashboard</span>
                </Link>
              </div>

              {/* Logged In Quick Actions (Saved & Notifications) */}
              {isLoggedIn && (
                <div className="space-y-1 border-t border-neutral-100 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 mb-1">
                    Your Activity
                  </p>
                  <Link
                    href="/saved"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Bookmark className="w-4 h-4 text-neutral-400" />
                      <span>Saved Places</span>
                    </div>
                    {savedCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                        {savedCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/notifications"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-50 font-semibold text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-neutral-400" />
                      <span>Notifications</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-neutral-900 font-bold">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Add Business CTA */}
              {!isRegularUser && (
                <div className="pt-2">
                  <Link
                    href="/dashboard/listings/new"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 bg-[#16A34A] hover:bg-[#036246] text-white py-3 rounded-2xl font-bold text-sm transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your Business</span>
                  </Link>
                </div>
              )}

              {/* Explore Categories Drawer Trigger */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsSidebarOpen(true)
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 rounded-2xl font-bold text-xs transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#16A34A]" />
                  <span>Browse Categories & Cities</span>
                </button>
              </div>

              {/* Sign Out for Logged-In User */}
              {isLoggedIn && (
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-2xl font-bold text-xs transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Universal Sidebar (Categories, Cities, Navigation Drawer) */}
      <UniversalSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
}
