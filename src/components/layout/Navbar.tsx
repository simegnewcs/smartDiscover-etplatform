'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogIn, LogOut, Plus, ChevronDown, Compass, LayoutDashboard } from 'lucide-react'
import UniversalSidebar from '@/components/layout/UniversalSidebar'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  
  const isLoggedIn = status === 'authenticated'
  
  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigationItems = [
    { name: 'Discover', href: '/businesses', icon: Compass },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
  ]

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#047857]/95 backdrop-blur-md shadow-lg border-b border-[#036246] py-2' 
            : 'bg-[#047857] border-b border-[#036246] py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left Section: Logo & Sidebar Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-xl hover:bg-white/10 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="text-[#047857] font-extrabold text-lg tracking-tight">H</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">HelloET</span>
              </Link>
            </div>

            {/* Middle Section: Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center space-x-3">
              {/* Add Business Button (Desktop) */}
              <Link 
                href="/dashboard/businesses/new" 
                className="hidden md:flex items-center space-x-2 bg-white hover:bg-neutral-100 text-[#047857] px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Business</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all border ${
                    isLoggedIn 
                      ? 'bg-white/10 border-white/20 hover:border-white/40 hover:bg-white/20' 
                      : 'bg-white/10 border-white/10 hover:bg-white/20'
                  }`}
                >
                  {isLoggedIn ? (
                    <>
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-7 h-7 rounded-lg object-cover shadow-inner" />
                      ) : (
                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-inner">
                          <span className="text-[#047857] font-bold text-xs">
                            {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-white hidden sm:block">
                        {session?.user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white hidden sm:block">Sign In</span>
                    </>
                  )}
                  <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu (Remains White for Readability) */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-neutral-100 py-2 transform opacity-100 scale-100 transition-all origin-top-right">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-3 border-b border-neutral-100 mb-2">
                          <p className="text-sm font-bold text-neutral-800 truncate">{session?.user?.name || 'User'}</p>
                          <p className="text-xs text-neutral-500 truncate mt-0.5">{session?.user?.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-[#047857] hover:bg-neutral-50 transition-colors mx-1 rounded-lg"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <div className="border-t border-neutral-100 my-1"></div>
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsProfileMenuOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mx-1 rounded-lg"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-[#047857] hover:bg-neutral-50 transition-colors mx-1 rounded-lg"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <LogIn className="w-4 h-4 text-neutral-400" />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          href="/auth/register"
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-[#047857] hover:bg-neutral-50 transition-colors mx-1 rounded-lg"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span>Create Account</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-lg py-4 px-4 flex flex-col space-y-4">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-neutral-700 hover:text-[#047857] hover:bg-neutral-50 font-medium px-4 py-3 rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-neutral-400" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="pt-4 border-t border-neutral-100">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' })
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-4 py-3.5 rounded-xl font-medium transition-colors shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="w-full flex items-center justify-center space-x-2 bg-[#047857] hover:bg-[#036246] text-white px-4 py-3.5 rounded-xl font-medium transition-colors shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Universal Sidebar */}
      <UniversalSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
}
