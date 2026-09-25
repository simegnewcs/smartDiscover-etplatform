'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Save, AlertCircle, X, 
  User, Sparkles, Wifi, Car, Truck, CreditCard, ShoppingBag, Accessibility, 
  Baby, Music, Tv, Utensils, Coffee, Dumbbell, Plane, BookOpen, Shield,
  ChevronRight, ChevronLeft, CheckCircle2, Camera
} from 'lucide-react'

const businessTypes = [
  'Restaurants', 'Hotels', 'Cafes', 'Pharmacies', 'Supermarkets',
  'Tourist Attractions', 'Local Services', 'Education', 'Healthcare',
  'Entertainment', 'Other'
]

const ethiopianCities = [
  { name: 'Addis Ababa', subcities: ['Bole', 'Piassa', 'Mekanisa', 'Airport', 'Kazanchis', 'Piazza', 'CMC', 'Mekane Yesus'] },
  { name: 'Bahir Dar', subcities: ['Gish Abay', 'Belay Zeleke', 'Kebele 01', 'Kebele 02'] },
  { name: 'Hawassa', subcities: ['Mekane Yesus', 'Tabor', 'Sabian', 'Harar'] },
  { name: 'Mekelle', subcities: ['Kahsay', 'Adi Haki', 'Hawelti', 'Enda Yesus'] },
  { name: 'Gondar', subcities: ['Azezo', 'Piazza', 'Kebele 01', 'Kebele 02'] },
  { name: 'Dire Dawa', subcities: ['Megala', 'Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Adama', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04'] },
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

export default function NewBusinessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [userData, setUserData] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', city: '', subcity: '', address: '', 
    mapUrl: '', phone: '', email: '', website: '', features: [] as string[]
  })
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/businesses/new')
      return
    }

    if (status === 'authenticated' && session?.user) {
      const role = session.user.role
      if (role !== 'BUSINESS_OWNER' && role !== 'ADMIN') {
        router.push('/dashboard?error=insufficient_permissions')
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
        setFormData(prev => ({ ...prev, email: data.user?.email || '' }))
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/upload', { method: 'POST', body: formData })
        if (response.ok) {
          const data = await response.json()
          return data.fileUrl
        }
        throw new Error('Upload failed')
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      setError('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    // Validate current step
    if (currentStepIndex === 0) {
      if (!formData.name || !formData.category) {
        setError('Please fill in the required fields (Name, Category)')
        return
      }
    } else if (currentStepIndex === 1) {
      if (!formData.city || !formData.phone) {
        setError('Please fill in the required fields (City, Phone)')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
          ownerId: session?.user?.id
        }),
      })

      if (response.ok) {
        setSuccess('Business created successfully! 🎉')
        setTimeout(() => {
          router.push(session?.user?.role === 'ADMIN' ? '/admin/businesses' : '/dashboard/listings')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create business')
      }
    } catch (error) {
      setError('Failed to create business. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoadingUser) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#047857] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentStep = steps[currentStepIndex]

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Navigation */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/listings" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">Add New Business</h1>
              <p className="text-sm text-neutral-500 hidden md:block">Create a premium listing on HelloET</p>
            </div>
          </div>
          {userData && (
            <div className="hidden sm:flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100">
              <div className="w-8 h-8 bg-[#047857] rounded-full flex items-center justify-center text-white text-sm font-bold">
                {userData.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-neutral-700 leading-none">{userData.name}</p>
                <p className="text-xs text-neutral-500 mt-1">{userData.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Stepper Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl shadow-neutral-200/50 border-4 border-white ring-1 ring-neutral-100 p-8 sticky top-28">
              <h3 className="text-sm font-black text-neutral-800 uppercase tracking-widest mb-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
                Progress Steps
              </h3>
              <div className="space-y-6">
                {steps.map((step, idx) => {
                  const isActive = idx === currentStepIndex
                  const isPast = idx < currentStepIndex
                  const StepIcon = step.icon
                  return (
                    <div key={step.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'bg-[#047857] text-white shadow-lg shadow-emerald-500/20' : 
                          isPast ? 'bg-emerald-50 text-[#047857]' : 'bg-neutral-100 text-neutral-400'
                        }`}>
                          {isPast ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        {idx !== steps.length - 1 && (
                          <div className={`w-0.5 h-12 mt-2 transition-colors duration-300 ${isPast ? 'bg-[#047857]' : 'bg-neutral-100'}`} />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className={`font-bold transition-colors ${isActive ? 'text-[#047857]' : isPast ? 'text-neutral-800' : 'text-neutral-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-2xl shadow-neutral-200/50 border-4 border-white ring-1 ring-neutral-100 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-3">
                    <currentStep.icon className="w-7 h-7 text-[#047857]" />
                    {currentStep.label}
                  </h2>
                  <p className="text-neutral-500 mt-2">{currentStep.description}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
                    <p className="text-emerald-700 text-sm font-medium">{success}</p>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1] // Super smooth spring-like easing
                    }}
                  >
                    {/* STEP 1: Basic Info */}
                    {currentStepIndex === 0 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Business Name <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all"
                              placeholder="e.g. Kuriftu Resort & Spa"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Category <span className="text-red-500">*</span></label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select the main category</option>
                            {businessTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Description</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={5}
                            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-transparent transition-all resize-none"
                            placeholder="Tell customers what makes your business unique..."
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Location & Contact */}
                    {currentStepIndex === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">City <span className="text-red-500">*</span></label>
                            <select
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select city</option>
                              {ethiopianCities.map((city) => (
                                <option key={city.name} value={city.name}>{city.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Subcity/Area</label>
                            <select
                              name="subcity"
                              value={formData.subcity}
                              onChange={handleInputChange}
                              disabled={!formData.city}
                              className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] transition-all appearance-none disabled:opacity-50"
                            >
                              <option value="">Select subcity</option>
                              {ethiopianCities.find(c => c.name === formData.city)?.subcities.map((subcity) => (
                                <option key={subcity} value={subcity}>{subcity}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Specific Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] transition-all"
                              placeholder="e.g. Next to Edna Mall, Bole Road"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-neutral-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] transition-all"
                              placeholder="+251 9XX XXX XXX"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Business Email</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] transition-all"
                                placeholder="contact@business.com"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Website</label>
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                              <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857] transition-all"
                                placeholder="https://www.website.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Features */}
                    {currentStepIndex === 2 && (
                      <div>
                        <p className="text-neutral-500 mb-6">Select all the amenities and features your business provides.</p>
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
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-[#047857] bg-emerald-50 text-[#047857] shadow-sm'
                                    : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#047857]' : 'text-neutral-400'}`} />
                                <span className="text-sm font-bold text-center leading-tight">{label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Media */}
                    {currentStepIndex === 3 && (
                      <div className="space-y-6">
                        <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-3xl p-10 text-center hover:border-[#047857] transition-colors group">
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
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Camera className="w-8 h-8 text-[#047857]" />
                            </div>
                            <span className="text-lg font-bold text-neutral-800">
                              {isUploading ? 'Uploading...' : 'Click to Upload Photos'}
                            </span>
                            <span className="text-sm text-neutral-500 mt-2">
                              JPEG, PNG up to 5MB. You can select multiple.
                            </span>
                          </label>
                        </div>

                        {uploadedImages.length > 0 && (
                          <div>
                            <h3 className="font-bold text-neutral-800 mb-4">Uploaded Photos ({uploadedImages.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative group rounded-2xl overflow-hidden aspect-square border border-neutral-100 shadow-sm">
                                  <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transform hover:scale-110 transition-all shadow-lg"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Form Navigation Footer */}
              <div className="bg-neutral-50 px-8 md:px-12 py-6 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    currentStepIndex === 0 
                      ? 'text-neutral-400 cursor-not-allowed' 
                      : 'text-neutral-600 hover:bg-white hover:shadow-sm bg-neutral-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>

                {currentStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-[#047857] hover:bg-[#036246] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#047857] hover:bg-[#036246] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    {isLoading ? 'Publishing...' : 'Publish Business'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
