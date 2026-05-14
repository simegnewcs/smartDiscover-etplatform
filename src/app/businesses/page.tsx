'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Phone, 
  Globe,
  Building2,
  Utensils,
  Bed,
  Coffee,
  Pill,
  ShoppingCart,
  Camera,
  ChevronDown,
  Grid,
  List,
  Bookmark
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Business {
  id: number
  slug: string
  name: string
  description?: string
  category: string
  location: string
  address?: string
  phone?: string
  website?: string
  verified: boolean
  image?: string
  rating: number
  reviewCount: number
  latitude?: number
  longitude?: number
}

interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  businessCount: number
}

const categoryIcons: Record<string, any> = {
  'restaurants': Utensils,
  'hotels': Bed,
  'cafes': Coffee,
  'pharmacies': Pill,
  'supermarkets': ShoppingCart,
  'tourist attractions': Camera,
  'default': Building2
}

function AllBusinessesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const categoryFromUrl = searchParams?.get('category') || 'all'
  
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [savingId, setSavingId] = useState<number | null>(null)

  const toggleSave = async (e: React.MouseEvent, businessId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      router.push('/auth/login?callbackUrl=/businesses')
      return
    }
    setSavingId(businessId)
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      })
      const data = await res.json()
      if (data.success) {
        setSavedIds(prev => {
          const next = new Set(prev)
          if (data.saved) next.add(businessId)
          else next.delete(businessId)
          return next
        })
      }
    } catch (err) {
      console.error('Error toggling save:', err)
    } finally {
      setSavingId(null)
    }
  }

  const locations = [
    'All Locations',
    'Addis Ababa',
    'Bole',
    'Piassa',
    'Mekanisa',
    'Airport',
    'Kazanchis',
    'Piazza'
  ]

  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
  }, [categoryFromUrl])

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory)
    if (newCategory === 'all') {
      router.push('/businesses')
    } else {
      router.push(`/businesses?category=${encodeURIComponent(newCategory)}`)
    }
  }

  useEffect(() => {
    if (session) {
      fetch('/api/saved')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const ids = new Set<number>(data.data.savedBusinesses.map((s: any) => parseInt(s.business.id)))
            setSavedIds(ids)
          }
        })
        .catch(() => {})
    }
  }, [session])

  useEffect(() => {
    fetchData()
  }, [categoryFromUrl])

  const fetchData = async () => {
    try {
      const categoryParam = categoryFromUrl !== 'all' ? `&category=${categoryFromUrl}` : ''
      const businessesResponse = await fetch(`/api/search?q=&limit=100${categoryParam}`)
      const businessesData = await businessesResponse.json()
      if (businessesData.success) {
        setBusinesses(businessesData.data.businesses)
      }
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchTerm ||
                         business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = selectedLocation === 'all' || 
                           business.location.toLowerCase().includes(selectedLocation.toLowerCase())
    return matchesSearch && matchesLocation
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'rating': return b.rating - a.rating
      case 'reviews': return b.reviewCount - a.reviewCount
      case 'verified': return (b.verified ? 1 : 0) - (a.verified ? 1 : 0)
      default: return 0
    }
  })

  const getCategoryIcon = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase()
    return categoryIcons[normalizedName] || categoryIcons.default
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-primary-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              {categoryFromUrl !== 'all' ? `${categoryFromUrl} Businesses` : 'All Businesses in Ethiopia'}
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {categoryFromUrl !== 'all' 
                ? `Discover trusted ${categoryFromUrl.toLowerCase()} businesses across Ethiopia`
                : 'Discover trusted local businesses across all categories and locations'
              }
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search businesses, categories, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 py-3 outline-none text-neutral-800 placeholder-neutral-400"
                />
              </div>
              <button
                className="flex items-center gap-2 px-4 py-3 border-l border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-neutral-600" />
                <span className="text-neutral-600">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name} ({category.businessCount})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                  <option value="reviews">Reviews</option>
                  <option value="verified">Verified First</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">View Mode</label>
                <div className="flex gap-2">
                  <button onClick={() => setViewMode('grid')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>
                    <Grid className="w-4 h-4" /><span>Grid</span>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}>
                    <List className="w-4 h-4" /><span>List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">{filteredBusinesses.length} Businesses Found</h2>
            <p className="text-neutral-600 mt-1">
              {selectedCategory !== 'all' && `${selectedCategory} • `}
              {selectedLocation !== 'all' && `${selectedLocation} • `}
              Sorted by {sortBy}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filteredBusinesses.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => {
                const CategoryIcon = getCategoryIcon(business.category)
                return (
                  <Link key={business.id} href={`/business/${business.slug}`} className="group bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      {business.image ? (
                        <img src={business.image} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                          <CategoryIcon className="w-12 h-12 text-neutral-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-neutral-700">{business.category}</div>
                      {business.verified && <div className="absolute top-3 right-12 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">✓ Verified</div>}
                      <button
                        onClick={(e) => toggleSave(e, business.id)}
                        disabled={savingId === business.id}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${
                          savedIds.has(business.id)
                            ? 'bg-[#006747] text-white hover:bg-[#00523A]'
                            : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-[#006747]'
                        }`}
                        title={savedIds.has(business.id) ? 'Remove from saved' : 'Save business'}
                      >
                        <Bookmark className={`w-4 h-4 ${savedIds.has(business.id) ? 'fill-white' : ''}`} />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">{business.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-neutral-700">{business.rating.toFixed(1)}</span>
                        <span className="text-sm text-neutral-500">({business.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-600 mb-3">
                        <MapPin className="w-4 h-4" /><span>{business.location}</span>
                      </div>
                      {business.description && <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{business.description}</p>}
                      <span className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">View Details</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="divide-y divide-neutral-200">
                {filteredBusinesses.map((business) => (
                  <Link key={business.id} href={`/business/${business.slug}`} className="block p-6 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                        {business.image ? (
                          <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-neutral-800 truncate">{business.name}</h3>
                          {business.verified && <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"><span>✓</span><span>Verified</span></div>}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">{business.category}</span>
                          <div className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{business.location}</span></div>
                          <div className="flex items-center space-x-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span>{business.rating.toFixed(1)}</span><span className="text-neutral-500">({business.reviewCount})</span></div>
                        </div>
                        {business.description && <p className="text-sm text-neutral-600 line-clamp-2">{business.description}</p>}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => toggleSave(e, business.id)}
                            disabled={savingId === business.id}
                            className={`p-2 rounded-lg transition-colors ${
                              savedIds.has(business.id)
                                ? 'bg-[#006747] text-white hover:bg-[#00523A]'
                                : 'bg-neutral-100 text-neutral-500 hover:bg-[#D1EFE4] hover:text-[#006747]'
                            }`}
                            title={savedIds.has(business.id) ? 'Remove from saved' : 'Save business'}
                          >
                            <Bookmark className={`w-4 h-4 ${savedIds.has(business.id) ? 'fill-white' : ''}`} />
                          </button>
                          <span className="inline-flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">View Details</span>
                        </div>
                        {business.phone && <div className="flex items-center space-x-1 text-sm text-neutral-600"><Phone className="w-3 h-3" /><span>{business.phone}</span></div>}
                        {business.website && <div className="flex items-center space-x-1 text-sm text-primary-600"><Globe className="w-3 h-3" /><span>Website</span></div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-800 mb-2">
              {categoryFromUrl !== 'all' ? `No ${categoryFromUrl} businesses found` : 'No businesses found'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {categoryFromUrl !== 'all' ? 'Try selecting a different category or clearing filters' : 'Try adjusting your search criteria or filters'}
            </p>
            <button onClick={() => { setSearchTerm(''); setSelectedLocation('all'); handleCategoryChange('all') }} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors">
              {categoryFromUrl !== 'all' ? 'Show All Businesses' : 'Clear Filters'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AllBusinessesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <AllBusinessesContent />
    </Suspense>
  )
}
