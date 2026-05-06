'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Save, AlertCircle, X } from 'lucide-react'

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

export default function NewBusinessPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    subcity: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: ''
  })
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

    try {
      // Get user from localStorage (in production, use proper auth)
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setError('You must be logged in to add a business')
        setIsLoading(false)
        return
      }

      const user = JSON.parse(userStr)
      
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
          ownerId: user.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess('Business created successfully!')
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          city: '',
          subcity: '',
          address: '',
          latitude: '',
          longitude: '',
          phone: '',
          email: '',
          website: ''
        })

        // Redirect after a delay
        setTimeout(() => {
          window.location.href = '/dashboard/listings'
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="9.0242"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="38.7468"
                  />
                </div>
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
                href="/dashboard/listings"
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
