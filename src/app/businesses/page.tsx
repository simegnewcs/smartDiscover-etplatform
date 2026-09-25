'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Grid,
  List,
  Bookmark,
  ChevronDown
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Business {
  id: string | number
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

  const toggleSave = async (e: React.MouseEvent, businessId: number | string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      router.push('/auth/login?callbackUrl=/businesses')
      return
    }
    const idNum = typeof businessId === 'string' ? parseInt(businessId) : businessId
    setSavingId(idNum)
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: idNum })
      })
      const data = await res.json()
      if (data.success) {
        setSavedIds(prev => {
          const next = new Set(prev)
          if (data.saved) next.add(idNum)
          else next.delete(idNum)
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
    setLoading(true)
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Dark Hero Section */}
      <div className="relative bg-[#047857] pt-24 pb-32 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#059669] rounded-full blur-[100px] opacity-50 transform translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-400 rounded-full blur-[120px] opacity-20 transform -translate-x-1/3 translate-y-1/2 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-yellow-300 text-sm font-semibold tracking-wider uppercase mb-4 backdrop-blur-md border border-white/20">
                Explore Ethiopia
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                {categoryFromUrl !== 'all' ? `Find ${categoryFromUrl}` : 'Discover Local Businesses'}
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
                Uncover the best spots in Ethiopia, from highly-rated restaurants and luxury hotels to essential local services.
              </p>
            </motion.div>
          </div>

          {/* Premium Search Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 w-full border-b md:border-b-0 md:border-r border-neutral-100 pb-2 md:pb-0">
                <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 outline-none text-neutral-800 placeholder-neutral-400 text-lg bg-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto ${
                  showFilters 
                    ? 'bg-[#047857] text-white shadow-md' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Dropdown Area */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Category</label>
                      <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#047857] text-neutral-700 font-medium appearance-none cursor-pointer">
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>{category.name} ({category.businessCount})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Location</label>
                      <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#047857] text-neutral-700 font-medium appearance-none cursor-pointer">
                        {locations.map((location) => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Sort By</label>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#047857] text-neutral-700 font-medium appearance-none cursor-pointer">
                        <option value="name">A to Z</option>
                        <option value="rating">Highest Rated</option>
                        <option value="reviews">Most Reviewed</option>
                        <option value="verified">Verified First</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Layout</label>
                      <div className="flex bg-neutral-100 p-1 rounded-xl">
                        <button onClick={() => setViewMode('grid')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-[#047857] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                          <Grid className="w-4 h-4" /> Grid
                        </button>
                        <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${viewMode === 'list' ? 'bg-white text-[#047857] shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                          <List className="w-4 h-4" /> List
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-neutral-100">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-[#047857] mb-4"></div>
            <p className="text-neutral-500 font-medium">Discovering best places...</p>
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-bold text-neutral-800">
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'Place' : 'Places'} Found
              </h2>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}
            >
              {filteredBusinesses.map((business) => {
                const CategoryIcon = getCategoryIcon(business.category)
                const isSaved = savedIds.has(typeof business.id === 'string' ? parseInt(business.id) : business.id)
                const idNum = typeof business.id === 'string' ? parseInt(business.id) : business.id

                if (viewMode === 'grid') {
                  return (
                    <motion.div key={business.id} variants={itemVariants}>
                      <Link href={`/business/${business.slug}`} className="group block bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-neutral-100 hover:border-[#047857]/20 overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        <div className="relative h-60 overflow-hidden bg-neutral-100">
                          {business.image ? (
                            <img src={business.image} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                              <CategoryIcon className="w-16 h-16 text-neutral-300" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 shadow-sm">
                              {business.category}
                            </span>
                          </div>
                          <button
                            onClick={(e) => toggleSave(e, idNum)}
                            disabled={savingId === idNum}
                            className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all ${
                              isSaved
                                ? 'bg-[#047857] text-white'
                                : 'bg-white/90 text-neutral-500 hover:bg-white hover:text-[#047857]'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                          {business.verified && (
                            <div className="absolute bottom-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              ✓ Verified
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3 gap-4">
                            <h3 className="font-extrabold text-xl text-neutral-800 group-hover:text-[#047857] transition-colors line-clamp-2">
                              {business.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100 shrink-0">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                              <span className="text-sm font-extrabold text-yellow-700">{typeof business.rating === 'number' ? business.rating.toFixed(1) : '0.0'}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-neutral-500 line-clamp-2 mb-5 flex-1">
                            {business.description || 'A great local business waiting to be discovered.'}
                          </p>
                          
                          <div className="space-y-3 pt-5 border-t border-neutral-100">
                            <div className="flex items-center gap-3 text-sm text-neutral-600">
                              <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-[#047857]" />
                              </div>
                              <span className="font-medium truncate">{business.location}</span>
                            </div>
                            {business.phone && (
                              <div className="flex items-center gap-3 text-sm text-neutral-600">
                                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center shrink-0">
                                  <Phone className="w-4 h-4 text-[#047857]" />
                                </div>
                                <span className="font-medium">{business.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                }

                // List View
                return (
                  <motion.div key={business.id} variants={itemVariants}>
                    <Link href={`/business/${business.slug}`} className="group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm hover:shadow-lg border border-neutral-100 overflow-hidden transition-all duration-300">
                      <div className="relative w-full md:w-64 h-48 md:h-full bg-neutral-100 shrink-0">
                        {business.image ? (
                          <img src={business.image} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CategoryIcon className="w-12 h-12 text-neutral-300" />
                          </div>
                        )}
                        <button
                          onClick={(e) => toggleSave(e, idNum)}
                          disabled={savingId === idNum}
                          className={`absolute top-3 left-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all ${
                            isSaved ? 'bg-[#047857] text-white' : 'bg-white/90 text-neutral-500 hover:bg-white hover:text-[#047857]'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-extrabold text-xl text-neutral-800 group-hover:text-[#047857] transition-colors">
                              {business.name}
                            </h3>
                            {business.verified && (
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                            <span className="text-sm font-extrabold text-yellow-700">{typeof business.rating === 'number' ? business.rating.toFixed(1) : '0.0'}</span>
                            <span className="text-xs font-medium text-yellow-600/70 ml-1">({business.reviewCount})</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                          {business.description || 'Discover this amazing local business on HelloET.'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm mt-auto">
                          <span className="bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg font-bold">
                            {business.category}
                          </span>
                          <div className="flex items-center gap-2 text-neutral-600">
                            <MapPin className="w-4 h-4 text-[#047857]" />
                            <span className="font-medium">{business.location}</span>
                          </div>
                          {business.phone && (
                            <div className="flex items-center gap-2 text-neutral-600">
                              <Phone className="w-4 h-4 text-[#047857]" />
                              <span className="font-medium">{business.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 px-4 bg-white rounded-[3rem] shadow-sm border border-neutral-100"
          >
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-3">
              No places found
            </h3>
            <p className="text-lg text-neutral-500 mb-8 max-w-md mx-auto">
              We couldn't find any verified businesses matching your current filters. Try adjusting your search criteria.
            </p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedLocation('all'); handleCategoryChange('all') }} 
              className="bg-[#047857] hover:bg-[#036246] text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function AllBusinessesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 border-t-[#047857]"></div>
      </div>
    }>
      <AllBusinessesContent />
    </Suspense>
  )
}
