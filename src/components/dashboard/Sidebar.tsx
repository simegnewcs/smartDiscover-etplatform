'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  Bell
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: any
  badge?: string
  children?: SidebarItem[]
}

// Business Owner Navigation Items
const businessOwnerItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'My Businesses',
    href: '/dashboard/listings',
    icon: Building2,
    badge: '3'
  },
  {
    name: 'Add Business',
    href: '/dashboard/businesses/new',
    icon: PlusCircle
  },
  {
    name: 'Customer Reviews',
    href: '/dashboard/reviews',
    icon: Star,
    badge: '12'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: TrendingUp
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    badge: '5'
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

// Regular User Navigation Items
const userItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Find Businesses',
    href: '/businesses',
    icon: Search
  },
  {
    name: 'My Reviews',
    href: '/my-reviews',
    icon: Star,
    badge: '5'
  },
  {
    name: 'Saved Places',
    href: '/saved',
    icon: Bookmark
  },
  {
    name: 'Recent Activity',
    href: '/activity',
    icon: History
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: '2'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Determine user role and get appropriate navigation items
  const userRole = session?.user?.role
  const isBusinessOwner = userRole === 'BUSINESS_OWNER'
  const sidebarItems = isBusinessOwner ? businessOwnerItems : userItems

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="w-64 bg-white border-r border-neutral-200 h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-neutral-200">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#006747] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-800">HelloET</div>
            <div className="text-xs text-neutral-500">{isBusinessOwner ? 'Business Dashboard' : 'User Dashboard'}</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedItems.includes(item.name)
          const active = isActive(item.href)

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                  active
                    ? 'bg-[#D1EFE4] text-[#006747] border-l-2 border-[#006747]'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
                }`}
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.name)
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${active ? "text-[#006747]" : "text-neutral-400 group-hover:text-neutral-600"}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      active ? "bg-[#006747] text-white" : "bg-neutral-200 text-neutral-600"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    )
                  )}
                </div>
              </Link>

              {/* Sub-items */}
              {item.children && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    const ChildIcon = child.icon

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          childActive
                            ? 'bg-[#D1EFE4] text-[#006747]'
                            : 'text-neutral-600 hover:bg-[#D1EFE4] hover:text-[#006747]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <ChildIcon className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm">{child.name}</span>
                        </div>
                        {child.badge && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            childActive ? "bg-[#006747] text-white" : "bg-neutral-200 text-neutral-600"
                          }`}>
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-neutral-200">
        <div className="space-y-2">
          <Link
            href="/dashboard/help"
            className="flex items-center space-x-3 px-3 py-2 text-neutral-600 hover:bg-[#D1EFE4] hover:text-[#006747] rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5 text-neutral-400" />
            <span className="font-medium">Help & Support</span>
          </Link>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        {/* User Info */}
        <div className="mt-4 p-3 bg-[#D1EFE4]/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#006747] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-800 truncate">{session?.user?.name || 'User'}</div>
              <div className="text-xs text-neutral-500 truncate">{session?.user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
