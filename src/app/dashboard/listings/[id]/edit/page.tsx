'use client'

import { useState, useEffect, useRef } from 'react'
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
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ArrowRight,
  Star
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [uploadCount, setUploadCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/dashboard/businesses/${businessId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        const b = data.data
        const extractedImages: string[] = Array.isArray(b.images)
          ? b.images
              .map((img: any) => {
                if (typeof img === 'string') return img
                return img.imageUrl || img.url || ''
              })
              .filter(Boolean)
          : []

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
          features: Array.isArray(b.features) ? b.features : [],
          images: extractedImages
        })
      } else {
        setError(data.error || 'Failed to load business')
      }
    } catch (err) {
      console.error('Error fetching business:', err)
      setError('Error loading business information')
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

  // Upload multiple files simultaneously
  const uploadFiles = async (filesToUpload: FileList | File[]) => {
    const rawFiles = Array.from(filesToUpload)
    const validFiles = rawFiles.filter(f => f.type.startsWith('image/'))

    if (validFiles.length === 0) {
      setError('Please select valid image files (JPEG, PNG, WebP, etc.).')
      return
    }

    setIsUploading(true)
    setUploadCount(validFiles.length)
    setError('')

    try {
      const uploadFormData = new FormData()
      validFiles.forEach(file => {
        uploadFormData.append('files', file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload images')
      }

      // Gather returned URLs (supporting multi-URL and single-URL formats)
      const newUrls: string[] = []
      if (Array.isArray(data.urls) && data.urls.length > 0) {
        newUrls.push(...data.urls)
      } else if (Array.isArray(data.fileUrls) && data.fileUrls.length > 0) {
        newUrls.push(...data.fileUrls)
      } else if (data.url || data.fileUrl) {
        newUrls.push(data.url || data.fileUrl)
      }

      if (newUrls.length === 0) {
        throw new Error('Server did not return image URLs.')
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newUrls]
      }))
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err?.message || 'Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadCount(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const setCoverImage = (index: number) => {
    if (index === 0) return
    setFormData(prev => {
      const list = [...prev.images]
      const [target] = list.splice(index, 1)
      list.unshift(target)
      return { ...prev, images: list }
    })
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formData.images.length) return

    setFormData(prev => {
      const list = [...prev.images]
      const temp = list[index]
      list[index] = list[targetIndex]
      list[targetIndex] = temp
      return { ...prev, images: list }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) {
      setError('Please wait for images to finish uploading before saving.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // Ensure only valid URLs are sent
      const cleanImages = formData.images
        .filter(url => typeof url === 'string' && url.trim().length > 0)

      const payload = {
        ...formData,
        images: cleanImages
      }

      const res = await fetch(`/api/dashboard/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      
      if (data.success) {
        setSuccess('Business details and images updated successfully!')
        // Refresh local state with clean images
        setFormData(prev => ({ ...prev, images: cleanImages }))
        setTimeout(() => {
          router.push('/dashboard/listings')
        }, 1500)
      } else {
        setError(data.error || data.message || 'Failed to update business')
      }
    } catch (err: any) {
      console.error('Error saving business:', err)
      setError('Error updating business. Please check connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#16A34A]" />
        <p className="text-sm font-medium text-neutral-500">Loading business information...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/dashboard/listings"
          className="p-2.5 text-neutral-600 hover:text-[#16A34A] hover:bg-[#DCFCE7] rounded-xl transition-colors border border-neutral-200 bg-white shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Edit Business</h1>
          <p className="text-sm text-neutral-500">Update your business profile, images, and details</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-[#15803D] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#16A34A]" />
          <div className="text-sm font-medium">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-[#16A34A]" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Images (Multi-upload & Reordering) */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-800 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-[#16A34A]" />
                Business Images
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Select and upload multiple photos at once. The first image will be used as the cover photo.
              </p>
            </div>
            {formData.images.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full border border-green-200">
                {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'}
              </span>
            )}
          </div>
          
          {/* Hidden File Input supporting multiple files */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
            onChange={handleFileInputChange}
            disabled={isUploading}
            className="hidden"
            id="multi-image-upload"
          />

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#16A34A] bg-[#DCFCE7]/40 scale-[1.01]'
                : 'border-neutral-300 hover:border-[#16A34A] hover:bg-neutral-50/80'
            } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center justify-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#16A34A] animate-spin mb-2" />
                  <p className="text-sm font-semibold text-neutral-800">
                    Uploading {uploadCount > 1 ? `${uploadCount} images...` : 'image...'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">Please wait while images are being saved.</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-2.5">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">
                    Click to select multiple images or drag & drop here
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Accepts JPEG, PNG, WebP, GIF (up to 10MB each) • Select as many as you need
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Images Grid */}
          {formData.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div 
                  key={`${url}-${index}`} 
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                    index === 0 
                      ? 'border-[#16A34A] shadow-md ring-2 ring-[#16A34A]/20' 
                      : 'border-neutral-200 hover:border-neutral-300 shadow-sm'
                  }`}
                >
                  <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                    <img
                      src={url}
                      alt={`Business image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback placeholder if image link fails to render
                        e.currentTarget.src = '/logo-icon.svg'
                      }}
                    />

                    {/* Gradient Overlay for Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex items-center justify-between">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCoverImage(index)
                            }}
                            title="Set as cover photo"
                            className="bg-white/90 hover:bg-white text-neutral-800 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow"
                          >
                            <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                            Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          title="Remove image"
                          className="ml-auto bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Move Left / Right Controls */}
                      <div className="flex items-center justify-between gap-1 pt-2">
                        {index > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveImage(index, 'left')
                            }}
                            title="Move left"
                            className="bg-white/80 hover:bg-white text-neutral-800 rounded p-1 shadow"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : <div />}
                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveImage(index, 'right')
                            }}
                            title="Move right"
                            className="bg-white/80 hover:bg-white text-neutral-800 rounded p-1 shadow"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cover Photo Badge on First Item */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-[#16A34A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-white" />
                        Cover
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#16A34A]" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Subcity/Area
              </label>
              <input
                type="text"
                name="subcity"
                value={formData.subcity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Google Maps Link
              </label>
              <input
                type="url"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Business Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {businessFeatures.map(({ id, label }) => {
              const isSelected = formData.features.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleFeatureToggle(id)}
                  className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all text-center ${
                    isSelected
                      ? 'border-[#16A34A] bg-[#DCFCE7] text-[#15803D] shadow-sm'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <Link
            href="/dashboard/listings"
            className="px-6 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="flex items-center px-6 py-2.5 bg-[#16A34A] text-white text-sm font-bold rounded-xl hover:bg-[#15803D] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
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

