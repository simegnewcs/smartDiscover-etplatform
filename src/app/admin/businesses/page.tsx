'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Clock,
  Edit,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string
  verified: boolean
  category?: string
  city?: string
  phone?: string
  email?: string
  reviewCount: number
  createdAt: string
  owner: { id: string; name: string; email: string } | null
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (verifiedFilter) params.set('verified', verifiedFilter)
      const res = await fetch(`/api/admin/businesses?${params}`)
      const data = await res.json()
      if (data.success) {
        setBusinesses(data.data.businesses)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [page, verifiedFilter])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchBusinesses()
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleToggleVerify = async (id: string, current: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !current })
      })
      const data = await res.json()
      if (data.success) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === id ? { ...b, verified: !current } : b))
        )
      }
    } finally {
      setTogglingId(null)
    }
  }

  const openDeleteModal = (biz: Business) => {
    setBusinessToDelete(biz)
    setDeleteError(null)
  }

  const closeDeleteModal = () => {
    if (isDeleting) return
    setBusinessToDelete(null)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!businessToDelete) return
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/admin/businesses/${businessToDelete.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        const deletedName = businessToDelete.name
        setBusinesses((prev) => prev.filter((b) => b.id !== businessToDelete.id))
        setTotal((prev) => Math.max(0, prev - 1))
        setBusinessToDelete(null)
        setSuccessBanner(`"${deletedName}" was successfully deleted.`)
        setTimeout(() => setSuccessBanner(null), 4000)
      } else {
        setDeleteError(data.error || data.message || 'Failed to delete business. Please try again.')
      }
    } catch (err) {
      setDeleteError('Network error while deleting business. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#16A34A]" /> Platform Businesses
          </h1>
          <p className="text-sm font-medium text-[#64748B] mt-0.5">
            {total} businesses listed across HelloET directory
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Business
        </Link>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search businesses by name, category, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white shadow-sm border border-[#E2E8F0] focus:border-[#16A34A]/40 focus:ring-4 focus:ring-[#16A34A]/10 rounded-2xl text-[#0F172A] placeholder-[#94A3B8] text-xs font-semibold outline-none transition-all"
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={(e) => {
            setVerifiedFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 bg-white shadow-sm border border-[#E2E8F0] focus:border-[#16A34A]/40 focus:ring-4 focus:ring-[#16A34A]/10 rounded-2xl text-[#0F172A] text-xs font-bold outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="true">Verified Only</option>
          <option value="false">Pending Approval</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
            <span className="text-xs font-semibold text-[#64748B]">Loading businesses...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8]">
                  <th className="px-6 py-4 font-semibold">Business</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Reviews</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {businesses.map((biz) => (
                  <tr
                    key={biz.id}
                    className={`transition-colors hover:bg-[#F8FAFC]/70 ${
                      !biz.verified ? 'bg-[#FEF3C7]/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-sm">
                          {biz.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0F172A] text-xs flex items-center gap-2">
                            {biz.name}
                            {!biz.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/30">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-medium text-[#64748B]">
                            {biz.category}
                            {biz.city ? ` · ${biz.city}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {biz.owner ? (
                        <div>
                          <div className="text-[#0F172A] font-bold text-xs">{biz.owner.name}</div>
                          <div className="text-[11px] font-medium text-[#64748B]">{biz.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-extrabold text-[#0F172A] hidden md:table-cell">
                      {biz.reviewCount}
                    </td>
                    <td className="px-6 py-4">
                      {biz.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/20">
                          <XCircle className="w-3 h-3" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/listings/${biz.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8FAFC] hover:bg-[#F0FDF4] text-[#64748B] hover:text-[#16A34A] transition-colors border border-transparent hover:border-[#16A34A]/20"
                          title="Edit business details"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <Link
                          href={`/businesses/${biz.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8FAFC] hover:bg-[#16A34A] text-[#64748B] hover:text-white transition-colors"
                          title="View live business page"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={() => handleToggleVerify(biz.id, biz.verified)}
                          disabled={togglingId === biz.id}
                          className={`p-2 rounded-xl transition-colors ${
                            biz.verified
                              ? 'text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626]'
                              : 'text-[#16A34A] hover:bg-[#DCFCE7] hover:text-[#15803D]'
                          }`}
                          title={biz.verified ? 'Mark unverified' : 'Approve & verify'}
                        >
                          {togglingId === biz.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : biz.verified ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteModal(biz)}
                          className="p-2 rounded-xl text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                          title="Delete business"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Custom Styled Delete Confirmation Modal */}
      <AnimatePresence>
        {businessToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-10"
            >
              {/* Top Accent Danger Bar */}
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />

              <div className="p-6 sm:p-7">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="absolute right-5 top-5 p-2 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors disabled:opacity-40"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Warning Icon Badge */}
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-[#DC2626] mb-4 shadow-sm shadow-red-100">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                {/* Dialog Content */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                    Delete Business?
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Are you sure you want to permanently delete this listing?
                  </p>
                  <div className="inline-block mt-1 px-3.5 py-1.5 bg-[#F8FAFC] rounded-xl font-bold text-xs text-[#0F172A] max-w-full truncate border border-[#E2E8F0]">
                    {businessToDelete.name}
                  </div>
                </div>

                {/* Warning Callout Box */}
                <div className="mt-4 p-3.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl flex items-start gap-3 text-left">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-[#991B1B] font-medium">
                    <strong className="font-bold text-[#7F1D1D]">This action cannot be undone.</strong>{' '}
                    The business details, photos, and all{' '}
                    <strong>{businessToDelete.reviewCount} customer review(s)</strong> will be permanently removed from HelloET.
                  </div>
                </div>

                {/* Error Banner if deletion failed */}
                {deleteError && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-xl text-xs text-red-800 font-semibold text-center">
                    {deleteError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] font-bold transition-colors text-xs disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white font-bold transition-all text-xs shadow-md shadow-[#DC2626]/20 disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
