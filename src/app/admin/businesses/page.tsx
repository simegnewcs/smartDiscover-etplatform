'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  Clock
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this business? This will remove all associated reviews and data.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) setBusinesses((prev) => prev.filter((b) => b.id !== id))
    } finally {
      setDeletingId(null)
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
          href="/dashboard/businesses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Business
        </Link>
      </div>

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
                          onClick={() => handleDelete(biz.id)}
                          disabled={deletingId === biz.id}
                          className="p-2 rounded-xl text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                          title="Delete business"
                        >
                          {deletingId === biz.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
    </div>
  )
}
