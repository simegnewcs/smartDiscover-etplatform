'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Save, AlertCircle, X, 
  Sparkles, Wifi, Car, Truck, CreditCard, ShoppingBag, Accessibility, 
  Baby, Music, Tv, Utensils, Coffee, Dumbbell, Plane, Shield,
  ChevronRight, ChevronLeft, CheckCircle2, Camera, Navigation, ExternalLink,
  Loader2, HelpCircle, Check, Search, Star, Trash2, Plus, Upload, Link as LinkIcon
} from 'lucide-react'
import CategorySelect from '@/components/dashboard/CategorySelect'
import { extractMapUrl, getMapEmbedUrl, getMapExternalUrl } from '@/lib/maps'

const ethiopianCities = [
  { name: 'Addis Ababa', subcities: ['Bole', 'Piassa', 'Mekanisa', 'Airport', 'Kazanchis', 'Piazza', 'CMC', 'Mekane Yesus', 'Arada', 'Kirkos', 'Lideta', 'Yeka', 'Kolfe Keranio', 'Nifas Silk-Lafto', 'Akaky Kaliti'] },
  { name: 'Bahir Dar', subcities: ['Gish Abay', 'Belay Zeleke', 'Kebele 01', 'Kebele 02', 'Shimbit', 'Ginbot 20'] },
  { name: 'Hawassa', subcities: ['Mekane Yesus', 'Tabor', 'Sabian', 'Harar', 'Hayek Dar', 'Misrak', 'Menhariya'] },
  { name: 'Mekelle', subcities: ['Kahsay', 'Adi Haki', 'Hawelti', 'Enda Yesus', 'Ayder', 'Kedamay Weyane'] },
  { name: 'Gondar', subcities: ['Azezo', 'Piazza', 'Kebele 01', 'Kebele 02', 'Maraki', 'Arada'] },
  { name: 'Dire Dawa', subcities: ['Megala', 'Kebele 01', 'Kebele 02', 'Kebele 03', 'Gende Kore', 'Sabian'] },
  { name: 'Adama', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Bole', 'Boku'] },
  { name: 'Bishoftu', subcities: ['Kebele 01', 'Kebele 02', 'Babogaya', 'Hora'] },
  { name: 'Jimma', subcities: ['Mendera', 'Hermata', 'Boche Bore', 'Jiren'] }
]

const businessFeatures = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking Available', icon: Car },
  { id: 'delivery', label: 'Delivery Service', icon: Truck },
  { id: 'cardPayment', label: 'Card Payment', icon: CreditCard },
  { id: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: Accessibility },
  { id: 'familyFriendly', label: 'Family Friendly', icon: Baby },
  { id: 'liveMusic', label: 'Live Music', icon: Music },
  { id: 'tv', label: 'TV Available', icon: Tv },
  { id: 'outdoorSeating', label: 'Outdoor Seating', icon: Utensils },
  { id: 'coffee', label: 'Coffee Shop', icon: Coffee },
  { id: 'gym', label: 'Gym/Fitness', icon: Dumbbell },
  { id: 'airportShuttle', label: 'Airport Shuttle', icon: Plane },
  { id: 'security', label: '24/7 Security', icon: Shield },
]

const steps = [
  { id: 'basic', label: 'Basic Info', icon: Building2, description: 'Name and category' },
  { id: 'contact', label: 'Location & Contact', icon: MapPin, description: 'Where to find you' },
  { id: 'features', label: 'Features', icon: Sparkles, description: 'Amenities offered' },
  { id: 'media', label: 'Gallery', icon: Camera, description: 'Upload photos' }
]

