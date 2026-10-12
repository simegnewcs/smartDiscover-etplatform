'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Building2, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  CreditCard, 
  Users, 
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Heart,
  History,
  Bookmark,
  PlusCircle,
  Bell,
  ShieldCheck,
  X,
  Sparkles,
  HelpCircle,
  Compass,
  Tags,
  MapPin
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: any
  badge?: string | number
  children?: SidebarItem[]
}

interface DashboardStats {
  businessCount: number
  reviewCount: number
  messageCount: number
  notificationCount: number
  savedPlacesCount: number
  recentActivityCount: number
}

interface SidebarProps {
  onClose?: () => void
  isCollapsed?: boolean
}

export default function Sidebar({ onClose, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    businessCount: 0,
    reviewCount: 0,
    messageCount: 0,
    notificationCount: 0,
    savedPlacesCount: 0,
    recentActivityCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const userRole = session?.user?.role
  const isBusinessOwner = userRole === 'BUSINESS_OWNER'
  const isAdmin = userRole === 'ADMIN'

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch sidebar stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchStats()
    }
  }, [session])

  // Build dynamic sidebar items with real data
  const getSidebarItems = (): SidebarItem[] => {
    if (isAdmin) {
      return [
        { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
        { 
          name: 'Manage Businesses', 
          href: '/admin/businesses', 
          icon: Building2,
          badge: stats.businessCount > 0 ? stats.businessCount : undefined
        },
        { name: 'Users Management', href: '/admin/users', icon: Users },
        { 
          name: 'Reviews Moderation', 
          href: '/admin/reviews', 
          icon: Star,
          badge: stats.reviewCount > 0 ? stats.reviewCount : undefined
        },
        { name: 'Categories', href: '/admin/categories', icon: Tags },
        { name: 'Places', href: '/admin/places', icon: MapPin },
        { 
          name: 'My Business Listings', 
          href: '/dashboard/listings', 
          icon: Building2 
        },
        { name: 'Add New Business', href: '/dashboard/listings/new', icon: PlusCircle },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings }
      ]
    } else if (isBusinessOwner) {
      return [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { 
          name: 'My Businesses', 
          href: '/dashboard/listings', 
          icon: Building2,
          badge: stats.businessCount > 0 ? stats.businessCount : undefined
        },
        { name: 'Add Business', href: '/dashboard/listings/new', icon: PlusCircle },
        { 
          name: 'Customer Reviews', 
          href: '/dashboard/reviews', 
          icon: Star,
          badge: stats.reviewCount > 0 ? stats.reviewCount : undefined
        },
        { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
        { 
          name: 'Messages', 
          href: '/dashboard/messages', 
          icon: MessageSquare,
          badge: stats.messageCount > 0 ? stats.messageCount : undefined
        },
        { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings }
      ]
    } else {
      return [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Businesses', href: '/dashboard/listings', icon: Building2 },
        { 
          name: 'My Reviews', 
          href: '/my-reviews', 
          icon: Star,
          badge: stats.reviewCount > 0 ? stats.reviewCount : undefined
        },
        { 
          name: 'Saved Places', 
          href: '/saved', 
          icon: Bookmark,
          badge: stats.savedPlacesCount > 0 ? stats.savedPlacesCount : undefined
        },
        { 
          name: 'Recent Activity', 
          href: '/activity', 
          icon: History,
          badge: stats.recentActivityCount > 0 ? stats.recentActivityCount : undefined
        },
        { 
          name: 'Notifications', 
          href: '/notifications', 
          icon: Bell,
          badge: stats.notificationCount > 0 ? stats.notificationCount : undefined
        },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings }
      ]
    }
  }

  const sidebarItems = getSidebarItems()

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={`bg-white border-r border-[#E2E8F0] h-full flex flex-col transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Brand Header */}
      <div className="h-20 px-5 border-b border-[#F1F5F9] flex items-center justify-between flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          {!isCollapsed ? (
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
              <div className="overflow-hidden">
                <div className="font-extrabold text-[#0F172A] text-lg tracking-tight leading-none flex items-center gap-1.5">
                  HelloET
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A]">
                    {isAdmin ? 'ADMIN' : isBusinessOwner ? 'PARTNER' : 'EXPLORER'}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#64748B] mt-0.5 truncate">
                  {isAdmin ? 'Admin Portal' : isBusinessOwner ? 'Business Portal' : 'User Portal'}
                </div>
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
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-gray-100 md:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            Menu Navigation
          </div>
        )}

        {sidebarItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[14px] font-semibold transition-all group ${
                active
                  ? 'bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25'
                  : 'text-[#64748B] hover:bg-[#F0FDF4] hover:text-[#16A34A]'
              } ${isCollapsed ? 'justify-center !px-2' : ''}`}
              onClick={onClose}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  active ? 'text-white' : 'text-[#64748B] group-hover:text-[#16A34A]'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {!isCollapsed && (
                <div className="ml-auto flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-[#DCFCE7] text-[#16A34A]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="w-4 h-4 text-white/80" />}
                </div>
              )}
            </Link>
          )
        })}

        {!isCollapsed && (
          <div className="pt-5 px-3 pb-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            Quick Actions
          </div>
        )}

        {/* Explore Directory */}
        <Link
          href="/businesses"
          title={isCollapsed ? 'Explore Directory' : undefined}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-semibold text-[#64748B] hover:bg-[#F0FDF4] hover:text-[#16A34A] transition-all group ${
            isCollapsed ? 'justify-center !px-2' : ''
          }`}
          onClick={onClose}
        >
          <Compass className="w-5 h-5 flex-shrink-0 text-[#64748B] group-hover:text-[#16A34A] transition-transform" />
          {!isCollapsed && <span className="truncate">Explore Ethiopia</span>}
        </Link>

        {/* Admin links if user is admin */}
        {isAdmin && (
          <div className="space-y-1">
            <Link
              href="/admin/businesses"
              title={isCollapsed ? 'Manage All Businesses' : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-bold text-[#16A34A] bg-[#DCFCE7]/60 hover:bg-[#DCFCE7] transition-all group ${
                isCollapsed ? 'justify-center !px-2' : ''
              }`}
              onClick={onClose}
            >
              <Building2 className="w-5 h-5 flex-shrink-0 text-[#16A34A]" />
              {!isCollapsed && <span className="truncate">Manage All Businesses</span>}
            </Link>
            <Link
              href="/admin"
              title={isCollapsed ? 'Admin Control Center' : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-bold text-[#16A34A] hover:bg-[#DCFCE7]/40 transition-all group ${
                isCollapsed ? 'justify-center !px-2' : ''
              }`}
              onClick={onClose}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#16A34A]" />
              {!isCollapsed && <span className="truncate">Admin Control Center</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2 bg-white flex-shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${
          isCollapsed ? 'justify-center w-full' : ''
        }`}>
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || ''} 
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0" 
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#0F172A] truncate">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider truncate">
                {isAdmin ? 'Administrator' : isBusinessOwner ? 'Business Owner' : 'Explorer'}
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title="Sign Out"
            className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
