'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Save, AlertCircle, X, User, Lock, Clock, Camera, FileText, ExternalLink, Sparkles, Wifi, Car, Truck, CreditCard, ShoppingBag, Accessibility, Baby, Music, Tv, Utensils, Coffee, Dumbbell, Plane, BookOpen, Shield } from 'lucide-react'

const businessTypes = [
  'Restaurants',
  'Hotels',
  'Cafes',
  'Pharmacies',
  'Supermarkets',
  'Tourist Attractions',
  'Local Services',
  'Education',
  'Healthcare',
  'Entertainment',
  'Other'
]

const ethiopianCities = [
  { name: 'Addis Ababa', subcities: ['Bole', 'Piassa', 'Mekanisa', 'Airport', 'Kazanchis', 'Piazza', 'CMC', 'Mekane Yesus'] },
  { name: 'Bahir Dar', subcities: ['Gish Abay', 'Belay Zeleke', 'Kebele 01', 'Kebele 02'] },
  { name: 'Hawassa', subcities: ['Mekane Yesus', 'Tabor', 'Sabian', 'Harar'] },
  { name: 'Mekelle', subcities: ['Kahsay', 'Adi Haki', 'Hawelti', 'Enda Yesus'] },
  { name: 'Gondar', subcities: ['Azezo', 'Piazza', 'Kebele 01', 'Kebele 02'] },
  { name: 'Dire Dawa', subcities: ['Megala', 'Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Adama', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04'] },
  { name: 'Jimma', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Jijiga', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Dessie', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Debre Berhan', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Shashamane', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Axum', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Gambela', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Asosa', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Weldiya', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Nekemte', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Sodo', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Arba Minch', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
  { name: 'Hosaena', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] }
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
  { id: 'library', label: 'Library/Reading Area', icon: BookOpen },
  { id: 'security', label: '24/7 Security', icon: Shield },
]

export default function NewBusinessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [userData, setUserData] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    subcity: '',
    address: '',
    mapUrl: '', // Google Maps share link
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    telegram: '',
    licenseNumber: '',
    features: [] as string[], // Business features
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    }
  })
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSection, setActiveSection] = useState('basic')

  // Check authentication and role
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/businesses/new')
      return
    }

    if (status === 'authenticated' && session?.user) {
      const role = session.user.role
      if (role !== 'BUSINESS_OWNER' && role !== 'ADMIN') {
        // User is logged in but not a business owner
        router.push('/dashboard?error=insufficient_permissions')
        return
      }

      // Fetch full user data
      fetchUserData()
    }
  }, [status, session, router])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setUserData(data.user)
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          email: data.user?.email || ''
        }))
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
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

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          return data.fileUrl
        } else {
          throw new Error('Upload failed')
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...uploadedUrls])
      setSuccess(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Basic validation
    if (!formData.name || !formData.category || !formData.city) {
      setError('Business name, category, and city are required')
      setIsLoading(false)
      return
    }

    if (!session?.user?.id) {
      setError('You must be logged in to add a business')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
          ownerId: session.user.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess('Business created successfully! 🎉')

        // Reset form after delay
        setTimeout(() => {
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin/businesses')
          } else {
            router.push('/dashboard/listings')
          }
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create business')
      }
    } catch (error) {
      console.error('Business creation error:', error)
      setError('Failed to create business. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while checking auth
  if (status === 'loading' || isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#006747] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Listings</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Add New Business</h1>
          <p className="text-gray-600 mt-2">
            Register your business on HelloET to reach thousands of customers
          </p>
        </div>

        {/* User Profile Info Card */}
        {userData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#006747] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Business Owner Profile</h3>
                <p className="text-sm text-gray-500 mb-3">Your personal information (auto-filled from your account)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 block text-xs">Full Name</span>
                    <span className="font-medium text-gray-900">{userData.name}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 block text-xs">Email</span>
                    <span className="font-medium text-gray-900">{userData.email}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-500 block text-xs">Phone</span>
                    <span className="font-medium text-gray-900">{userData.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {[
              { id: 'basic', label: 'Basic Info', icon: Building2 },
              { id: 'contact', label: 'Contact & Location', icon: MapPin },
              { id: 'features', label: 'Features', icon: Sparkles },
              { id: 'hours', label: 'Operating Hours', icon: Clock },
              { id: 'social', label: 'Social & Web', icon: ExternalLink },
              { id: 'license', label: 'License & Docs', icon: FileText },
              { id: 'images', label: 'Images', icon: Camera }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-[#006747] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Success</p>
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter business name"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe your business, services, and what makes you special"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select city</option>
                    {ethiopianCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcity
                  </label>
                  <select
                    name="subcity"
                    value={formData.subcity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select subcity</option>
                    {ethiopianCities.find(c => c.name === formData.city)?.subcities.map((subcity) => (
                      <option key={subcity} value={subcity}>
                        {subcity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Maps Link (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="mapUrl"
                      value={formData.mapUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://maps.google.com/?q=... or https://maps.app.goo.gl/..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Share your location via Google Maps link. Optional but helps customers find you.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Features</h2>
              <p className="text-sm text-gray-600 mb-4">Select all features that apply to your business</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {businessFeatures.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      const newFeatures = formData.features.includes(id)
                        ? formData.features.filter(f => f !== id)
                        : [...formData.features, id]
                      setFormData({ ...formData, features: newFeatures })
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      formData.features.includes(id)
                        ? 'border-[#006747] bg-[#D1EFE4] text-[#006747]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Images</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {isUploading ? 'Uploading...' : 'Choose Images'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload multiple images (JPEG, PNG, WebP - Max 5MB each)
                    </p>
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Business image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Street address or landmark"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="business@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href={session?.user?.role === 'ADMIN' ? '/admin/businesses' : '/dashboard/listings'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>{isLoading ? 'Creating Business...' : 'Create Business'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
