'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Search, Menu, X, User, LogIn, LogOut, Plus, ChevronDown } from 'lucide-react'
import UniversalSidebar from '@/components/layout/UniversalSidebar'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  
  const isLoggedIn = status === 'authenticated'
  
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
    { name: 'Businesses', href: '/businesses' },
    { name: 'Dashboard', href: '/dashboard' }
  ]

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Hamburger Menu */}
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-neutral-600" />
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#006747] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-bold text-neutral-800">HelloET</span>
              </Link>
            </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
         

            {/* Add Business */}
            <Link href="/auth/register" className="hidden md:flex items-center space-x-2 bg-[#006747] hover:bg-[#00523A] text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Business</span>
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isLoggedIn 
                    ? 'bg-[#D1EFE4] hover:bg-[#B8E5D0] text-[#006747]' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                {isLoggedIn ? (
                  <>
                    <div className="w-6 h-6 bg-[#006747] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{session?.user?.name?.split(' ')[0] || 'User'}</span>
                  </>
                ) : (
                  <User className="w-4 h-4" />
                )}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-neutral-200">
                        <p className="text-sm font-medium text-neutral-800">{session?.user?.name || 'User'}</p>
                        <p className="text-xs text-neutral-500 truncate">{session?.user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          setIsProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/auth/register"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Register</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button - hidden on home page since we have hamburger menu there */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-neutral-600" />
              ) : (
                <Menu className="w-5 h-5 text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-neutral-600 hover:text-primary-600 transition-colors font-medium px-2 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-t border-neutral-200 pt-3 mt-3">
                <Link href="/auth/register" className="w-full flex items-center justify-center space-x-2 bg-[#006747] hover:bg-[#00523A] text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Business</span>
                </Link>
              </div>
              
              <div className="border-t border-neutral-200 pt-3 mt-3">
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-2">
                    <div className="px-2 py-2 bg-neutral-50 rounded-lg">
                      <p className="text-sm font-medium text-neutral-800">{session?.user?.name || 'User'}</p>
                      <p className="text-xs text-neutral-500 truncate">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors px-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors px-2 py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/auth/login?callbackUrl=${encodeURIComponent(`/business/${slug}`)}"
                      className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-xl font-semibold transition-colors w-full justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors px-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    
    {/* Universal Sidebar */}
    <UniversalSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
  </>
  )
}
