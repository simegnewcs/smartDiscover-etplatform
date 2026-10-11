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

  useEffect(() => {
    fetchReviews()
  }, [page, ratingFilter])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchReviews()
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
        setTotal((t) => t - 1)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
          <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" /> Platform Reviews
        </h1>
        <p className="text-sm font-medium text-[#64748B] mt-0.5">
          {total} ratings & community feedback entries on HelloET
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by review comment, business name, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white shadow-sm border border-[#E2E8F0] focus:border-[#16A34A]/40 focus:ring-4 focus:ring-[#16A34A]/10 rounded-2xl text-[#0F172A] placeholder-[#94A3B8] text-xs font-semibold outline-none transition-all"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 bg-white shadow-sm border border-[#E2E8F0] focus:border-[#16A34A]/40 focus:ring-4 focus:ring-[#16A34A]/10 rounded-2xl text-[#0F172A] text-xs font-bold outline-none cursor-pointer"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={String(r)}>
              {r} Stars
            </option>
          ))}
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
            <span className="text-xs font-semibold text-[#64748B]">Loading reviews...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8]">
                  <th className="px-6 py-4 font-semibold">Business</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                  <th className="px-6 py-4 font-semibold hidden lg:table-cell">Comment</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#0F172A] text-xs">
                          {review.business.name}
                        </span>
                        <Link
                          href={`/businesses/${review.business.slug}`}
                          target="_blank"
                          className="text-[#64748B] hover:text-[#16A34A]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-extrabold text-[#0F172A]">{review.user.name}</div>
                      <div className="text-[11px] font-medium text-[#64748B]">{review.user.email}</div>
                    </td>
                    <td className="px-6 py-4">{renderStars(review.rating)}</td>
                    <td className="px-6 py-4 text-xs font-medium text-[#64748B] hidden lg:table-cell max-w-xs">
                      <span className="line-clamp-2">
                        {review.comment || <span className="text-gray-300 italic">No comment</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-medium text-[#64748B] hidden md:table-cell">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="p-2 rounded-xl text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                        title="Delete review"
                      >
                        {deletingId === review.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F8FAFC] text-xs font-semibold text-[#64748B]">
            <span>
              Page {page} of {totalPages} ({total} Total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
