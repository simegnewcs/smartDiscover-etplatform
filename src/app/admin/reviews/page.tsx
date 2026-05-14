'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, Search, Trash2, Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  business: { id: string; name: string; slug: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (ratingFilter) params.set('rating', ratingFilter)
      const res = await fetch(`/api/admin/reviews?${params}`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.data.reviews)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [page, ratingFilter])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchReviews() }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setReviews(prev => prev.filter(r => r.id !== id))
        setTotal(t => t - 1)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-700'}`} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-[#EEF578]" /> Reviews
        </h1>
        <p className="text-neutral-400 mt-1">{total} total reviews</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by comment, business, or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#EEF578]/50 text-sm"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={e => { setRatingFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 text-sm"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={String(r)}>{r} Stars</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">Business</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">Rating</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium hidden lg:table-cell">Comment</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-neutral-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {reviews.map(review => (
                  <tr key={review.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{review.business.name}</span>
                        <Link href={`/business/${review.business.slug}`} target="_blank" className="text-neutral-500 hover:text-[#EEF578]">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white">{review.user.name}</div>
                      <div className="text-xs text-neutral-500">{review.user.email}</div>
                    </td>
                    <td className="px-5 py-3.5">{renderStars(review.rating)}</td>
                    <td className="px-5 py-3.5 text-neutral-400 hidden lg:table-cell max-w-xs">
                      <span className="line-clamp-1">{review.comment || <span className="text-neutral-600 italic">No comment</span>}</span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 hidden md:table-cell">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
                      >
                        {deletingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
