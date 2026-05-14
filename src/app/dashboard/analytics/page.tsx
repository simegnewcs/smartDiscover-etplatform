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
  Tag
} from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/dashboard/analytics')
      const data = await res.json()

      if (data.success) {
        setOverview(data.data.overview)
        setRatingDistribution(data.data.ratingDistribution)
        setReviewTrend(data.data.reviewTrend)
        setBusinessPerformance(data.data.businessPerformance)
        setCategoryBreakdown(data.data.categoryBreakdown)
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
        <Loader2 className="w-8 h-8 animate-spin text-[#006747]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Analytics</h1>
        <p className="text-neutral-600 mt-1">Track how your businesses are performing</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#006747]" />
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
            <BarChart3 className="w-5 h-5 text-[#006747]" />
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
                        className="absolute bottom-0 w-full bg-[#006747] rounded-t-lg transition-all duration-500"
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
              <TrendingUp className="w-5 h-5 text-[#006747]" />
              Business Performance
            </h3>
            <p className="text-sm text-neutral-500">Ranked by average rating</p>
          </div>
          <Link
            href="/dashboard/listings"
            className="text-sm text-[#006747] hover:text-[#00523A] flex items-center gap-1"
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
                            className="font-medium text-neutral-800 hover:text-[#006747] transition-colors"
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
            <Tag className="w-5 h-5 text-[#006747]" />
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
