'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Building2, MapPin, Phone, Mail, Globe, User, Briefcase, CheckCircle, X, Lock, Star, TrendingUp } from 'lucide-react'

export default function RegisterPage() {
  const [userType, setUserType] = useState<'user' | 'business'>('user')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    businessDescription: '',
    businessCity: '',
    businessSubcity: '',
    businessAddress: '',
    businessLatitude: '',
    businessLongitude: '',
    phone: '',
    businessWebsite: '',
    userType: 'user'
  })
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    { name: 'Hosaena', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Alamata', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Shire', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Adigrat', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Debre Tabor', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Ambo', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Gore', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Metu', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] },
    { name: 'Tepi', subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03'] }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value
    setFormData(prev => ({
      ...prev,
      businessCity: city,
      businessSubcity: ''
    }))
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

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        return data.fileUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...uploadedUrls])
      setSuccess(`${uploadedUrls.length} image(s) uploaded successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload images')
      setTimeout(() => setError(''), 3000)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required')
      return false
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (!formData.password) {
      setError('Password is required')
      return false
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (userType === 'business') {
      if (!formData.businessName.trim()) {
        setError('Business name is required')
        return false
      }
      if (!formData.businessType) {
        setError('Business type is required')
        return false
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required')
        return false
      }
      if (!formData.businessCity) {
        setError('City is required')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        userType: userType,
        ...(userType === 'business' && {
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          businessDescription: formData.businessDescription.trim(),
          businessCity: formData.businessCity,
          businessSubcity: formData.businessSubcity,
          businessAddress: formData.businessAddress.trim(),
          businessLatitude: formData.businessLatitude,
          businessLongitude: formData.businessLongitude,
          phone: formData.phone.trim(),
          businessWebsite: formData.businessWebsite.trim(),
          images: uploadedImages
        })
      }

      console.log('Registration data:', registrationData)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getSubcities = () => {
    const city = ethiopianCities.find(c => c.name === formData.businessCity)
    return city ? city.subcities : []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1EFE4] to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#006747] hover:text-[#00523A] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            {userType === 'business' ? 'Register Your Business' : 'Create Your Account'}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {userType === 'business' 
              ? 'Register your business on SmartFinder and connect with thousands of customers across Ethiopia. Your business will be created instantly!'
              : 'Join SmartFinder to discover amazing businesses and services across Ethiopia'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          {/* User Type Selection */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                userType === 'user'
                  ? 'border-[#006747] bg-[#D1EFE4] text-[#006747]'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <User className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Regular User</div>
                <p className="text-sm text-neutral-600">Browse and review businesses</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setUserType('business')}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                userType === 'business'
                  ? 'border-[#006747] bg-[#D1EFE4] text-[#006747]'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Business Owner</div>
                <p className="text-sm text-neutral-600">Manage business listings</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                {userType === 'business' ? 'Business Owner Information' : 'Personal Information'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information - Only show for business owners */}
            {userType === 'business' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Business Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                        placeholder="Your Business Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Business Type *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                        placeholder="+251 9XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Website (Optional)
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="url"
                        name="businessWebsite"
                        value={formData.businessWebsite}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Business Description
                    </label>
                    <textarea
                      name="businessDescription"
                      value={formData.businessDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      placeholder="Describe your business, services, and what makes you unique..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <select
                        name="businessCity"
                        value={formData.businessCity}
                        onChange={handleCityChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      >
                        <option value="">Select city</option>
                        {ethiopianCities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.businessCity && getSubcities().length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Subcity
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <select
                          name="businessSubcity"
                          value={formData.businessSubcity}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                        >
                          <option value="">Select subcity</option>
                          {getSubcities().map((subcity) => (
                            <option key={subcity} value={subcity}>
                              {subcity}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Detailed Address
                    </label>
                    <input
                      type="text"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
                      placeholder="Street name, building number, floor, etc."
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Business Images
                    </label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="w-full"
                      />
                      {isUploading && (
                        <p className="text-sm text-neutral-600 mt-2">Uploading...</p>
                      )}
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </div>
            )}

            {/* Terms and Submit */}
            <div className="space-y-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-[#006747] border-neutral-300 rounded focus:ring-[#006747]"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-neutral-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#006747] hover:text-[#00523A]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#006747] hover:text-[#00523A]">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : userType === 'business' ? 'Create Account & Business' : 'Create Account'}
                </button>
                
                <Link
                  href="/auth/login"
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#E6F2ED] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-[#006747]" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Reach More Customers</h3>
            <p className="text-sm text-neutral-600">Connect with thousands of customers looking for businesses in Ethiopia</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#E6F2ED] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-[#006747]" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Build Your Reputation</h3>
            <p className="text-sm text-neutral-600">Collect reviews and build trust with Ethiopian customers</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-[#E6F2ED] rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-[#006747]" />
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Grow Your Business</h3>
            <p className="text-sm text-neutral-600">Get insights and analytics to help your business grow</p>
          </div>
        </div>
      </div>
    </div>
  )
}