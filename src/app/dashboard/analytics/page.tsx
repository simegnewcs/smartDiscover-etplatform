'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Star,
  TrendingUp,
  Building2,
  MessageSquare,
  BarChart3,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  MapPin,
  Tag,
  Activity,
  Users,
  Eye,
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react'
import TrafficAnalysisModal from '@/components/dashboard/TrafficAnalysisModal'

interface OverviewStats {
  totalBusinesses: number
  totalReviews: number
  averageRating: number
  verifiedCount: number
}

interface ReviewTrendItem {
  month: string
  label: string
  reviews: number
  avgRating: number
}

interface BusinessPerformance {
  id: string
  name: string
  slug: string
  category: string
  city: string
  image: string | null
  rating: number
  reviewCount: number
  verified: boolean
}

interface CategoryBreakdown {
  name: string
  businessCount: number
  totalReviews: number
  avgRating: number
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewStats>({
    totalBusinesses: 0,
    totalReviews: 0,
    averageRating: 0,
    verifiedCount: 0
  })
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0])
  const [reviewTrend, setReviewTrend] = useState<ReviewTrendItem[]>([])
  const [businessPerformance, setBusinessPerformance] = useState<BusinessPerformance[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [trafficData, setTrafficData] = useState<any>(null)
  const [trafficTab, setTrafficTab] = useState<'daily' | '7d' | 'monthly'>('7d')
  const [isTrafficModalOpen, setIsTrafficModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [resAnalytics, resTraffic] = await Promise.all([
        fetch('/api/dashboard/analytics'),
        fetch('/api/dashboard/traffic?scope=business')
      ])
      
      const data = await resAnalytics.json()
      if (data.success) {
        setOverview(data.data.overview)
        setRatingDistribution(data.data.ratingDistribution)
        setReviewTrend(data.data.reviewTrend)
        setBusinessPerformance(data.data.businessPerformance)
        setCategoryBreakdown(data.data.categoryBreakdown)
      }

      const trafficJson = await resTraffic.json()
      if (trafficJson.success && trafficJson.data) {
        setTrafficData(trafficJson.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxTrendReviews = Math.max(...reviewTrend.map(t => t.reviews), 1)
  const maxDistribution = Math.max(...ratingDistribution, 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
      </div>
    )
  }

  const currentTraffic = trafficData
    ? trafficTab === 'daily'
      ? trafficData.daily
      : trafficTab === '7d'
      ? trafficData.weekly
      : trafficData.monthly
    : null

  const chartItems = trafficData
    ? trafficTab === 'daily'
      ? trafficData.daily.hourly
      : trafficTab === '7d'
      ? trafficData.weekly.days
      : trafficData.monthly.weeks
    : []

  const maxChartVisitors = Math.max(...chartItems.map((item: any) => item.visitors || 1), 1)

  return (
    <div className="space-y-7">
      {/* Header with Traffic Launch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>My Business Traffic &amp; Analytics</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Owner Scope
            </span>
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Monitor real-time visitors, phone calls, and directions for your business listings
          </p>
        </div>

        <button
          onClick={() => setIsTrafficModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs self-start sm:self-auto"
        >
          <Activity className="w-4 h-4 text-emerald-200" />
          <span>Open My Business Traffic</span>
        </button>
      </div>

      {/* NEW: Platform Traffic Overview Card (Daily, 7D, Monthly) */}
      {currentTraffic && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Site Visitor Traffic</span>
              </div>
              <h2 className="text-lg font-extrabold text-neutral-900">
                Audience &amp; Traffic Volume
              </h2>
            </div>

            {/* Timeframe Switcher Tabs */}
            <div className="inline-flex p-1 bg-neutral-100 rounded-2xl self-start sm:self-auto">
              <button
                onClick={() => setTrafficTab('daily')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  trafficTab === 'daily'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Every Day</span>
              </button>
              <button
                onClick={() => setTrafficTab('7d')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  trafficTab === '7d'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>7 Days (7D)</span>
              </button>
              <button
                onClick={() => setTrafficTab('monthly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  trafficTab === 'monthly'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Monthly (30D)</span>
              </button>
            </div>
          </div>

          {/* 3 KPI Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {trafficTab === 'daily' ? 'Today\'s Visitors' : trafficTab === '7d' ? '7-Day Visitors' : 'Monthly Visitors'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                {currentTraffic.visitors.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{currentTraffic.change}</span>
                <span className="text-neutral-400 font-normal">vs prev period</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Total Page Views
              </span>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                {currentTraffic.pageViews.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                ~{(currentTraffic.pageViews / Math.max(currentTraffic.visitors, 1)).toFixed(1)} pages per session
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Avg. Session Time
              </span>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
                {currentTraffic.avgDuration}
              </div>
              <div className="text-xs text-purple-700 font-medium mt-1">
                Bounce rate: {currentTraffic.bounceRate}
              </div>
            </div>
          </div>

          {/* Mini Interactive Visitor Bar Chart */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-600 mb-3">
              <span>Visitor Distribution ({trafficTab === 'daily' ? 'Hourly' : trafficTab === '7d' ? 'Day by Day' : 'Weekly'})</span>
              <span className="text-emerald-700">Peak: {maxChartVisitors.toLocaleString()} visitors</span>
            </div>
            <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-4 pb-2 border-b border-neutral-100">
              {chartItems.map((item: any, i: number) => {
                const heightPercent = Math.max(Math.round((item.visitors / maxChartVisitors) * 100), 10)
                const label = item.hour || item.day || item.week
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                      {item.visitors.toLocaleString()}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#16A34A]/80 hover:bg-[#16A34A] rounded-t-lg transition-all"
                    />
                    <span className="text-[10px] text-neutral-400 font-medium mt-1 truncate w-full text-center">
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Traffic Analysis Modal Instance - Business Owner Scope */}
      <TrafficAnalysisModal
        isOpen={isTrafficModalOpen}
        onClose={() => setIsTrafficModalOpen(false)}
        scope="business"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#16A34A]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{overview.totalBusinesses}</div>
          <div className="text-sm text-neutral-600">Total Businesses</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{overview.totalReviews}</div>
          <div className="text-sm text-neutral-600">Total Reviews</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{overview.averageRating.toFixed(1)}</div>
          <div className="text-sm text-neutral-600">Average Rating</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{overview.verifiedCount}</div>
          <div className="text-sm text-neutral-600">Verified Listings</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Trend (Last 6 Months) */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#16A34A]" />
            Reviews Over Time
          </h3>
          <p className="text-sm text-neutral-500 mb-6">Last 6 months</p>

          {reviewTrend.length > 0 ? (
            <div className="space-y-0">
              <div className="flex items-end gap-2 h-48">
                {reviewTrend.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-neutral-700">{item.reviews}</span>
                    <div className="w-full bg-neutral-100 rounded-t-lg relative" style={{ height: '100%' }}>
                      <div
                        className="absolute bottom-0 w-full bg-[#16A34A] rounded-t-lg transition-all duration-500"
                        style={{ height: `${(item.reviews / maxTrendReviews) * 100}%`, minHeight: item.reviews > 0 ? '8px' : '0px' }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Total in period:</span>
                  <span className="font-semibold text-neutral-800">
                    {reviewTrend.reduce((sum, t) => sum + t.reviews, 0)} reviews
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-neutral-400">
              No data available
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rating Distribution
          </h3>
          <p className="text-sm text-neutral-500 mb-6">Across all businesses</p>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating - 1]
              const percentage = overview.totalReviews > 0 ? (count / overview.totalReviews) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16 flex-shrink-0">
                    <span className="text-sm font-semibold text-neutral-700">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: rating >= 4 ? '#22c55e' : rating === 3 ? '#eab308' : '#ef4444'
                      }}
                    />
                  </div>
                  <div className="w-20 text-right flex-shrink-0">
                    <span className="text-sm font-medium text-neutral-700">{count}</span>
                    <span className="text-xs text-neutral-400 ml-1">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Business Performance */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#16A34A]" />
              Business Performance
            </h3>
            <p className="text-sm text-neutral-500">Ranked by average rating</p>
          </div>
          <Link
            href="/dashboard/listings"
            className="text-sm text-[#16A34A] hover:text-[#166534] flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {businessPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-3 pr-4">#</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-3 pr-4">Business</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-3 pr-4">Category</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-3 pr-4">Location</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-3 pr-4">Rating</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-3">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {businessPerformance.map((biz, index) => (
                  <tr key={biz.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 pr-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-neutral-200 text-neutral-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                          {biz.image ? (
                            <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/business/${biz.slug}`}
                            className="font-medium text-neutral-800 hover:text-[#16A34A] transition-colors"
                          >
                            {biz.name}
                          </Link>
                          {biz.verified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Verified</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                        <Tag className="w-3 h-3" />
                        {biz.category}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                        <MapPin className="w-3 h-3" />
                        {biz.city}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-neutral-800">{biz.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-neutral-700">{biz.reviewCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No businesses to analyze yet</p>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#16A34A]" />
            Category Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <h4 className="font-semibold text-neutral-800 mb-2">{cat.name}</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Businesses</span>
                    <span className="font-medium text-neutral-700">{cat.businessCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Reviews</span>
                    <span className="font-medium text-neutral-700">{cat.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Avg Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-neutral-700">{cat.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
