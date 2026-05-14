'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  Loader2,
  X,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Tag,
  FileText,
  CheckCircle2
} from 'lucide-react'

interface BusinessData {
  id: string
  slug: string
  name: string
  description?: string
  category: { name: string }
  city: { name: string }
  subcity?: { name: string }
  address?: string
  phone?: string
  email?: string
  website?: string
  mapUrl?: string
  features?: string[]
  images: Array<{ id: string; imageUrl: string }>
}

const businessFeatures = [
  { id: 'wifi', label: 'Free WiFi' },
  { id: 'parking', label: 'Parking' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'cardPayment', label: 'Card Payment' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'wheelchair', label: 'Wheelchair Accessible' },
  { id: 'familyFriendly', label: 'Family Friendly' },
  { id: 'liveMusic', label: 'Live Music' },
  { id: 'tv', label: 'TV' },
  { id: 'outdoorSeating', label: 'Outdoor Seating' },
  { id: 'coffeeShop', label: 'Coffee Shop' },
  { id: 'gym', label: 'Gym/Fitness' },
  { id: 'airportShuttle', label: 'Airport Shuttle' },
  { id: 'library', label: 'Library/Reading Area' },
  { id: 'security247', label: '24/7 Security' },
]

export default function EditBusiness() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    subcity: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    mapUrl: '',
    features: [] as string[],
    images: [] as string[]
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/dashboard/businesses/${businessId}`)
      const data = await res.json()
      
      if (data.success) {
        const b = data.data
        setFormData({
          name: b.name || '',
          description: b.description || '',
          category: b.category?.name || '',
          city: b.city?.name || '',
          subcity: b.subcity?.name || '',
          address: b.address || '',
          phone: b.phone || '',
          email: b.email || '',
          website: b.website || '',
          mapUrl: b.mapUrl || '',
          features: b.features || [],
          images: b.images?.map((img: any) => img.imageUrl) || []
        })
      } else {
        setError('Failed to load business')
      }
    } catch (err) {
      setError('Error loading business')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }))
    } catch (err) {
      setError('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/dashboard/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (data.success) {
        setSuccess('Business updated successfully!')
        setTimeout(() => {
          router.push('/dashboard/listings')
        }, 1500)
      } else {
        setError(data.error || 'Failed to update business')
      }
    } catch (err) {
      setError('Error updating business')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#006747]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/dashboard/listings"
          className="p-2 text-neutral-600 hover:text-[#006747] hover:bg-[#D1EFE4] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Edit Business</h1>
          <p className="text-neutral-600">Update your business information</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-[#006747]" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Category *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#006747]" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Subcity/Area
              </label>
              <input
                type="text"
                name="subcity"
                value={formData.subcity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Google Maps Link
              </label>
              <input
                type="url"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Business Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {businessFeatures.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleFeatureToggle(id)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.features.includes(id)
                    ? 'border-[#006747] bg-[#D1EFE4] text-[#006747]'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Business Images</h2>
          
          <div className="mb-4">
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
              className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Add Images'}
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/dashboard/listings"
            className="px-6 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-6 py-2 bg-[#006747] text-white rounded-lg hover:bg-[#005737] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
