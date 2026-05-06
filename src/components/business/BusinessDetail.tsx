'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Star, MapPin, Phone, Globe, Clock, ChevronLeft, ChevronRight, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'

// Dynamic import for Leaflet Map component (must be outside component to avoid hook issues)
import type { MapComponentProps } from './MapComponent'
const MapComponent = dynamic<MapComponentProps>(() => import('./MapComponent').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-neutral-100 rounded-xl">
      <div className="text-neutral-500">Loading map...</div>
    </div>
  )
})

interface Business {
  id: number
  slug: string
  name: string
  description: string
  category: {
    id: number
    name: string
  }
  city: {
    id: number
    name: string
  }
  subcity?: {
    id: number
    name: string
  }
  address?: string
  phone?: string
  email?: string
  website?: string
  verified: boolean
  latitude?: number
  longitude?: number
  images: Array<{
    id: number
    imageUrl: string
    sortOrder: number
  }>
  hours: Array<{
    id: number
    day: string
    openTime?: string
    closeTime?: string
    isClosed: boolean
  }>
  reviews: Array<{
    id: number
    rating: number
    comment?: string
    createdAt: string
    user: {
      id: number
      name: string
    }
  }>
  averageRating: number
  totalReviews: number
  nearbyBusinesses: Array<{
    id: number
    slug: string
    name: string
    category: string
    location: string
    image?: string
    rating: number
    reviewCount: number
  }>
}

