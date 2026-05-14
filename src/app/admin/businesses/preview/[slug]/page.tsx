'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, MapPin, Phone,
  Mail, Globe, Star, Clock, Building2, AlertTriangle, BadgeCheck
} from 'lucide-react'

interface Business {
  id: string
  name: string
  slug: string
  description?: string
  verified: boolean
  phone?: string
  email?: string
  website?: string
  address?: string
  category?: { name: string }
  city?: { name: string }
  subcity?: { name: string }
  images?: { imageUrl: string }[]
  averageRating: number
  totalReviews: number
  features?: string[]
  owner?: { id: string; name: string; email: string } | null
}

export default function AdminBusinessPreviewPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetch(`/api/business/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setBusiness(d.data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const handleVerify = async (verify: boolean) => {
    if (!business) return
    setVerifying(true)
    try {
      const res = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: verify })
      })
      const data = await res.json()
      if (data.success) {
        setBusiness(prev => prev ? { ...prev, verified: verify } : prev)
      }
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#EEF578] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !business) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Business not found</h2>
        <Link href="/admin/businesses" className="text-[#EEF578] hover:underline text-sm">
          ← Back to businesses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + status bar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/businesses" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Businesses
        </Link>
        <div className="flex items-center gap-3">
          {business.verified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 text-sm font-medium">
              <BadgeCheck className="w-4 h-4" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 text-sm font-medium">
              <Clock className="w-4 h-4" /> Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Pending alert */}
      {!business.verified && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-300 font-medium text-sm">Awaiting your review</p>
            <p className="text-orange-400/70 text-xs mt-0.5">This business was submitted by the owner and is not yet visible to the public. Review the details below, then verify or reject it.</p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        {/* Cover image */}
        {business.images && business.images.length > 0 ? (
          <div className="h-56 overflow-hidden">
            <img src={business.images[0].imageUrl} alt={business.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-40 bg-neutral-800 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-neutral-600" />
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Name + rating */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-neutral-400">
                {business.category?.name && <span className="px-2 py-0.5 bg-neutral-800 rounded-full">{business.category.name}</span>}
                {business.city?.name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {business.city.name}
                    {business.subcity?.name && `, ${business.subcity.name}`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-medium">{business.averageRating.toFixed(1)}</span>
              <span className="text-neutral-500 text-sm">({business.totalReviews})</span>
            </div>
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-neutral-400 text-sm leading-relaxed">{business.description}</p>
          )}

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {business.phone && (
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                {business.phone}
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                {business.email}
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <Globe className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-[#EEF578] hover:underline truncate">
                  {business.website}
                </a>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                {business.address}
              </div>
            )}
          </div>

          {/* Features */}
          {business.features && business.features.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {business.features.map((f: string) => (
                  <span key={f} className="px-2.5 py-1 bg-neutral-800 rounded-full text-xs text-neutral-300">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Owner info */}
          {business.owner && (
            <div className="pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Submitted by</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-300">{business.owner.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{business.owner.name}</div>
                  <div className="text-xs text-neutral-500">{business.owner.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {!business.verified ? (
          <>
            <button
              onClick={() => handleVerify(true)}
              disabled={verifying}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve & Verify
            </button>
            <button
              onClick={() => router.push('/admin/businesses')}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-colors"
            >
              Review Later
            </button>
          </>
        ) : (
          <button
            onClick={() => handleVerify(false)}
            disabled={verifying}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded-xl font-medium transition-colors disabled:opacity-60"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Revoke Verification
          </button>
        )}
      </div>
    </div>
  )
}
