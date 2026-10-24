'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TrafficAnalysisModal from '@/components/dashboard/TrafficAnalysisModal'
import {
  Users,
  Building2,
  Star,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Briefcase,
  Layers,
  ArrowUpRight,
  MapPin,
  Calendar,
  Sparkles,
  Activity,
  Globe2,
  Eye,
  Smartphone,
  Laptop,
  Tablet,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalBusinesses: number
  totalReviews: number
  pendingVerification: number
  usersByRole: { USER?: number; BUSINESS_OWNER?: number; ADMIN?: number }
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[]
  recentBusinesses: {
    id: string
    name: string
    slug: string
    verified: boolean
    category?: string
    city?: string
    createdAt: string
  }[]
}

const roleColors: Record<string, { bg: string; text: string }> = {
  USER: { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' },
  BUSINESS_OWNER: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  ADMIN: { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]' }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tableSearch, setTableSearch] = useState('')
  const [activePage, setActivePage] = useState(1)

  // General Platform Visitor Traffic States
  const [platformTraffic, setPlatformTraffic] = useState<any>(null)
  const [trafficTab, setTrafficTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isPlatformTrafficModalOpen, setIsPlatformTrafficModalOpen] = useState(false)
  const [trafficLoading, setTrafficLoading] = useState(true)
  const [trafficRefreshing, setTrafficRefreshing] = useState(false)

  const loadPlatformTraffic = (isRefresh = false) => {
    if (isRefresh) setTrafficRefreshing(true)
    else setTrafficLoading(true)

    fetch('/api/dashboard/traffic?scope=platform')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPlatformTraffic(d)
      })
      .catch((e) => console.error('Failed to load platform traffic:', e))
      .finally(() => {
        setTrafficLoading(false)
        setTrafficRefreshing(false)
      })
  }

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data)
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))

    loadPlatformTraffic(false)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#64748B]">Loading HelloET Dashboard...</p>
      </div>
    )
  }

  // Filtered recent businesses based on inline search
  const filteredBusinesses = (stats?.recentBusinesses || []).filter((b) =>
    tableSearch
      ? b.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        b.category?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        b.city?.toLowerCase().includes(tableSearch.toLowerCase())
      : true
  )

  // Top categories with HelloET brand color tokens
  const topCategories = [
    {
      id: '01',
      name: 'Hospitality, Hotels & Lodges',
      popularity: 82,
      sales: '45%',
      color: 'bg-[#16A34A]',
      border: 'border-[#16A34A] text-[#16A34A]',
      bg: 'bg-[#DCFCE7]'
    },
    {
      id: '02',
      name: 'Cafés & Ethiopian Cuisine',
      popularity: 68,
      sales: '29%',
      color: 'bg-[#F59E0B]',
      border: 'border-[#F59E0B] text-[#D97706]',
      bg: 'bg-[#FEF3C7]'
    },
    {
      id: '03',
      name: 'Health, Clinics & Wellness',
      popularity: 48,
      sales: '18%',
      color: 'bg-[#0284C7]',
      border: 'border-[#0284C7] text-[#0284C7]',
      bg: 'bg-[#E0F2FE]'
    },
    {
      id: '04',
      name: 'Tech Startups & ICT Hubs',
      popularity: 58,
      sales: '25%',
      color: 'bg-[#F43F5E]',
      border: 'border-[#F43F5E] text-[#E11D48]',
      bg: 'bg-[#FFE4E6]'
    }
  ]

  return (
    <div className="space-y-7 pb-12">
      {/* ======================================================== */}
      {/* 1. HERO CARD: "Today's Summary" (HelloET Brand Colors) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <span>Today&apos;s Summary</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                HELLOET
              </span>
            </h1>
            <p className="text-sm font-medium text-[#64748B] mt-0.5">
              Platform Activity & Ethiopian Directory Insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(stats, null, 2)
                )}`
                const downloadAnchor = document.createElement('a')
                downloadAnchor.setAttribute('href', jsonString)
                downloadAnchor.setAttribute('download', 'helloet_admin_stats.json')
                document.body.appendChild(downloadAnchor)
                downloadAnchor.click()
                downloadAnchor.remove()
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] hover:border-[#16A34A]/40 bg-white hover:bg-[#F0FDF4] text-xs font-bold text-[#0F172A] hover:text-[#16A34A] transition-all shadow-sm group"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#16A34A] transition-colors" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4 Pastel Stat Cards (HelloET Green, Gold, Rose, Sky) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: HelloET Mint / Brand Green (Total Users) */}
          <Link
            href="/admin/users"
            className="bg-[#DCFCE7] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.totalUsers ? (stats.totalUsers >= 1000 ? `${(stats.totalUsers / 1000).toFixed(1)}k` : stats.totalUsers) : 0}
              </div>
              <div className="text-sm font-bold text-[#14532D] mt-1">Total Users</div>
              <div className="text-xs font-bold text-[#15803D] mt-2 flex items-center gap-1">
                Last day +8%
              </div>
            </div>
          </Link>

          {/* Card 2: HelloET Golden Amber (Total Businesses) */}
          <Link
            href="/admin/businesses"
            className="bg-[#FEF3C7] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.totalBusinesses ?? 0}
              </div>
              <div className="text-sm font-bold text-[#78350F] mt-1">Total Businesses</div>
              <div className="text-xs font-bold text-[#D97706] mt-2 flex items-center gap-1">
                Last day +5%
              </div>
            </div>
          </Link>

          {/* Card 3: HelloET Warm Coral/Rose (Total Reviews) */}
          <Link
            href="/admin/reviews"
            className="bg-[#FFE4E6] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.totalReviews ?? 0}
              </div>
              <div className="text-sm font-bold text-[#881337] mt-1">Total Reviews</div>
              <div className="text-xs font-bold text-[#E11D48] mt-2 flex items-center gap-1">
                Last day +1.2%
              </div>
            </div>
          </Link>

          {/* Card 4: HelloET Sky Blue (Pending Verification) */}
          <Link
            href="/admin/businesses?verified=false"
            className="bg-[#E0F2FE] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.pendingVerification ?? 0}
              </div>
              <div className="text-sm font-bold text-[#075985] mt-1">Pending Approval</div>
              <div className="text-xs font-bold text-[#0284C7] mt-2 flex items-center gap-1">
                Action required
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. GENERAL PLATFORM VISITORS TRAFFIC (ETHIOPIA-WIDE) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
        {/* Top Header Row with Live Beacon and Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shadow-xs">
                <Globe2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                General Platform Visitors Traffic
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                Live Ethiopia-Wide
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#64748B]">
              Real-time platform visitors across Addis Ababa and 80+ cities. (Admin Scope: Nationwide Traffic)
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Daily, Weekly, Monthly Switcher */}
            <div className="bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0] flex items-center gap-1">
              <button
                onClick={() => setTrafficTab('daily')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trafficTab === 'daily'
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                Daily (24h)
              </button>
              <button
                onClick={() => setTrafficTab('weekly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trafficTab === 'weekly'
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTrafficTab('monthly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  trafficTab === 'monthly'
                    ? 'bg-[#16A34A] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                Monthly (30d)
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadPlatformTraffic(true)}
              disabled={trafficRefreshing}
              className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#16A34A] transition-colors"
              title="Refresh Platform Traffic"
            >
              <RefreshCw className={`w-4 h-4 ${trafficRefreshing ? 'animate-spin text-[#16A34A]' : ''}`} />
            </button>

            {/* Deep-dive Modal trigger */}
            <button
              onClick={() => setIsPlatformTrafficModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Quick KPI Cards for Current Timeframe */}
        {(() => {
          const metrics = platformTraffic?.[trafficTab] || {
            visitors: trafficLoading ? '...' : 0,
            pageViews: trafficLoading ? '...' : 0,
            change: '+0%',
            avgDuration: '0m',
            bounceRate: '0%'
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]/40 border border-[#DCFCE7] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#14532D]">General Site Visitors</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#16A34A] text-white">
                    {metrics.change}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {typeof metrics.visitors === 'number' ? metrics.visitors.toLocaleString() : metrics.visitors}
                </div>
                <div className="text-[11px] font-semibold text-[#15803D] mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trafficTab === 'daily' ? 'Unique visitors today' : trafficTab === 'weekly' ? 'Unique visitors last 7 days' : 'Unique visitors this month'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/50 border border-[#BAE6FD] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#075985]">Total Page Views</span>
                  <Eye className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {typeof metrics.pageViews === 'number' ? metrics.pageViews.toLocaleString() : metrics.pageViews}
                </div>
                <div className="text-[11px] font-semibold text-[#0369A1] mt-1">
                  Directory & listing searches
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]/50 border border-[#FDE68A] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#78350F]">Avg Session Time</span>
                  <Clock className="w-4 h-4 text-[#D97706]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.avgDuration}
                </div>
                <div className="text-[11px] font-semibold text-[#B45309] mt-1">
                  High platform engagement
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6]/50 border border-[#FECDD3] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#881337]">Bounce Rate</span>
                  <Activity className="w-4 h-4 text-[#E11D48]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.bounceRate}
                </div>
                <div className="text-[11px] font-semibold text-[#BE123C] mt-1">
                  Optimal discovery flow
                </div>
              </div>
            </div>
          )
        })()}

        {/* Visual Bar Breakdown & Cities / Pages Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Timeframe Visualizer (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#16A34A]" />
                {trafficTab === 'daily'
                  ? 'Today’s Hourly Site Visitors (24-Hour Timeline)'
                  : trafficTab === 'weekly'
                  ? '7-Day Platform Visitors Breakdown'
                  : '4-Week Monthly Visitors Trajectory'}
              </span>
              <span className="text-[11px] font-bold text-[#64748B]">All Ethiopian Cities</span>
            </div>

            {/* Dynamic Bars */}
            <div className="h-44 flex items-end justify-between gap-1 sm:gap-1.5 px-2 pt-6">
              {(() => {
                let items: any[] = []
                if (trafficTab === 'daily') {
                  items = (platformTraffic?.daily?.hourly || []).map((h: any) => ({
                    label: h.hour.split(':')[0],
                    visitors: h.visitors,
                    pageViews: h.pageViews,
                    fullLabel: h.hour
                  }))
                } else if (trafficTab === 'weekly') {
                  items = (platformTraffic?.weekly?.days || []).map((d: any) => ({
                    label: d.day,
                    visitors: d.visitors,
                    pageViews: d.pageViews,
                    fullLabel: `${d.label} (${d.visitors} visitors)`
                  }))
                } else {
                  items = (platformTraffic?.monthly?.weeks || []).map((w: any) => ({
                    label: w.week,
                    visitors: w.visitors,
                    pageViews: w.pageViews,
                    fullLabel: `${w.week} - ${w.label} (${w.visitors} visitors)`
                  }))
                }

                const maxVisitors = Math.max(...items.map((i: any) => i.visitors || 0), 1)

                return items.map((item: any, idx: number) => {
                  const heightPercent = Math.max(12, Math.round((item.visitors / maxVisitors) * 100))
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1.5 group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-[#0F172A] text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-md">
                        {item.fullLabel}: {item.visitors} visitors ({item.pageViews} views)
                      </div>

                      <div
                        className="w-full bg-[#16A34A] hover:bg-[#15803D] rounded-t-md transition-all duration-300 group-hover:brightness-110"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] sm:text-[10px] font-semibold text-[#94A3B8] truncate max-w-[2.5rem]">
                        {item.label}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" />
                Live Visitors across platform
              </span>
              <span className="text-[#16A34A] font-bold">Auto-refreshed</span>
            </div>
          </div>

          {/* Top Cities & Top Pages (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Top Cities Mini Card */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                  Top Ethiopian Cities Traffic
                </span>
                <span className="text-[10px] font-bold text-[#64748B]">Share</span>
              </div>
              <div className="space-y-2">
                {(platformTraffic?.topCities || [
                  { name: 'Addis Ababa', percentage: 65, color: '#16A34A' },
                  { name: 'Hawassa', percentage: 11, color: '#0284C7' },
                  { name: 'Bahir Dar', percentage: 9, color: '#F59E0B' },
                  { name: 'Dire Dawa', percentage: 6, color: '#8B5CF6' }
                ]).slice(0, 4).map((city: any) => (
                  <div key={city.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#0F172A]">{city.name}</span>
                      <span className="text-[#64748B]">{city.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${city.percentage}%`, backgroundColor: city.color || '#16A34A' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices & Top Page Link */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#0284C7]" />
                  78% Mobile · 20% Desktop
                </span>
                <p className="text-[11px] font-medium text-[#64748B]">
                  Most visited: <span className="text-[#0F172A] font-bold">/businesses & /city/addis-ababa</span>
                </p>
              </div>
              <button
                onClick={() => setIsPlatformTrafficModalOpen(true)}
                className="text-xs font-extrabold text-[#16A34A] hover:underline flex items-center gap-1 flex-shrink-0"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CHARTS ROW 1: Visitor Insights (Line) & Total Revenue (Bar) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Visitor Insights (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Visitor & Listing Growth</h3>
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 rounded-xl">
              2026 Year
            </span>
          </div>

          {/* SVG Multi-curve Spline Wave Chart (HelloET Brand Colors: Green, Gold, Sky) */}
          <div className="relative w-full h-64 my-2">
            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              {/* Y Grid lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="180" x2="580" y2="180" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="15" y="35" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">400</text>
              <text x="15" y="85" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">300</text>
              <text x="15" y="135" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">200</text>
              <text x="15" y="185" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">100</text>
              <text x="25" y="225" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">0</text>

              {/* Curve 1: Loyal Users (HelloET Brand Green #16A34A) */}
              <path
                d="M 50 110 C 90 90, 130 130, 180 150 C 230 170, 280 100, 330 90 C 380 80, 430 95, 480 85 C 530 75, 560 130, 580 145"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Curve 2: New Businesses (HelloET Golden Amber #F59E0B) */}
              <path
                d="M 50 140 C 90 150, 130 160, 180 120 C 230 80, 280 70, 330 65 C 380 60, 430 90, 480 100 C 530 110, 560 135, 580 150"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Curve 3: Unique Visitors (HelloET Sky Blue #0284C7) */}
              <path
                d="M 50 95 C 90 80, 130 95, 180 135 C 230 175, 280 110, 330 95 C 380 80, 430 85, 480 80 C 530 75, 560 110, 580 125"
                fill="none"
                stroke="#0284C7"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* X Axis Months */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                <text
                  key={m}
                  x={50 + i * 48}
                  y="225"
                  fill="#94A3B8"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {m}
                </text>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-[#F8FAFC] text-xs font-bold text-[#0F172A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" />
              <span>Loyal Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
              <span>New Businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0284C7]" />
              <span>Unique Visitors</span>
            </div>
          </div>
        </div>

        {/* Total Revenue & Directory Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Weekly Activity</h3>
            <span className="text-xs font-bold text-[#64748B]">Sessions</span>
          </div>

          {/* Grouped Dual Bar Chart (HelloET Green & Golden Yellow) */}
          <div className="relative w-full h-64 my-2 flex items-end justify-between px-2 pt-6">
            {[
              { day: 'Monday', online: 75, offline: 65 },
              { day: 'Tuesday', online: 85, offline: 95 },
              { day: 'Wednesday', online: 55, offline: 80 },
              { day: 'Thursday', online: 90, offline: 70 },
              { day: 'Friday', online: 85, offline: 95 },
              { day: 'Saturday', online: 92, offline: 60 },
              { day: 'Sunday', online: 98, offline: 88 }
            ].map((col) => (
              <div key={col.day} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="flex items-end gap-1.5 h-44 w-full justify-center">
                  {/* HelloET Green (Online) */}
                  <div
                    className="w-2.5 sm:w-3.5 bg-[#16A34A] rounded-t-md transition-all group-hover:brightness-110"
                    style={{ height: `${col.online}%` }}
                    title={`Online Searches: ${col.online}%`}
                  />
                  {/* HelloET Golden Yellow (Directory Enquiries) */}
                  <div
                    className="w-2.5 sm:w-3.5 bg-[#FBBF24] rounded-t-md transition-all group-hover:brightness-110"
                    style={{ height: `${col.offline}%` }}
                    title={`Directory Calls: ${col.offline}%`}
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] truncate max-w-[3rem]">
                  {col.day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#F8FAFC] text-xs font-bold text-[#0F172A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span>Online Searches</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
              <span>Direct Enquiries</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CHARTS ROW 2: Customer Satisfaction & Target vs Reality */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Customer Satisfaction (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Community Satisfaction</h3>
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
              +14% Growth
            </span>
          </div>

          {/* Gradient Area Wave SVG (HelloET Green Gradient) */}
          <div className="relative w-full h-52 my-3">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="helloetGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d="M 20 120 C 100 120, 160 110, 220 90 C 280 70, 340 30, 420 30 C 460 30, 480 40, 480 40 L 480 180 L 20 180 Z"
                fill="url(#helloetGreenGrad)"
              />

              {/* Wave stroke top (This Month) */}
              <path
                d="M 20 120 C 100 120, 160 110, 220 90 C 280 70, 340 30, 420 30 C 460 30, 480 40, 480 40"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="100" cy="120" r="4.5" fill="#16A34A" />
              <circle cx="220" cy="90" r="4.5" fill="#16A34A" />
              <circle cx="340" cy="40" r="4.5" fill="#16A34A" />
              <circle cx="420" cy="30" r="4.5" fill="#16A34A" />

              {/* Baseline (Last Month) */}
              <path
                d="M 20 140 C 100 140, 160 150, 220 145 C 280 140, 340 155, 420 135 C 460 135, 480 138, 480 138"
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="220" cy="145" r="3.5" fill="#0284C7" />
              <circle cx="420" cy="135" r="3.5" fill="#0284C7" />
            </svg>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#0284C7]" />
              <div>
                <div className="text-xs font-semibold text-[#64748B]">Last Month</div>
                <div className="text-base font-extrabold text-[#0F172A]">$1,017</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
              <div>
                <div className="text-xs font-semibold text-[#64748B]">This Month</div>
                <div className="text-base font-extrabold text-[#0F172A]">$1,757</div>
              </div>
            </div>
          </div>
        </div>

        {/* Target vs Reality (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Target vs Reality</h3>
            <span className="text-xs font-bold text-[#64748B]">Monthly Goals</span>
          </div>

          {/* Paired Vertical Bars (HelloET Green vs Gold) */}
          <div className="relative w-full h-52 my-3 flex items-end justify-between px-2">
            {[
              { m: 'Jan', reality: 50, target: 65 },
              { m: 'Feb', reality: 70, target: 55 },
              { m: 'Mar', reality: 65, target: 60 },
              { m: 'Apr', reality: 80, target: 75 },
              { m: 'May', reality: 75, target: 90 },
              { m: 'June', reality: 85, target: 90 },
              { m: 'July', reality: 80, target: 92 }
            ].map((col) => (
              <div key={col.m} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-end gap-1.5 h-36 w-full justify-center">
                  {/* HelloET Green (Reality) */}
                  <div
                    className="w-2.5 sm:w-3.5 bg-[#16A34A] rounded-t-md"
                    style={{ height: `${col.reality}%` }}
                    title={`Verified Listings: ${col.reality}%`}
                  />
                  {/* HelloET Golden Yellow (Target) */}
                  <div
                    className="w-2.5 sm:w-3.5 bg-[#FBBF24] rounded-t-md"
                    style={{ height: `${col.target}%` }}
                    title={`Target: ${col.target}%`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#64748B]">{col.m}</span>
              </div>
            ))}
          </div>

          {/* Metrics Footer */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#64748B]">Verified Listings</div>
                <div className="text-base font-extrabold text-[#0F172A]">8,823</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#64748B]">Directory Target</div>
                <div className="text-base font-extrabold text-[#0F172A]">12,122</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TOP PRODUCTS & CATEGORIES */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-[#0F172A]">Top Categories & Sectors</h3>
          <Link
            href="/admin/categories"
            className="text-xs font-extrabold text-[#16A34A] hover:underline flex items-center gap-1"
          >
            <span>Manage All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8] pb-3">
                <th className="pb-3 font-semibold">#</th>
                <th className="pb-3 font-semibold">Sector Name</th>
                <th className="pb-3 font-semibold">Directory Popularity</th>
                <th className="pb-3 font-semibold text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {topCategories.map((item) => (
                <tr key={item.id} className="text-sm font-semibold hover:bg-[#F8FAFC]/70 transition-colors">
                  <td className="py-4 text-[#64748B] font-mono">{item.id}</td>
                  <td className="py-4 text-[#0F172A] font-extrabold">{item.name}</td>
                  <td className="py-4 w-1/2 pr-6">
                    <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.popularity}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold border ${item.border} ${item.bg}`}
                    >
                      {item.sales}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SALES MAPPING & VOLUME VS SERVICE */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Sales Mapping by Region / City (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Regional Activity Mapping</h3>
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
              Ethiopian Hubs
            </span>
          </div>

          {/* Regional Visual Representation */}
          <div className="py-4 space-y-4">
            {[
              { city: 'Addis Ababa', share: '58%', count: '412 Businesses', color: 'bg-[#16A34A]' },
              { city: 'Hawassa', share: '18%', count: '124 Businesses', color: 'bg-[#F59E0B]' },
              { city: 'Dire Dawa', share: '12%', count: '89 Businesses', color: 'bg-[#0284C7]' },
              { city: 'Bahir Dar', share: '8%', count: '56 Businesses', color: 'bg-[#10B981]' },
              { city: 'Other Cities', share: '4%', count: '30 Businesses', color: 'bg-[#F43F5E]' }
            ].map((reg) => (
              <div key={reg.city} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0F172A] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                    {reg.city}
                  </span>
                  <span className="text-[#64748B] font-medium">{reg.count} ({reg.share})</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${reg.color} rounded-full`} style={{ width: reg.share }} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#64748B] font-semibold pt-3 border-t border-[#F8FAFC] flex items-center justify-between">
            <span>Primary Focus: Major Ethiopian Commercial Hubs</span>
            <span className="text-[#16A34A] font-extrabold">Live Sync</span>
          </div>
        </div>

        {/* Volume vs Service (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Volume vs Service</h3>
            <span className="text-xs font-bold text-[#64748B]">Platform Queries</span>
          </div>

          {/* Stacked Vertical Bar Chart */}
          <div className="relative w-full h-52 my-3 flex items-end justify-between px-3">
            {[60, 50, 45, 65, 75, 70, 85].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-3.5 sm:w-4.5 bg-[#F1F5F9] rounded-full h-36 flex flex-col justify-end overflow-hidden">
                  {/* Top gold bar (Volume) */}
                  <div
                    className="w-full bg-[#FBBF24]"
                    style={{ height: `${val * 0.4}%` }}
                  />
                  {/* Bottom green bar (Service) */}
                  <div
                    className="w-full bg-[#16A34A]"
                    style={{ height: `${val * 0.6}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#64748B]">{`P${idx + 1}`}</span>
              </div>
            ))}
          </div>

          {/* Metrics with Counters */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#FBBF24]" />
              <div>
                <div className="text-xs font-semibold text-[#64748B]">Directory Volume</div>
                <div className="text-base font-extrabold text-[#0F172A]">1,128</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
              <div>
                <div className="text-xs font-semibold text-[#64748B]">Verified Services</div>
                <div className="text-base font-extrabold text-[#0F172A]">1,719</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. BUSINESS PERFORMANCE (Businesses Table with Search) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-extrabold text-[#0F172A]">Platform Businesses</h3>
          
          {/* Pill Search in Card Header */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-[#F1F5F9] focus:bg-white text-xs font-semibold text-[#0F172A] placeholder-[#94A3B8] pl-10 pr-4 py-2 rounded-2xl border border-[#E2E8F0] focus:border-[#16A34A]/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8] pb-3">
                <th className="pb-3 font-semibold">Business</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Registered</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((biz) => {
                  return (
                    <tr key={biz.id} className="text-sm font-semibold hover:bg-[#F8FAFC]/70 transition-colors">
                      {/* Business Name with Logo Avatar */}
                      <td className="py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0">
                            {biz.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#0F172A] text-xs">{biz.name}</div>
                            <div className="text-[11px] font-medium text-[#64748B]">
                              {biz.city || 'Addis Ababa, Ethiopia'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4">
                        <span className="text-xs font-bold text-[#0F172A] block truncate max-w-[14rem]">
                          {biz.category || 'General Directory'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4">
                        {biz.verified ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/30">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 font-semibold text-[#64748B] text-xs">
                        {new Date(biz.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="py-4 text-right">
                        <Link
                          href={`/admin/businesses`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#16A34A] text-[#64748B] hover:text-white text-xs font-bold transition-colors"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-[#64748B]">
                    No businesses matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-[#F8FAFC] text-xs font-semibold text-[#64748B]">
          <span>
            Showing 1-{filteredBusinesses.length} of {stats?.totalBusinesses ?? 0}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              className="w-8 h-8 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setActivePage(p)}
                className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-colors ${
                  activePage === p
                    ? 'bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/20'
                    : 'border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setActivePage(activePage + 1)}
              className="w-8 h-8 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. USER MANAGEMENT & ROLE BREAKDOWN */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Role breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Users by Role</h3>
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
              {stats?.totalUsers ?? 0} Members
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {[
              ['USER', 'Regular Users'],
              ['BUSINESS_OWNER', 'Business Owners'],
              ['ADMIN', 'Admins']
            ].map(([role, label]) => {
              const count = stats?.usersByRole[role as keyof typeof stats.usersByRole] ?? 0
              const pct = stats?.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0
              const colorConfig = roleColors[role] || { bg: 'bg-gray-100', text: 'text-gray-700' }

              return (
                <div key={role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`px-2.5 py-1 rounded-xl font-bold ${colorConfig.bg} ${colorConfig.text}`}>
                      {label}
                    </span>
                    <span className="text-[#0F172A] font-extrabold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#16A34A] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Registered Users (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Recent Registered Users</h3>
            <Link
              href="/admin/users"
              className="text-xs font-extrabold text-[#16A34A] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#F8FAFC]">
            {stats?.recentUsers.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-[#DCFCE7]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#0F172A] truncate">{user.name}</div>
                    <div className="text-[11px] font-medium text-[#64748B] truncate">{user.email}</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                    roleColors[user.role]?.bg || 'bg-gray-100'
                  } ${roleColors[user.role]?.text || 'text-gray-700'}`}
                >
                  {user.role === 'BUSINESS_OWNER' ? 'OWNER' : user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 8. HELLOET FOOTER */}
      {/* ======================================================== */}
      <div className="pt-6 text-center text-xs font-semibold text-[#64748B]">
        <span>Made with </span>
        <span className="text-[#EF4444]">❤️</span>
        <span> for HelloET Platform · Ethiopia&apos;s Business Discovery Directory</span>
      </div>

      {/* In-Depth General Platform Traffic Analytics Modal */}
      <TrafficAnalysisModal
        isOpen={isPlatformTrafficModalOpen}
        onClose={() => setIsPlatformTrafficModalOpen(false)}
        scope="platform"
      />
    </div>
  )
}
