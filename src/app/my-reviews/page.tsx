'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Star,
  Loader2,
  ArrowLeft,
  Search,
  MapPin,
  ExternalLink,
  BarChart3,
  MessageSquare,
  SlidersHorizontal
} from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  business: {
    id: string
    name: string
    slug: string
    address: string | null
    imageUrl: string | null
    category: string | null
    city: string | null
  }
}

interface Stats {
  totalReviews: number
  avgRating: number
  ratingDistribution: { rating: number; count: number; percentage: number }[]
}

export default function MyReviewsPage() {
  const { status } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'rating-high' | 'rating-low'>('recent')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReviews()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/my-reviews')
      const data = await res.json()
      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = reviews
    .filter(r => {
      if (ratingFilter && r.rating !== ratingFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        r.business.name.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.business.category?.toLowerCase().includes(q) ||
        r.business.city?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'rating-high') return b.rating - a.rating
      if (sortBy === 'rating-low') return a.rating - b.rating
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-[#006747]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Sign in to see your reviews</h2>
          <p className="text-neutral-600 mb-6">View and manage all the reviews you have written</p>
          <Link
            href="/auth/login?callbackUrl=/my-reviews"
            className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#006747]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
              <Star className="w-6 h-6 text-[#006747]" />
              My Reviews
            </h1>
            <p className="text-neutral-600 mt-1">{stats?.totalReviews || 0} reviews written</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && stats.totalReviews > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-500">Total Reviews</div>
                  <div className="text-2xl font-bold text-neutral-800 mt-1">{stats.totalReviews}</div>
                </div>
                <div className="w-10 h-10 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#006747]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-500">Average Rating</div>
                  <div className="text-2xl font-bold text-neutral-800 mt-1 flex items-center gap-1">
                    {stats.avgRating}
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-neutral-500">Rating Distribution</div>
                <BarChart3 className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="space-y-1.5">
                {stats.ratingDistribution.map(d => (
                  <div key={d.rating} className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 w-3">{d.rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#006747] rounded-full transition-all"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-6 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={ratingFilter ?? ''}
              onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] appearance-none cursor-pointer text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-10 pr-8 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] appearance-none cursor-pointer text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-[#006747]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No reviews yet</h3>
            <p className="text-neutral-600 mb-6">Visit businesses and share your experience</p>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Businesses
            </Link>
          </div>
        )}

        {/* No filter results */}
        {reviews.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No reviews match your filters</p>
          </div>
        )}

        {/* Reviews List */}
        {filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Business Image */}
                  <div className="sm:w-48 h-32 sm:h-auto bg-neutral-100 flex-shrink-0">
                    {review.business.imageUrl ? (
                      <img
                        src={review.business.imageUrl}
                        alt={review.business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D1EFE4] to-[#EEF578]/30">
                        <Star className="w-8 h-8 text-[#006747]/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/business/${review.business.slug}`}>
                          <h3 className="font-semibold text-neutral-800 hover:text-[#006747] transition-colors">
                            {review.business.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {review.business.category && (
                            <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full text-neutral-600">
                              {review.business.category}
                            </span>
                          )}
                          {review.business.city && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <MapPin className="w-3 h-3" />
                              {review.business.city}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 flex-shrink-0">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
                        />
                      ))}
                      <span className="text-sm font-medium text-neutral-700 ml-1">{review.rating}.0</span>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{review.comment}</p>
                    )}

                    <Link
                      href={`/business/${review.business.slug}`}
                      className="inline-flex items-center gap-1 text-sm text-[#006747] hover:underline mt-3"
                    >
                      View Business <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
