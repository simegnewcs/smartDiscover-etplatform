'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Building2, Star, ShieldCheck, Clock, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalBusinesses: number
  totalReviews: number
  pendingVerification: number
  usersByRole: { USER?: number; BUSINESS_OWNER?: number; ADMIN?: number }
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[]
  recentBusinesses: { id: string; name: string; slug: string; verified: boolean; category?: string; city?: string; createdAt: string }[]
}

const roleColors: Record<string, string> = {
  USER: 'bg-blue-100 text-blue-700',
  BUSINESS_OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-green-100 text-green-700'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/users' },
    { label: 'Total Businesses', value: stats?.totalBusinesses ?? 0, icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/businesses' },
    { label: 'Total Reviews', value: stats?.totalReviews ?? 0, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/admin/reviews' },
    { label: 'Pending Verification', value: stats?.pendingVerification ?? 0, icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/admin/businesses?verified=false' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#16A34A]" />
          Admin Overview
        </h1>
        <p className="text-gray-500 mt-1">Manage users, businesses, and platform content</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="bg-white shadow-sm border-2 border-[#16A34A] rounded-xl p-5 hover:opacity-90 transition-opacity group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm border-2 border-[#16A34A] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Users by Role</h3>
          <div className="space-y-3">
            {[['USER', 'Regular Users'], ['BUSINESS_OWNER', 'Business Owners'], ['ADMIN', 'Admins']].map(([role, label]) => {
              const count = stats?.usersByRole[role as keyof typeof stats.usersByRole] ?? 0
              const pct = stats?.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0
              return (
                <div key={role}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[role]}`}>{role}</span>
                    <span className="text-gray-700 font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#16A34A]/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white shadow-sm border-2 border-[#16A34A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Recent Users</h3>
            <Link href="/admin/users" className="text-xs text-[#16A34A] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${roleColors[user.role]}`}>{user.role === 'BUSINESS_OWNER' ? 'BIZ' : user.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent businesses */}
        <div className="bg-white shadow-sm border-2 border-[#16A34A] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Recent Businesses</h3>
            <Link href="/admin/businesses" className="text-xs text-[#16A34A] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentBusinesses.map(biz => (
              <div key={biz.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{biz.name}</div>
                  <div className="text-xs text-gray-500">{biz.category} Â· {biz.city}</div>
                </div>
                {biz.verified
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

