'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, User, AlertCircle } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      // Use NextAuth signIn without redirect first to check role
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Login failed. Please check your credentials.')
        setIsLoading(false)
        return
      }

      // Get session to check user role
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()

      // Redirect logic:
      // - Business owners → Dashboard (to manage their business)
      // - Regular users → Stay on homepage (or go to callbackUrl if coming from review)
      if (session?.user?.role === 'BUSINESS_OWNER') {
        window.location.href = '/dashboard'
      } else if (callbackUrl && callbackUrl !== '/') {
        // Only redirect regular users if they came from a specific page (like writing a review)
        window.location.href = callbackUrl
      } else {
        // Regular users: stay on home page
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1EFE4] to-[#F5FBF8] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#006747] hover:text-[#00523A] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#006747] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Welcome Back</h1>
              <p className="text-neutral-600">Sign in to your HelloET account</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          {/* Redirect indicator */}
          {callbackUrl !== '/' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                After signing in, you&apos;ll be redirected back to continue your review
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Login Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
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
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
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
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-[#006747] border-neutral-300 rounded focus:ring-[#006747]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-neutral-600">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-[#006747] hover:text-[#00523A]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[#006747] hover:text-[#00523A] font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Demo Accounts</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-blue-800">Business Owner:</p>
              <p className="text-blue-700">Email: business@helloet.com</p>
              <p className="text-blue-700">Password: demo123</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Regular User:</p>
              <p className="text-blue-700">Email: user@helloet.com</p>
              <p className="text-blue-700">Password: demo123</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFormData({
                email: 'business@helloet.com',
                password: 'demo123'
              })
            }}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Fill with Demo Account
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-[#006747]" />
              <div>
                <h4 className="font-semibold text-neutral-800">Personal Account</h4>
                <p className="text-sm text-neutral-600">Browse businesses and leave reviews</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-[#006747]" />
              <div>
                <h4 className="font-semibold text-neutral-800">Business Account</h4>
                <p className="text-sm text-neutral-600">Manage your business listings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#D1EFE4] to-[#F5FBF8] py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006747] mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
