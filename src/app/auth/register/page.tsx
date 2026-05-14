'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Mail, User, Briefcase, Lock, Building2, Star, TrendingUp } from 'lucide-react'

export default function RegisterPage() {
  const [userType, setUserType] = useState<'USER' | 'BUSINESS_OWNER'>('USER')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
    if (success) setSuccess('')
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
        role: userType
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(userType === 'BUSINESS_OWNER'
          ? 'Registration successful! You can now add your business from the dashboard.'
          : 'Registration successful! Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2500)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1EFE4] to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#006747] hover:text-[#00523A] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">Create Your Account</h1>
          <p className="text-neutral-600">
            Join HelloET to discover amazing businesses across Ethiopia
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
          {/* Account Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-neutral-700 mb-3">Select Account Type</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setUserType('USER')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  userType === 'USER'
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
                onClick={() => setUserType('BUSINESS_OWNER')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  userType === 'BUSINESS_OWNER'
                    ? 'border-[#006747] bg-[#D1EFE4] text-[#006747]'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Business Owner</div>
                  <p className="text-sm text-neutral-600">Add & manage businesses later</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
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

            {/* Info for Business Owners */}
            {userType === 'BUSINESS_OWNER' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Business Owners:</strong> After registration, you can add your business details from your dashboard. No need to fill them now!
                </p>
              </div>
            )}

            {/* Terms */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-neutral-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#006747] hover:text-[#00523A] font-medium">
                Sign In
              </Link>
            </p>
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