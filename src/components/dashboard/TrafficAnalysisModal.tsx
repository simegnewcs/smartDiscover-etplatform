'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  TrendingUp,
  Users,
  Eye,
  Clock,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  Smartphone,
  Laptop,
  Tablet,
  Calendar,
  Activity,
  ChevronRight,
  Sparkles,
  BarChart3,
  Building2,
  Compass,
  Phone,
  Navigation,
  PlusCircle,
  ShieldCheck
} from 'lucide-react'

interface BusinessItem {
  id: string
  name: string
  slug: string
  category: string
  city: string
  subcity: string
  monthlyVisitors: number
  dailyVisitors: number
  calls: number
  directions: number
  reviewsCount: number
}

interface TrafficData {
  scope: 'business' | 'platform'
  hasBusinesses?: boolean
  businessCount?: number
  ownerName?: string
  message?: string
  daily: {
    visitors: number
    pageViews: number
    calls?: number
    directions?: number
    change: string
    avgDuration: string
    bounceRate: string
    hourly: { hour: string; visitors: number; pageViews: number; calls?: number }[]
  }
  weekly: {
    visitors: number
    pageViews: number
    calls?: number
    directions?: number
    change: string
    avgDuration: string
    bounceRate: string
    days: { date: string; day: string; label: string; visitors: number; pageViews: number; calls?: number; directions?: number }[]
  }
  monthly: {
    visitors: number
    pageViews: number
    calls?: number
    directions?: number
    change: string
    avgDuration: string
    bounceRate: string
    weeks: { week: string; label: string; visitors: number; pageViews: number }[]
  }
  businesses?: BusinessItem[]
  topCities?: { name: string; visitors: number; percentage: number; color: string }[]
  topCategories?: { name: string; searches: number; percentage: number }[]
  devices?: { type: string; percentage: number; color: string }[]
  topPages?: { path: string; title: string; views: number }[]
}

interface TrafficAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  scope?: 'business' | 'platform'
}

