'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Search, Trash2, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, Eye, Plus, Clock } from 'lucide-react'

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

  useEffect(() => { fetchBusinesses() }, [page, verifiedFilter])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBusinesses() }, 400)
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
        setBusinesses(prev => prev.map(b => b.id === id ? { ...b, verified: !current } : b))
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
      if (data.success) setBusinesses(prev => prev.filter(b => b.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#EEF578]" /> Businesses
          </h1>
          <p className="text-neutral-400 mt-1">{total} total businesses</p>
        </div>
        <Link
          href="/dashboard/businesses/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#EEF578] text-neutral-900 rounded-lg font-medium hover:bg-[#d8dc5e] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Business
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#EEF578]/50 text-sm"
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={e => { setVerifiedFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 text-sm"
        >
          <option value="">All Status</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
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
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">Owner</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium hidden md:table-cell">Reviews</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">Status</th>
                  <th className="px-5 py-3 text-neutral-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {businesses.map(biz => (
                  <tr key={biz.id} className={`transition-colors ${!biz.verified ? 'bg-orange-500/5 hover:bg-orange-500/10' : 'hover:bg-neutral-800/50'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            {biz.name}
                            {!biz.verified && (
                              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500">{biz.category}{biz.city ? ` · ${biz.city}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {biz.owner ? (
                        <div>
                          <div className="text-white text-sm">{biz.owner.name}</div>
                          <div className="text-xs text-neutral-500">{biz.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-300 hidden md:table-cell">{biz.reviewCount}</td>
                    <td className="px-5 py-3.5">
                      {biz.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          <XCircle className="w-3 h-3" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/businesses/preview/${biz.slug}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            !biz.verified
                              ? 'bg-[#EEF578] text-neutral-900 hover:bg-[#d8dc5e]'
                              : 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600'
                          }`}
                          title="View business"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={() => handleToggleVerify(biz.id, biz.verified)}
                          disabled={togglingId === biz.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            biz.verified
                              ? 'text-green-400 hover:bg-orange-900/40 hover:text-orange-400'
                              : 'text-neutral-400 hover:bg-green-900/40 hover:text-green-400'
                          }`}
                          title={biz.verified ? 'Unverify' : 'Verify'}
                        >
                          {togglingId === biz.id ? <Loader2 className="w-4 h-4 animate-spin" /> : biz.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(biz.id)}
                          disabled={deletingId === biz.id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          {deletingId === biz.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
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
