'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Building2,
  Star,
  Tags,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Settings
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/businesses', label: 'Businesses', icon: Building2 },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EEF578] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#EEF578] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Super Admin</div>
              <div className="text-xs text-neutral-400">HelloET Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  active
                    ? 'bg-[#EEF578] text-neutral-900'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-neutral-800 space-y-1">
          <div className="px-3 py-2 rounded-lg bg-neutral-800">
            <div className="text-xs text-neutral-400">Signed in as</div>
            <div className="text-sm font-medium text-white truncate">{session.user.name}</div>
            <div className="text-xs text-[#EEF578] font-medium">SUPER ADMIN</div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            User Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-red-900/40 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen bg-neutral-950">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
