'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RotateCw, ArrowLeft, ShieldCheck } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendStatus, setResendStatus] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // If token is in the URL, verify automatically
  useEffect(() => {
    if (token) {
      handleAutoVerify(token, emailParam)
    }
  }, [token, emailParam])

  const handleAutoVerify = async (tok: string, mail: string) => {
    setIsVerifying(true)
    setError('')
    try {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(tok)}&email=${encodeURIComponent(mail)}`)
      const data = await res.json()

      if (res.ok && data.success) {
        setIsSuccess(true)
      } else {
        setError(data.message || 'Invalid or expired verification link.')
      }
    } catch (err) {
      setError('Network error while verifying email. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please provide your email address.')
      return
    }
    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.')
      return
    }

    setIsVerifying(true)
    setError('')
    setResendStatus('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setIsSuccess(true)
      } else {
        setError(data.message || 'Verification failed. Please check your code.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address to resend.')
      return
    }

    setIsResending(true)
    setError('')
    setResendStatus('')

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setResendStatus('A new verification email has been sent! Check your inbox and spam folder.')
        setCountdown(60)
      } else {
        setError(data.message || 'Failed to resend email.')
      }
    } catch (err) {
      setError('Failed to resend. Please check your connection.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DCFCE7] to-[#F5FBF8] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Back Link */}
        <div className="text-center mb-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 text-[#16A34A] hover:text-[#166534] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Sign In</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          {/* Top Brand Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#16A34A] to-[#22C55E] rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-green-200 mb-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs uppercase tracking-wider text-[#16A34A] font-bold">
              DevVoltz Technology
            </p>
            <h1 className="text-2xl font-bold text-neutral-800 mt-1">
              Email Verification
            </h1>
          </div>

          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#16A34A]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-neutral-800">
                Email Verified Successfully!
              </h2>
              <p className="text-sm text-neutral-600">
                Your email address has been verified. Your account is now active and ready to use on HelloET.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#166534] text-white px-6 py-3.5 rounded-xl font-semibold shadow-md transition-all"
                >
                  <span>Continue to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : isVerifying && token ? (
            /* VERIFYING URL TOKEN STATE */
            <div className="text-center py-10 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#16A34A] border-t-transparent mx-auto" />
              <p className="text-neutral-700 font-medium">
                Verifying your email with DevVoltz Technology...
              </p>
            </div>
          ) : (
            /* MANUAL CODE / ACTION FORM */
            <div className="space-y-6">
              {emailParam && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Check your inbox:</span> We sent a verification email from <strong>DevVoltz Technology</strong> to <span className="font-mono font-semibold">{emailParam}</span>.
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>{error}</div>
                </div>
              )}

              {resendStatus && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                  <div>{resendStatus}</div>
                </div>
              )}

              <form onSubmit={handleManualCodeSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-neutral-700">
                      6-Digit Verification Code
                    </label>
                    <span className="text-xs text-neutral-400">From DevVoltz Email</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-[#16A34A] text-center tracking-[0.5em] text-2xl font-mono font-bold text-neutral-800"
                  />
                  <p className="text-xs text-neutral-500 mt-1.5 text-center">
                    Click the link in the email or enter the 6 digits above
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || code.length !== 6}
                  className="w-full bg-[#16A34A] hover:bg-[#166534] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </form>

              {/* Resend Section */}
              <div className="pt-4 border-t border-neutral-100 text-center space-y-2">
                <p className="text-xs text-neutral-500">
                  Didn&apos;t receive the email? Check spam or resend:
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A] hover:text-[#166534] disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend verification email'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          DevVoltz Technology Security System • HelloET
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#DCFCE7] to-[#F5FBF8] py-12 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#16A34A] border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
