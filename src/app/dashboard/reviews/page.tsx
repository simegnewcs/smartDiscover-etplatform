'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  Search,
  Filter,
  Loader2,
  Building2,
  Calendar,
  User
} from 'lucide-react'

interface ReviewData {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user?: { id: string; name: string; email: string }
  business: { id: string; name: string; slug: string }
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: number[]
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const isBusinessOwner = session?.user?.role === 'BUSINESS_OWNER'

  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: [0, 0, 0, 0, 0]
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/dashboard/reviews')
      const data = await res.json()

      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' ||
      (review.comment && review.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.user?.name && review.user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)

    return matchesSearch && matchesRating
  })

  const maxDistribution = Math.max(...stats.ratingDistribution, 1)

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
        <h1 className="text-2xl font-bold text-neutral-800">
          {isBusinessOwner ? 'Customer Reviews' : 'My Reviews'}
        </h1>
        <p className="text-neutral-600 mt-1">
          {isBusinessOwner
            ? 'See what customers are saying about your businesses'
            : 'Your reviews across all businesses'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{stats.totalReviews}</div>
          <div className="text-sm text-neutral-600">Total Reviews</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{stats.averageRating.toFixed(1)}</div>
          <div className="text-sm text-neutral-600">Average Rating</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-2xl font-bold text-neutral-800">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
              />
            ))}
          </div>
          <div className="text-sm text-neutral-600">Star Rating</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.ratingDistribution[rating - 1]
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-neutral-700">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-600 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {filteredReviews.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D1EFE4] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#006747]" />
                    </div>
                    <div>
                      {isBusinessOwner && review.user ? (
                        <div className="font-medium text-neutral-800">{review.user.name}</div>
                      ) : (
                        <Link
                          href={`/business/${review.business.slug}`}
                          className="font-medium text-[#006747] hover:underline"
                        >
                          {review.business.name}
                        </Link>
                      )}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-neutral-700 mb-3 leading-relaxed">{review.comment}</p>
                )}

                {isBusinessOwner && (
                  <Link
                    href={`/business/${review.business.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#006747] transition-colors"
                  >
                    <Building2 className="w-3 h-3" />
                    {review.business.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No reviews found</h3>
            <p className="text-neutral-600">
              {searchTerm || filterRating !== 'all'
                ? 'Try adjusting your search or filters'
                : isBusinessOwner
                  ? 'Your businesses haven\'t received any reviews yet'
                  : 'You haven\'t written any reviews yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
