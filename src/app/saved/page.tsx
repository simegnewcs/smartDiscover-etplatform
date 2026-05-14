'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Bookmark,
  Star,
  MapPin,
  Phone,
  Trash2,
  Loader2,
  Search,
  Heart,
  BadgeCheck,
  ArrowLeft,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react'

interface SavedItem {
  savedId: string
  savedAt: string
  business: {
    id: string
    slug: string
    name: string
    description: string | null
    address: string | null
    phone: string | null
    verified: boolean
    category: string | null
    city: string | null
    imageUrl: string | null
    avgRating: number
    reviewCount: number
  }
}

export default function SavedPage() {
  const { data: session, status } = useSession()
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'name'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSaved()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved')
      const data = await res.json()
      if (data.success) {
        setSavedItems(data.data.savedBusinesses)
      }
    } catch (err) {
      console.error('Error fetching saved:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (businessId: string) => {
    setRemoving(businessId)
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      })
      const data = await res.json()
      if (data.success) {
        setSavedItems(prev => prev.filter(item => item.business.id !== businessId))
      }
    } catch (err) {
      console.error('Error removing saved:', err)
    } finally {
      setRemoving(null)
    }
  }

  const filtered = savedItems
    .filter(item => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        item.business.name.toLowerCase().includes(q) ||
        item.business.category?.toLowerCase().includes(q) ||
        item.business.city?.toLowerCase().includes(q) ||
        item.business.address?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.business.avgRating - a.business.avgRating
      if (sortBy === 'name') return a.business.name.localeCompare(b.business.name)
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-[#006747]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Sign in to see saved places</h2>
          <p className="text-neutral-600 mb-6">Save your favorite businesses and access them anytime</p>
          <Link
            href="/auth/login?callbackUrl=/saved"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-[#006747]" />
                Saved Places
              </h1>
              <p className="text-neutral-600 mt-1">
                {savedItems.length} {savedItems.length === 1 ? 'business' : 'businesses'} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#006747] text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#006747] text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search saved businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating' | 'name')}
              className="pl-10 pr-8 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] appearance-none cursor-pointer"
            >
              <option value="recent">Recently Saved</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {savedItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-[#006747]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No saved businesses yet</h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Browse businesses and click the save button to add them to your collection
            </p>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Businesses
            </Link>
          </div>
        )}

        {/* No results */}
        {savedItems.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No saved businesses match your search</p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div key={item.savedId} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Image */}
                <div className="relative h-48 bg-neutral-100">
                  {item.business.imageUrl ? (
                    <img
                      src={item.business.imageUrl}
                      alt={item.business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D1EFE4] to-[#EEF578]/30">
                      <Bookmark className="w-12 h-12 text-[#006747]/30" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(item.business.id)}
                    disabled={removing === item.business.id}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-sm transition-colors"
                  >
                    {removing === item.business.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                  {item.business.category && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 rounded-full text-xs font-medium text-neutral-700">
                      {item.business.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link href={`/business/${item.business.slug}`}>
                    <h3 className="font-semibold text-neutral-800 hover:text-[#006747] transition-colors flex items-center gap-1.5">
                      {item.business.name}
                      {item.business.verified && <BadgeCheck className="w-4 h-4 text-[#006747]" />}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= Math.round(item.business.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">
                      {item.business.avgRating.toFixed(1)} ({item.business.reviewCount})
                    </span>
                  </div>

                  {/* Location */}
                  {(item.business.city || item.business.address) && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{item.business.address || item.business.city}</span>
                    </div>
                  )}

                  {item.business.phone && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.business.phone}</span>
                    </div>
                  )}

                  {/* Saved date + View Details */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Saved {new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link
                      href={`/business/${item.business.slug}`}
                      className="inline-flex items-center gap-1 bg-[#006747] hover:bg-[#00523A] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.savedId} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    {item.business.imageUrl ? (
                      <img
                        src={item.business.imageUrl}
                        alt={item.business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D1EFE4] to-[#EEF578]/30">
                        <Bookmark className="w-6 h-6 text-[#006747]/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/business/${item.business.slug}`}>
                      <h3 className="font-semibold text-neutral-800 hover:text-[#006747] transition-colors flex items-center gap-1.5">
                        {item.business.name}
                        {item.business.verified && <BadgeCheck className="w-4 h-4 text-[#006747]" />}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      {item.business.category && (
                        <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full text-neutral-600">{item.business.category}</span>
                      )}
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-neutral-600">{item.business.avgRating.toFixed(1)} ({item.business.reviewCount})</span>
                      </div>
                    </div>
                    {(item.business.city || item.business.address) && (
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{item.business.address || item.business.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-neutral-400 hidden sm:block">
                      {new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <Link
                      href={`/business/${item.business.slug}`}
                      className="inline-flex items-center gap-1 bg-[#006747] hover:bg-[#00523A] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemove(item.business.id)}
                      disabled={removing === item.business.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {removing === item.business.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
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