export default function TrafficAnalysisModal({
  isOpen,
  onClose,
  scope = 'business'
}: TrafficAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | '7d' | 'monthly'>('daily')
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)

  const fetchTrafficData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch(`/api/dashboard/traffic?scope=${scope}`)
      const json = await res.json()
      if (json.success && json.data) {
        setTrafficData(json.data)
      } else if (json.success) {
        setTrafficData(json)
      }
    } catch (err) {
      console.error('Failed to load traffic data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchTrafficData()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, scope])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  const isBusinessMode = scope === 'business'

  // Current metrics based on tab
  const currentMetrics = trafficData
    ? activeTab === 'daily'
      ? trafficData.daily
      : activeTab === '7d'
      ? trafficData.weekly
      : trafficData.monthly
    : null

  // Chart items
  const chartItems = trafficData
    ? activeTab === 'daily'
      ? trafficData.daily?.hourly || []
      : activeTab === '7d'
      ? trafficData.weekly?.days || []
      : trafficData.monthly?.weeks || []
    : []

  const maxVisitorsInChart = Math.max(...chartItems.map((item: any) => item.visitors || 1), 1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] my-auto">
        
        {/* Header */}
        <div className={`px-6 py-5 sm:px-8 sm:py-6 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0 ${
          isBusinessMode
            ? 'bg-gradient-to-r from-[#003D2B] via-[#02593F] to-[#16A34A]'
            : 'bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900'
        }`}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              {isBusinessMode ? (
                <Building2 className="w-6 h-6 text-emerald-300" />
              ) : (
                <Activity className="w-6 h-6 text-emerald-300 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isBusinessMode ? 'My Business Traffic & Customers' : 'General Platform Site Traffic'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isBusinessMode ? 'Owner Listings Only' : 'Platform All Visitors'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-medium mt-0.5">
                {isBusinessMode
                  ? 'Showing visitor traffic, phone call inquiries, and directions for your business listings'
                  : 'Real-time site visitors, audience metrics, and discovery trends across all Ethiopia'}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => fetchTrafficData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-4 sm:px-8 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Every Day (Today)</span>
            </button>
            <button
              onClick={() => setActiveTab('7d')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === '7d'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7 Days (Weekly)</span>
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'monthly'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Monthly (30 Days)</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>Viewing:</span>
            <span className="font-bold text-slate-800">
              {isBusinessMode
                ? `Traffic for your ${trafficData?.businessCount || 0} business listings`
                : activeTab === 'daily' ? 'All Ethiopia 24 Hours' : activeTab === '7d' ? 'All Ethiopia Past 7 Days' : 'All Ethiopia 30 Days'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Calculating traffic metrics...</p>
            </div>
          ) : isBusinessMode && trafficData?.hasBusinesses === false ? (
            /* Empty State for Business Owner with 0 Businesses */
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Business Listings Found</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                You haven&apos;t added or claimed any business listings yet. To start seeing customer visits, telephone calls, and map navigation requests, add your business to HelloET!
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/listings/new"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Your Business for Free</span>
                </Link>
              </div>
            </div>
          ) : (trafficData && currentMetrics) ? (
            <>
              {/* 4 Core KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Visitors */}
                <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {isBusinessMode ? 'Your Listing Visitors' : activeTab === 'daily' ? 'Daily Visitors' : activeTab === '7d' ? '7D Visitors' : 'Monthly Visitors'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {currentMetrics.visitors.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{currentMetrics.change}</span>
                      <span className="text-slate-400 font-normal">vs prev period</span>
                    </div>
                  </div>
                </div>

                {/* 2. Page / Profile Views */}
                <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                      {isBusinessMode ? 'Profile Page Views' : 'Platform Page Views'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {currentMetrics.pageViews.toLocaleString()}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1">
                      ~{(currentMetrics.pageViews / Math.max(currentMetrics.visitors, 1)).toFixed(1)} views / visitor
                    </div>
                  </div>
                </div>

                {/* 3. Phone Calls Inquiries (or Avg Duration) */}
                <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      {isBusinessMode ? 'Phone Call Clicks' : 'Avg. Visit Time'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                      {isBusinessMode ? <Phone className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {isBusinessMode ? (currentMetrics.calls || 0).toLocaleString() : currentMetrics.avgDuration}
                    </div>
                    <div className="text-xs font-medium text-amber-700 mt-1">
                      {isBusinessMode ? 'Direct Customer Inquiries' : 'High User Engagement'}
                    </div>
                  </div>
                </div>

                {/* 4. Directions or Bounce Rate */}
                <div className="p-5 rounded-3xl bg-purple-50/80 border border-purple-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                      {isBusinessMode ? 'Map Directions' : 'Bounce Rate'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      {isBusinessMode ? <Navigation className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {isBusinessMode ? (currentMetrics.directions || 0).toLocaleString() : currentMetrics.bounceRate}
                    </div>
                    <div className="text-xs font-medium text-purple-700 mt-1">
                      {isBusinessMode ? 'In-Store Walk-in Intent' : 'Targeted Organic Traffic'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Chart */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {isBusinessMode
                        ? activeTab === 'daily'
                          ? 'Customer Visits to Your Businesses Today (Hourly)'
                          : activeTab === '7d'
                          ? 'Weekly Traffic to Your Businesses (Day by Day)'
                          : 'Monthly Customer Traffic to Your Places'
                        : activeTab === 'daily'
                        ? 'Today\'s 24-Hour Traffic Curve (Every Hour)'
                        : activeTab === '7d'
                        ? '7-Day Visitor Volume (Day by Day)'
                        : 'Monthly Visitor Trajectory (Past 4 Weeks)'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Hover over any bar to view exact visitor numbers
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Peak: ~{maxVisitorsInChart.toLocaleString()} visitors
                  </span>
                </div>

                {/* Bar Graph Visualizer */}
                <div className="h-56 flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-slate-200 relative">
                  {chartItems.map((item: any, idx: number) => {
                    const heightPercent = Math.max(Math.round((item.visitors / maxVisitorsInChart) * 100), 8)
                    const isHovered = hoveredBarIndex === idx
                    const label = item.hour || item.day || item.week

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Tooltip on Hover */}
                        {isHovered && (
                          <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xl pointer-events-none whitespace-nowrap animate-fade-in-up">
                            <div>{item.visitors.toLocaleString()} Visitors</div>
                            <div className="text-[10px] text-emerald-300 font-normal">
                              {item.label || item.hour || item.week}
                            </div>
                          </div>
                        )}

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isHovered
                              ? 'bg-emerald-500 shadow-lg scale-y-105'
                              : 'bg-emerald-600/80 hover:bg-emerald-600'
                          }`}
                        />
                        
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-2 truncate w-full text-center">
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Business Mode: Show Per-Business Traffic Breakdown */}
              {isBusinessMode && trafficData.businesses && trafficData.businesses.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        Traffic Breakdown by Your Business
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Customer activity for each of your registered places</p>
                    </div>
                    <Link
                      href="/dashboard/listings"
                      onClick={onClose}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Manage Listings</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {trafficData.businesses.map((biz) => (
                      <div key={biz.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-sm">{biz.name}</h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {biz.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{biz.subcity ? `${biz.subcity}, ${biz.city}` : biz.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-center px-3 py-1.5 rounded-xl bg-slate-50">
                            <span className="block text-slate-400 text-[10px] font-semibold">Today</span>
                            <span className="font-extrabold text-slate-800">{biz.dailyVisitors} views</span>
                          </div>
                          <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-50">
                            <span className="block text-emerald-700 text-[10px] font-semibold">Monthly</span>
                            <span className="font-extrabold text-emerald-800">{biz.monthlyVisitors} views</span>
                          </div>
                          <div className="text-center px-3 py-1.5 rounded-xl bg-amber-50">
                            <span className="block text-amber-700 text-[10px] font-semibold">Calls</span>
                            <span className="font-extrabold text-amber-800">{biz.calls}</span>
                          </div>
                          <div className="text-center px-3 py-1.5 rounded-xl bg-purple-50">
                            <span className="block text-purple-700 text-[10px] font-semibold">Directions</span>
                            <span className="font-extrabold text-purple-800">{biz.directions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Mode: Geographic & Audience Demographics */}
              {!isBusinessMode && trafficData.topCities && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Top Ethiopian Cities (6 Cols) */}
                  <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        Visitors by Ethiopian City
                      </h4>
                      <span className="text-xs text-slate-400 font-semibold">Geo-traffic</span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {trafficData.topCities.map((city) => (
                        <div key={city.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>{city.name}</span>
                            <span className="text-slate-500 font-medium">
                              {city.visitors.toLocaleString()} ({city.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${city.percentage}%`,
                                backgroundColor: city.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device & Category Breakdown (6 Cols) */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* Device Split */}
                    {trafficData.devices && (
                      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          Visitor Devices
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {trafficData.devices.map((device, i) => (
                            <div key={device.type} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                              {i === 0 ? (
                                <Smartphone className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                              ) : i === 1 ? (
                                <Laptop className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                              ) : (
                                <Tablet className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                              )}
                              <div className="text-lg font-black text-slate-900">{device.percentage}%</div>
                              <div className="text-[10px] font-bold text-slate-500 truncate">{device.type.split(' ')[0]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Searched Categories */}
                    {trafficData.topCategories && (
                      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Compass className="w-4 h-4 text-emerald-600" />
                          Top Searched Categories across Ethiopia
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {trafficData.topCategories.map((cat) => (
                            <div
                              key={cat.name}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5"
                            >
                              <span>{cat.name}</span>
                              <span className="text-emerald-600 font-black">({cat.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Platform Mode: Top Visited Pages */}
              {!isBusinessMode && trafficData.topPages && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Most Visited Pages & Discovery Directories
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {trafficData.topPages.map((page, idx) => (
                      <div key={page.path} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{page.title}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{page.path}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {page.views.toLocaleString()} views
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Unable to load traffic data. Please try again.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 sm:px-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            <span>Data synced with HelloET Analytics Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={isBusinessMode ? "/dashboard/analytics" : "/admin"}
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <span>{isBusinessMode ? 'Business Analytics' : 'Admin Overview'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