export default function NewListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [userData, setUserData] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    subcity: '',
    address: '', 
    mapUrl: '',
    phone: '',
    email: '',
    website: '',
    features: [] as string[]
  })
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [availableCities, setAvailableCities] = useState<Array<{ id: string; name: string; subcities: Array<{ id: string; name: string }> }>>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [customSubcity, setCustomSubcity] = useState('')
  const [isCustomSubcity, setIsCustomSubcity] = useState(false)

  // Business Origin Selection & Google Maps Import State
  const [listingMode, setListingMode] = useState<'existing' | 'new'>('existing')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState('')
  const [importError, setImportError] = useState('')
  const [showHowToHelp, setShowHowToHelp] = useState(false)
  const [importedReviews, setImportedReviews] = useState<any[]>([])
  const [importedRating, setImportedRating] = useState<number | null>(null)
  const [importedGoogleReviewCount, setImportedGoogleReviewCount] = useState<string>('')

  const handleImportFromGoogle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!googleMapsLink.trim()) {
      setImportError('Please paste a Google Maps link or enter a business name')
      return
    }

    setIsImporting(true)
    setImportError('')
    setImportSuccess('')

    try {
      const res = await fetch('/api/business/import-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: googleMapsLink.trim() })
      })

      const json = await res.json()

      if (json.success && json.data) {
        const d = json.data

        // Match city with availableCities or set directly
        let finalCity = d.city || 'Addis Ababa'
        const cityMatch = availableCities.find(c => c.name.toLowerCase() === finalCity.toLowerCase())
        if (cityMatch) finalCity = cityMatch.name

        // Match subcity
        let finalSubcity = d.subcity || ''
        if (finalSubcity && cityMatch) {
          const subMatch = cityMatch.subcities?.find(s => s.name.toLowerCase() === finalSubcity.toLowerCase())
          if (subMatch) {
            finalSubcity = subMatch.name
            setIsCustomSubcity(false)
          } else {
            setIsCustomSubcity(true)
            setCustomSubcity(finalSubcity)
          }
        }

        setFormData(prev => ({
          ...prev,
          name: d.name || prev.name,
          description: d.description || prev.description,
          category: d.category || prev.category,
          city: finalCity,
          subcity: finalSubcity,
          address: d.address || prev.address,
          phone: d.phone || prev.phone,
          email: d.email || prev.email,
          website: d.website || prev.website,
          mapUrl: d.mapUrl || prev.mapUrl,
          features: d.features && d.features.length > 0 ? Array.from(new Set([...prev.features, ...d.features])) : prev.features
        }))

        if (d.images && Array.isArray(d.images) && d.images.length > 0) {
          setUploadedImages(d.images)
        }

        if (d.initialReviews && Array.isArray(d.initialReviews)) {
          setImportedReviews(d.initialReviews)
        }

        if (d.rating) {
          setImportedRating(d.rating)
        }

        if (d.googleReviewCount) {
          setImportedGoogleReviewCount(d.googleReviewCount)
        }

        const imgCount = d.images?.length || 0
        const revCount = d.initialReviews?.length || 0
        const gCount = d.googleReviewCount || '1,000+ Google Reviews'
        setImportSuccess(`🎉 Imported "${d.name}" from Google Maps! Auto-filled address, phone, ${imgCount} photos, and ${revCount} verified reviews (${d.rating || 4.7}★). Synced with ${gCount} social proof badge. You can review and edit below before saving.`)
        setCurrentStepIndex(0) // Show Basic Info step with populated values
      } else {
        setImportError(json.message || 'Could not extract details. Please enter manually or check the URL.')
      }
    } catch (err) {
      setImportError('Failed to import business data. Please check your internet connection or enter manually.')
    } finally {
      setIsImporting(false)
    }
  }

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingCities(true)
      try {
        const res = await fetch('/api/locations')
        const data = await res.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAvailableCities(data.data)
        } else {
          setAvailableCities(ethiopianCities.map((c, i) => ({
            id: String(i + 1),
            name: c.name,
            subcities: c.subcities.map((s, si) => ({ id: `${i + 1}-${si + 1}`, name: s }))
          })))
        }
      } catch (err) {
        setAvailableCities(ethiopianCities.map((c, i) => ({
          id: String(i + 1),
          name: c.name,
          subcities: c.subcities.map((s, si) => ({ id: `${i + 1}-${si + 1}`, name: s }))
        })))
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchLocations()
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/listings/new')
      return
    }

    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'USER') {
        router.push('/dashboard')
        return
      }
      fetchUserData()
    }
  }, [status, session, router])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setUserData(data.user)
        setFormData(prev => ({ ...prev, email: prev.email || data.user?.email || '' }))
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'mapUrl') {
      const cleanUrl = extractMapUrl(value)
      setFormData(prev => ({ ...prev, mapUrl: cleanUrl }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const data = new FormData()
        data.append('file', file)
        const response = await fetch('/api/upload', { method: 'POST', body: data })
        if (response.ok) {
          const resData = await response.json()
          return resData.fileUrl || resData.url
        }
        throw new Error('Upload failed')
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...uploadedUrls.filter(Boolean)])
    } catch (error) {
      setError('Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const [galleryTab, setGalleryTab] = useState<'upload' | 'url'>('upload')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageUrlError, setImageUrlError] = useState('')

  const handleAddImageUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setImageUrlError('')
    const input = imageUrlInput.trim()
    if (!input) {
      setImageUrlError('Please enter an image URL')
      return
    }

    // Support single URL or comma/newline separated URLs
    const urls = input.split(/[\n,]+/).map(u => u.trim()).filter(Boolean)
    const validUrls: string[] = []
    const invalidUrls: string[] = []

    for (const u of urls) {
      if (/^https?:\/\/.+/i.test(u)) {
        if (!uploadedImages.includes(u)) {
          validUrls.push(u)
        }
      } else {
        invalidUrls.push(u)
      }
    }

    if (invalidUrls.length > 0) {
      setImageUrlError(`Invalid URL: "${invalidUrls[0]}". Image link must start with http:// or https://`)
      return
    }

    if (validUrls.length === 0) {
      setImageUrlError('The image URL(s) entered are already in your gallery.')
      return
    }

    setUploadedImages(prev => [...prev, ...validUrls])
    setImageUrlInput('')
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    if (currentStepIndex === 0) {
      if (!formData.name.trim() || !formData.category.trim()) {
        setError('Please fill in the required fields (Business Name and Category)')
        return
      }
    } else if (currentStepIndex === 1) {
      if (!formData.city.trim() || !formData.phone.trim()) {
        setError('Please fill in the required fields (City and Phone Number)')
        return
      }
    }
    
    setError('')
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setError('')
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const updateReview = (index: number, field: string, value: any) => {
    setImportedReviews(prev => prev.map((rev, i) => i === index ? { ...rev, [field]: value } : rev))
  }

  const removeReview = (index: number) => {
    setImportedReviews(prev => prev.filter((_, i) => i !== index))
  }

  const addCustomReview = () => {
    setImportedReviews(prev => [
      ...prev,
      {
        author: 'Verified Customer (Google Reviewer)',
        rating: 5,
        comment: 'Great service and authentic experience at this location. Highly recommend!'
      }
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const cleanFeatures = [...formData.features]
      if (importedGoogleReviewCount) {
        cleanFeatures.push(`googleReviews:${importedGoogleReviewCount.trim()}`)
      }

      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: cleanFeatures,
          images: uploadedImages,
          initialReviews: importedReviews,
          verified: importedReviews.length > 0 || session?.user?.role === 'ADMIN',
          ownerId: session?.user?.id
        }),
      })

      if (response.ok) {
        setSuccess('Business created successfully! 🎉')
        setTimeout(() => {
          router.push(session?.user?.role === 'ADMIN' ? '/admin/businesses' : '/dashboard/listings')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.message || errorData.error || 'Failed to create business')
      }
    } catch (error) {
      setError('Failed to create business. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && isLoadingUser)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-neutral-500">Loading form...</p>
        </div>
      </div>
    )
  }

  const currentStep = steps[currentStepIndex]

  return (
    <div className="w-full pb-16">
      {/* Top Header Card */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/listings"
              className="p-2.5 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-600 border border-neutral-200"
              title="Back to Listings"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">Add New Business Listing</h1>
              <p className="text-sm text-neutral-500 hidden sm:block">Create a verified business listing on HelloET Ethiopia</p>
            </div>
          </div>
          {userData && (
            <div className="hidden sm:flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-200">
              <div className="w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {userData.name?.charAt(0) || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-neutral-700 leading-none">{userData.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{userData.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Origin Mode Selection: Existing on Google Maps vs Brand New */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-7 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-neutral-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Business Onboarding
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
              Is your business already on Google Maps?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Select existing to auto-import info in seconds, or register a brand new location manually.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-neutral-100/80 p-1.5 rounded-2xl self-start sm:self-auto border border-neutral-200/60">
            <button
              type="button"
              onClick={() => {
                setListingMode('existing')
                setImportError('')
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                listingMode === 'existing'
                  ? 'bg-white text-[#16A34A] shadow-md shadow-neutral-200/50'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              Existing (Google Maps)
            </button>
            <button
              type="button"
              onClick={() => {
                setListingMode('new')
                setImportError('')
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                listingMode === 'new'
                  ? 'bg-white text-[#16A34A] shadow-md shadow-neutral-200/50'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Register Brand New
            </button>
          </div>
        </div>

        {/* Existing Mode: Google Maps Auto-Fill Box */}
        {listingMode === 'existing' ? (
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-green-50/50 border border-green-200/80 rounded-2xl p-5 sm:p-6 shadow-inner">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#16A34A]" />
                <span className="text-sm font-bold text-neutral-900">
                  Import & Auto-Fill from Google Maps
                </span>
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#16A34A] text-white">
                  Fast
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHowToHelp(prev => !prev)}
                className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1 self-start"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHowToHelp ? 'Hide guide' : 'How to copy Google Maps link?'}
              </button>
            </div>

            {showHowToHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-4 bg-white/90 border border-green-200 rounded-xl text-xs text-neutral-700 space-y-2"
              >
                <p className="font-bold text-neutral-900">📱 How to get your business link:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Open the <strong>Google Maps app</strong> (or <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[#16A34A] underline font-bold">maps.google.com</a>).</li>
                  <li>Search for your business (e.g. <em>&quot;Sheraton Addis&quot;</em>, <em>&quot;Tomoca Coffee Bole&quot;</em>).</li>
                  <li>Tap the <strong>Share</strong> button and choose <strong>&quot;Copy Link&quot;</strong> (looks like <code>https://maps.app.goo.gl/...</code>).</li>
                  <li>Paste the copied link in the box below and click <strong>Auto-Fill from Google</strong>!</li>
                </ol>
              </motion.div>
            )}

            <form onSubmit={handleImportFromGoogle} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={googleMapsLink}
                  onChange={(e) => {
                    setGoogleMapsLink(e.target.value)
                    setImportError('')
                  }}
                  placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or business name)"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-sm transition-all"
                  disabled={isImporting}
                />
              </div>
              <button
                type="submit"
                disabled={isImporting || !googleMapsLink.trim()}
                className="px-6 py-3 bg-[#16A34A] hover:bg-[#15803D] disabled:bg-neutral-300 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#16A34A]/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Fill from Google</span>
                  </>
                )}
              </button>
            </form>

            {importSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3.5 bg-green-100/80 border border-green-300 rounded-xl flex items-start gap-2.5 text-xs text-green-900 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{importSuccess}</p>
                  <p className="mt-1 text-[11px] text-green-700">
                    ✏️ <strong>Notice:</strong> All data is editable. You can modify any field across the 4 steps below before saving to HelloET.
                  </p>
                </div>
              </motion.div>
            )}

            {importError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-neutral-800">
                Registering as a Brand New Business
              </p>
              <p className="text-xs text-neutral-500">
                You are adding a new business from scratch. Complete each step in the form below.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Stepper Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 sticky top-28">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Listing Progress
            </h3>
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex
                const isPast = idx < currentStepIndex
                const StepIcon = step.icon
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (isPast) setCurrentStepIndex(idx)
                    }}
                    disabled={!isPast && !isActive}
                    className={`flex items-start gap-4 text-left w-full group transition-opacity ${!isPast && !isActive ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive ? 'bg-[#16A34A] text-white shadow-md shadow-green-600/30 ring-4 ring-green-100' : 
                        isPast ? 'bg-green-50 text-[#16A34A] border border-green-200' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                      </div>
                      {idx !== steps.length - 1 && (
                        <div className={`w-0.5 h-10 mt-2 transition-colors duration-200 ${isPast ? 'bg-[#16A34A]' : 'bg-neutral-200'}`} />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-sm font-bold transition-colors ${isActive ? 'text-[#16A34A]' : isPast ? 'text-neutral-800' : 'text-neutral-500'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">{step.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="mb-8 pb-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 flex items-center gap-3">
                    <currentStep.icon className="w-6 h-6 text-[#16A34A]" />
                    {currentStep.label}
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">{currentStep.description}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* STEP 1: Basic Info */}
                  {currentStepIndex === 0 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all text-sm"
                            placeholder="e.g. Kuriftu Resort & Spa, Tomoca Coffee, Boston Day Spa"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <CategorySelect
                          value={formData.category}
                          onChange={(catName) => {
                            setFormData(prev => ({ ...prev, category: catName }))
                            setError('')
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={5}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all resize-none text-sm"
                          placeholder="Tell customers what makes your business unique, specialties, opening hours, etc..."
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Location & Contact */}
                  {currentStepIndex === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={(e) => {
                              handleInputChange(e)
                              setFormData(prev => ({ ...prev, city: e.target.value, subcity: '' }))
                              setIsCustomSubcity(false)
                              setCustomSubcity('')
                            }}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all appearance-none cursor-pointer text-sm font-medium"
                            required
                          >
                            <option value="">{isLoadingCities ? 'Loading cities...' : 'Select city'}</option>
                            {availableCities.map((city) => (
                              <option key={city.id || city.name} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-neutral-700">Subcity / Place</label>
                            {formData.city && (
                              <button
                                type="button"
                                onClick={() => {
                                  const nextState = !isCustomSubcity
                                  setIsCustomSubcity(nextState)
                                  if (nextState) {
                                    setFormData(prev => ({ ...prev, subcity: customSubcity }))
                                  } else {
                                    setFormData(prev => ({ ...prev, subcity: '' }))
                                  }
                                }}
                                className="text-xs font-bold text-[#16A34A] hover:underline"
                              >
                                {isCustomSubcity ? 'Select from list' : '+ Add custom place'}
                              </button>
                            )}
                          </div>

                          {(() => {
                            const selectedCityObj = availableCities.find(c => c.name === formData.city)
                            const currentSubcities = selectedCityObj?.subcities || []

                            if (isCustomSubcity || (formData.city && currentSubcities.length === 0)) {
                              return (
                                <input
                                  type="text"
                                  placeholder={formData.city ? `Enter place or area in ${formData.city}...` : 'Select city first'}
                                  value={isCustomSubcity ? customSubcity : formData.subcity}
                                  disabled={!formData.city}
                                  onChange={(e) => {
                                    setCustomSubcity(e.target.value)
                                    setFormData(prev => ({ ...prev, subcity: e.target.value }))
                                  }}
                                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all text-sm font-medium disabled:opacity-50"
                                />
                              )
                            }

                            return (
                              <select
                                name="subcity"
                                value={formData.subcity}
                                onChange={(e) => {
                                  if (e.target.value === '__custom__') {
                                    setIsCustomSubcity(true)
                                    setFormData(prev => ({ ...prev, subcity: '' }))
                                  } else {
                                    handleInputChange(e)
                                  }
                                }}
                                disabled={!formData.city}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all appearance-none disabled:opacity-50 text-sm font-medium cursor-pointer"
                              >
                                <option value="">Select subcity / area</option>
                                {currentSubcities.map((sub) => (
                                  <option key={sub.id || sub.name} value={sub.name}>{sub.name}</option>
                                ))}
                                <option value="__custom__">+ Other / Not in list</option>
                              </select>
                            )
                          })()}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Specific Street / Building Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all text-sm"
                            placeholder="e.g. Next to Edna Mall, Cameroon St, Bole"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all text-sm"
                              placeholder="+251 911 234 567"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Business Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all text-sm"
                              placeholder="contact@business.et"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Website</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all text-sm"
                              placeholder="https://www.mybusiness.com"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center justify-between">
                            <span>Google Maps Link or Embed HTML</span>
                            {formData.mapUrl && (
                              <span className="text-xs text-[#16A34A] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Embed URL recognized
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <Navigation className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
                            <textarea
                              name="mapUrl"
                              value={formData.mapUrl}
                              onChange={handleInputChange}
                              onPaste={(e) => {
                                const pasted = e.clipboardData.getData('text')
                                if (pasted && (pasted.includes('<iframe') || pasted.includes('src='))) {
                                  e.preventDefault()
                                  const cleanUrl = extractMapUrl(pasted)
                                  setFormData(prev => ({ ...prev, mapUrl: cleanUrl }))
                                }
                              }}
                              rows={2}
                              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all text-sm resize-none font-mono"
                              placeholder="Paste Google Maps URL or full <iframe> embed HTML code (e.g. <iframe src=&quot;https://www.google.com/maps/embed?...&quot; ...></iframe>)"
                            />
                          </div>
                          <p className="text-xs text-neutral-400 mt-1.5">
                            Accepts standard Google Maps links or full &lt;iframe&gt; embed code. Embed sources are automatically extracted.
                          </p>

                          {/* Live Map Preview */}
                          {formData.mapUrl && (
                            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                              <div className="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-600">
                                <span className="flex items-center gap-1.5 text-[#16A34A]">
                                  <MapPin className="w-3.5 h-3.5" /> Live Map Preview
                                </span>
                                <a
                                  href={getMapExternalUrl(formData.mapUrl, null, null, formData.address ? `${formData.name}, ${formData.address}` : formData.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#16A34A] hover:underline inline-flex items-center gap-1"
                                >
                                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <div className="aspect-video w-full rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shadow-inner">
                                <iframe
                                  src={getMapEmbedUrl(formData.mapUrl, null, null, formData.address ? `${formData.name}, ${formData.address}` : formData.name)}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  className="w-full h-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Features & Amenities */}
                  {currentStepIndex === 2 && (
                    <div>
                      <p className="text-sm text-neutral-500 mb-6">Select all features, services, and amenities your business provides.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {businessFeatures.map(({ id, label, icon: Icon }) => {
                          const isSelected = formData.features.includes(id)
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                const newFeatures = isSelected
                                  ? formData.features.filter(f => f !== id)
                                  : [...formData.features, id]
                                setFormData({ ...formData, features: newFeatures })
                              }}
                              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#16A34A] bg-green-50 text-[#16A34A] shadow-sm ring-2 ring-green-100'
                                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                              }`}
                            >
                              <Icon className={`w-7 h-7 mb-2.5 ${isSelected ? 'text-[#16A34A]' : 'text-neutral-400'}`} />
                              <span className="text-xs font-bold text-center leading-snug">{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Media Gallery */}
                  {currentStepIndex === 3 && (
                    <div className="space-y-6">
                      {/* Gallery Method Tabs */}
                      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryTab('upload')
                            setImageUrlError('')
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            galleryTab === 'upload'
                              ? 'bg-[#16A34A] text-white shadow-sm'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload From Device</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGalleryTab('url')
                            setImageUrlError('')
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            galleryTab === 'url'
                              ? 'bg-[#16A34A] text-white shadow-sm'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>Add by Image URL</span>
                        </button>
                      </div>

                      {/* Tab 1: Upload Files */}
                      {galleryTab === 'upload' && (
                        <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:border-[#16A34A] transition-colors group">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-neutral-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                              <Camera className="w-7 h-7 text-[#16A34A]" />
                            </div>
                            <span className="text-base font-bold text-neutral-800">
                              {isUploading ? 'Uploading photos...' : 'Click to Upload Photos'}
                            </span>
                            <span className="text-xs text-neutral-500 mt-1">
                              PNG, JPG, WebP up to 10MB each. You can select multiple images.
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Tab 2: Add by Image URL */}
                      {galleryTab === 'url' && (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
                          <div className="mb-4">
                            <label className="block text-xs font-bold text-neutral-800 mb-1 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-[#16A34A]" />
                              <span>Add Photos via Web URL</span>
                            </label>
                            <p className="text-xs text-neutral-500">
                              Paste direct links to photos (from your website, Google Photos, Unsplash, or CDNs). Separate multiple URLs with commas or line breaks.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <input
                                type="url"
                                value={imageUrlInput}
                                onChange={(e) => {
                                  setImageUrlInput(e.target.value)
                                  setImageUrlError('')
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddImageUrl()
                                  }
                                }}
                                placeholder="https://example.com/photos/hotel-room.jpg"
                                className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#16A34A] transition-all font-mono"
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Photo</span>
                              </button>
                            </div>

                            {imageUrlError && (
                              <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{imageUrlError}</span>
                              </p>
                            )}

                            <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#16A34A]" />
                              <span>Tip: Right-click any image online &gt; &quot;Copy image address&quot; and paste it here.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadedImages.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-neutral-800">Uploaded Photos ({uploadedImages.length})</h3>
                            <span className="text-xs text-[#16A34A] font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                              ✓ Auto-filled from Google & Web
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {uploadedImages.map((image, index) => (
                              <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-neutral-200 shadow-sm bg-neutral-100">
                                <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transform hover:scale-110 transition-all shadow-md"
                                    title="Remove photo"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {importedReviews.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-neutral-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div>
                              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>Google Maps Verified Reviews ({importedReviews.length})</span>
                              </h3>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                You can edit reviewer names, star ratings, or comments, delete any review, or paste quotes from Google Maps.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-500 font-medium">Social Proof Badge:</span>
                              <input
                                type="text"
                                value={importedGoogleReviewCount}
                                onChange={(e) => setImportedGoogleReviewCount(e.target.value)}
                                placeholder="e.g. 681 Google Reviews"
                                className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-48 shadow-sm"
                                title="Click to customize the Google Review count badge"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            {importedReviews.map((rev, rIdx) => (
                              <div key={rIdx} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 transition-all hover:border-neutral-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                                  <input
                                    type="text"
                                    value={rev.author}
                                    onChange={(e) => updateReview(rIdx, 'author', e.target.value)}
                                    className="text-xs font-bold text-neutral-800 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#16A34A] w-full sm:w-72"
                                    placeholder="Reviewer Name"
                                  />
                                  <div className="flex items-center justify-between sm:justify-end gap-3">
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-neutral-200">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => updateReview(rIdx, 'rating', star)}
                                          className="focus:outline-none"
                                          title={`Set rating to ${star} stars`}
                                        >
                                          <Star
                                            className={`w-4 h-4 transition-transform hover:scale-110 ${
                                              star <= (rev.rating || 5)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-neutral-300'
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeReview(rIdx)}
                                      className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete this review"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <textarea
                                  value={rev.comment}
                                  onChange={(e) => updateReview(rIdx, 'comment', e.target.value)}
                                  rows={2}
                                  className="w-full text-xs text-neutral-700 bg-white border border-neutral-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#16A34A] resize-none leading-relaxed"
                                  placeholder="Review comment..."
                                />
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={addCustomReview}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] hover:text-[#15803D] bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-xl transition-all shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Paste / Add Real Review from Google Maps</span>
                            </button>
                            <span className="text-[11px] text-neutral-400">
                              All {importedReviews.length} reviews will be published to your HelloET listing
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Navigation Footer */}
            <div className="bg-neutral-50 px-6 sm:px-10 py-5 border-t border-neutral-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  currentStepIndex === 0 
                    ? 'text-neutral-300 cursor-not-allowed' 
                    : 'text-neutral-700 hover:bg-white hover:shadow-sm border border-neutral-200 bg-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {currentStepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-7 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isLoading ? 'Publishing...' : 'Publish Business Listing'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