export default function BusinessDetail({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Load saved review from localStorage on mount
  useEffect(() => {
    fetchBusiness()
    
    // Check for saved review data
    const savedReview = localStorage.getItem(`review-${slug}`)
    if (savedReview) {
      const { rating, comment } = JSON.parse(savedReview)
      setReviewRating(rating)
      setReviewComment(comment)
    }
  }, [slug])

  // Save review to localStorage
  const saveReviewToStorage = () => {
    if (reviewRating > 0 || reviewComment) {
      localStorage.setItem(`review-${slug}`, JSON.stringify({
        rating: reviewRating,
        comment: reviewComment,
        timestamp: Date.now()
      }))
    }
  }

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`/api/business/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setBusiness(data.data)
      } else {
        setError(data.error || 'Failed to fetch business')
      }
    } catch (err) {
      setError('Failed to fetch business')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (reviewRating === 0) {
      setReviewError('Please select a rating')
      return
    }

    if (!session?.user?.id) {
      setReviewError('Please sign in to submit a review')
      return
    }

    setSubmittingReview(true)
    setReviewError(null)

    try {
      const response = await fetch(`/api/business/${slug}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          userId: session.user.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setReviewSuccess(true)
        setReviewRating(0)
        setReviewComment('')
        // Clear saved review from localStorage
        localStorage.removeItem(`review-${slug}`)
        // Refresh business data to show new review
        fetchBusiness()
      } else {
        setReviewError(data.error || 'Failed to submit review')
      }
    } catch (err) {
      setReviewError('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const nextImage = () => {
    if (business && business.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % business.images.length)
    }
  }

  const prevImage = () => {
    if (business && business.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? business.images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Business Not Found</h1>
          <p className="text-neutral-600 mb-6">{error || 'The business you are looking for could not be found.'}</p>
          <a href="/" className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      {/* Hero Image Gallery */}
      <div className="relative h-[400px] lg:h-[500px] bg-neutral-100 overflow-hidden">
        {business.images.length > 0 ? (
          <>
            <img
              src={business.images[currentImageIndex].imageUrl}
              alt={business.name}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {business.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6 text-neutral-700" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {business.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-neutral-100 to-neutral-200">
            <div className="text-center text-neutral-500">
              <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-neutral-300 rounded-xl"></div>
              </div>
              <p className="text-lg font-medium">No images available</p>
            </div>
          </div>
        )}
        
        {business.verified && (
          <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified Business
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Business Info Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-3">{business.name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                      {business.category.name}
                    </span>
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-neutral-700">{business.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-neutral-500">({business.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-neutral-600 bg-neutral-50 p-4 rounded-xl mb-6">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <span className="text-lg">
                  {business.city.name}
                  {business.subcity && `, ${business.subcity.name}`}
                  {business.address && ` • ${business.address}`}
                </span>
              </div>

              {business.description && (
                <div className="border-t border-neutral-100 pt-6">
                  <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-sm">ℹ</span>
                    </span>
                    About
                  </h2>
                  <p className="text-neutral-600 leading-relaxed text-lg">{business.description}</p>
                </div>
              )}
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 mb-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.phone && (
                  <a 
                    href={`tel:${business.phone}`} 
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-green-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">Phone</div>
                      <div className="font-semibold text-neutral-800">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a 
                    href={`mailto:${business.email}`} 
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <span className="text-blue-600 font-bold text-lg">@</span>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">Email</div>
                      <div className="font-semibold text-neutral-800 text-sm">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.website && (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-purple-50 transition-colors group md:col-span-2"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500">Website</div>
                      <div className="font-semibold text-neutral-800">{business.website}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Business Hours Card */}
            {business.hours.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 mb-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </span>
                  Business Hours
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {business.hours.map((hour) => (
                    <div 
                      key={hour.id} 
                      className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <span className="font-medium text-neutral-700">{dayNames[parseInt(hour.day) - 1]}</span>
                      <span className={`font-semibold ${hour.isClosed ? 'text-red-500' : 'text-green-600'}`}>
                        {hour.isClosed ? 'Closed' : 
                         hour.openTime && hour.closeTime ? 
                         `${hour.openTime} - ${hour.closeTime}` : 'Open 24 Hours'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
              <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </span>
                Reviews
                <span className="ml-auto bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {business.totalReviews}
                </span>
              </h2>
              {/* Review Form */}
              {session?.user && (
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100 mb-6">
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Write a Review</h3>
                  
                  {reviewSuccess ? (
                    <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center">
                      <p className="font-semibold">Thank you for your review!</p>
                      <p className="text-sm">Your review has been submitted successfully.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Star Rating */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= (hoverRating || reviewRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-neutral-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                          {(hoverRating || reviewRating) > 0 && ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][(hoverRating || reviewRating) - 1]}
                        </p>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Your Review (Optional)</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this business..."
                          rows={4}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {reviewError && (
                        <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm">
                          {reviewError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewRating === 0 || submittingReview}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {!session?.user && (
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100 mb-6">
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Write a Review</h3>
                  
                  {/* Star Rating - Clickable to save */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setReviewRating(star)
                            localStorage.setItem(`review-${slug}`, JSON.stringify({
                              rating: star,
                              comment: reviewComment,
                              timestamp: Date.now()
                            }))
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || reviewRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      {(hoverRating || reviewRating) > 0 && ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][(hoverRating || reviewRating) - 1]}
                    </p>
                  </div>

                  {/* Comment - Auto-saves on change */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Your Review (Optional)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => {
                        const newComment = e.target.value
                        setReviewComment(newComment)
                        // Auto-save to localStorage
                        localStorage.setItem(`review-${slug}`, JSON.stringify({
                          rating: reviewRating,
                          comment: newComment,
                          timestamp: Date.now()
                        }))
                      }}
                      placeholder="Share your experience with this business..."
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <p className="text-neutral-600 mb-3 text-center text-sm">
                    {reviewRating > 0 ? 'Your review is saved! ' : ''}Sign in to submit your review
                  </p>
                  <a 
                    href={`/auth/login?callbackUrl=${encodeURIComponent(`/business/${slug}`)}`}
                    className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors w-full justify-center"
                  >
                    Sign In to Submit
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Existing Reviews */}
              {business.reviews.length > 0 ? (
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {review.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-neutral-800">{review.user.name}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-neutral-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-neutral-500 bg-white px-3 py-1 rounded-full shadow-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-neutral-600 leading-relaxed bg-white p-4 rounded-xl">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-neutral-50 rounded-xl">
                  <Star className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500 text-lg">No reviews yet. Be the first to review this business!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 mb-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {business.phone && (
                  <a 
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>
                )}
                <a 
                  href={`/businesses?category=${encodeURIComponent(business.category.name)}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
                >
                  <MapPin className="w-5 h-5" />
                  Similar Businesses
                </a>
              </div>
            </div>

            {/* Location Map Card */}
            {business.latitude && business.longitude && (
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary-500" />
                  Location
                </h3>
                <div className="h-64 rounded-xl overflow-hidden border border-neutral-200">
                  <MapComponent 
                    lat={business.latitude} 
                    lng={business.longitude} 
                    name={business.name}
                  />
                </div>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            )}

            {/* Nearby Businesses Card */}
            {business.nearbyBusinesses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6">
                <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Nearby Businesses
                </h3>
                <div className="space-y-4">
                  {business.nearbyBusinesses.map((nearby) => (
                    <a 
                      key={nearby.id} 
                      href={`/business/${nearby.slug}`}
                      className="flex gap-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                    >
                      <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                        {nearby.image ? (
                          <img
                            src={nearby.image}
                            alt={nearby.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <div className="w-8 h-8 bg-neutral-300 rounded-lg"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors truncate">
                          {nearby.name}
                        </div>
                        <div className="text-sm text-neutral-500 mb-1">{nearby.category}</div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{nearby.rating.toFixed(1)}</span>
                          <span className="text-neutral-400">({nearby.reviewCount})</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
