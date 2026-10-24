'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, User, AlertCircle } from 'lucide-react'
import { GoogleIcon } from '@/components/icons/GoogleIcon'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  const errorParam = searchParams?.get('error')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback') {
      setError('Google sign-in could not be completed. Please ensure your Google OAuth credentials are configured or try again.')
    } else if (errorParam === 'AccessDenied') {
      setError('Google sign-in was cancelled or access was denied.')
    } else if (errorParam) {
      setError(`Authentication error: ${errorParam}`)
    }
  }, [errorParam])

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')
    try {
      await signIn('google', {
        callbackUrl: callbackUrl && callbackUrl !== '/' ? callbackUrl : '/'
      })
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError('Failed to initiate Google sign-in. Please try again.')
      setIsGoogleLoading(false)
    }
  }

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

      // Redirect logic based on role
      const role = session?.user?.role
      if (role === 'ADMIN') {
        window.location.href = '/admin'
      } else if (role === 'BUSINESS_OWNER') {
        window.location.href = '/dashboard'
      } else if (callbackUrl && callbackUrl !== '/') {
        window.location.href = callbackUrl
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DCFCE7] to-[#F5FBF8] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#16A34A] hover:text-[#166534] transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#16A34A] rounded-lg flex items-center justify-center">
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

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-medium rounded-xl border border-neutral-300 shadow-sm transition-all hover:shadow hover:border-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed mb-6 group cursor-pointer"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105" />
            )}
            <span className="text-sm font-semibold">
              {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">
              Or continue with email
            </span>
          </div>

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
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
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
                  className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
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
                  className="w-4 h-4 text-[#16A34A] border-neutral-300 rounded focus:ring-[#16A34A]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-neutral-600">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-[#16A34A] hover:text-[#166534]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#16A34A] hover:bg-[#166534] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[#16A34A] hover:text-[#166534] font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-[#16A34A]" />
              <div>
                <h4 className="font-semibold text-neutral-800">Personal Account</h4>
                <p className="text-sm text-neutral-600">Browse businesses and leave reviews</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-[#16A34A]" />
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
      <div className="min-h-screen bg-gradient-to-br from-[#DCFCE7] to-[#F5FBF8] py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A] mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
