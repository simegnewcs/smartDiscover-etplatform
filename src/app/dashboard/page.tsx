'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  Building2, 
  TrendingUp, 
  Star, 
  Eye, 
  Phone, 
  MessageSquare,
  Calendar,
  Users,
  ArrowUpRight,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  Heart,
  Search,
  Settings,
  History,
  Award,
  Bookmark
} from 'lucide-react'

interface Business {
  id: string
  name: string
  category: string
  city: string
  rating: number
  reviewCount: number
  images: { imageUrl: string }[]
  verified: boolean
  createdAt: string
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: { name: string }
}

// User Dashboard Component
function UserDashboard({ session }: { session: any }) {
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    savedBusinesses: 0,
    recentSearches: 0,
    accountAge: 0
  })
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [savedBusinesses, setSavedBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [session])

  const fetchUserData = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      // Fetch user's reviews
      const reviewsRes = await fetch(`/api/user/reviews?userId=${session.user.id}`)
      const reviewsData = await reviewsRes.json()
      if (reviewsData.success) {
        setMyReviews(reviewsData.data || [])
      }

      // TODO: Add API endpoints for saved businesses and search history
      setUserStats(prev => ({
        ...prev,
        totalReviews: reviewsData.data?.length || 0
      }))
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#006747] animate-spin" />
        <span className="ml-2 text-neutral-600">Loading your dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Welcome, {session?.user?.name?.split(' ')[0] || 'Explorer'}!</h1>
          <p className="text-neutral-600 mt-1">Discover amazing businesses across Ethiopia.</p>
        </div>
        <Link 
          href="/businesses"
          className="flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Search className="w-4 h-4" />
          Explore Businesses
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-[#006747]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{userStats.totalReviews}</div>
          <div className="text-sm text-neutral-600 mt-1">Your Reviews</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#EEF578] rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#006747]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{userStats.savedBusinesses}</div>
          <div className="text-sm text-neutral-600 mt-1">Saved Businesses</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-[#006747]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{userStats.recentSearches}</div>
          <div className="text-sm text-neutral-600 mt-1">Recent Searches</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#EEF578] rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-[#006747]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">Explorer</div>
          <div className="text-sm text-neutral-600 mt-1">Member Level</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">My Reviews</h3>
            <Link href="/my-reviews" className="text-sm text-[#006747] hover:text-[#00523A] transition-colors">
              View All
            </Link>
          </div>
          
          {myReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-3">No reviews yet</p>
              <Link 
                href="/businesses"
                className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                Find Businesses to Review
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 line-clamp-2">{review.comment || 'No comment'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500">{review.business?.name || 'Unknown Business'}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[#D1EFE4] to-white rounded-xl shadow-sm border border-[#D1EFE4] p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/businesses" className="flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-[#006747]" />
              </div>
              <div className="text-left">
                <div className="font-medium text-neutral-800">Find Businesses</div>
                <div className="text-sm text-neutral-600">Discover new places</div>
              </div>
            </Link>
            
            <Link href="/saved" className="flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-[#EEF578] rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-[#006747]" />
              </div>
              <div className="text-left">
                <div className="font-medium text-neutral-800">Saved Places</div>
                <div className="text-sm text-neutral-600">Your favorite businesses</div>
              </div>
            </Link>
            
            <Link href="/profile" className="flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#006747]" />
              </div>
              <div className="text-left">
                <div className="font-medium text-neutral-800">Profile Settings</div>
                <div className="text-sm text-neutral-600">Manage your account</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Business Owner Dashboard Component
function BusinessOwnerDashboard({ session }: { session: any }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalViews: 1247,
    totalCalls: 89,
    totalMessages: 34,
    averageRating: 0,
    profileCompletion: 75,
    totalBusinesses: 0,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [session])

  const fetchDashboardData = async () => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    try {
      // Fetch user's businesses
      const response = await fetch(`/api/user/businesses?userId=${session.user.id}`)
      const data = await response.json()

      if (data.success) {
        const userBusinesses = data.data || []
        setBusinesses(userBusinesses)
        
        // Calculate stats
        const totalReviews = userBusinesses.reduce((acc: number, b: Business) => acc + (b.reviewCount || 0), 0)
        const avgRating = userBusinesses.length > 0 
          ? userBusinesses.reduce((acc: number, b: Business) => acc + (b.rating || 0), 0) / userBusinesses.length 
          : 0

        setStats(prev => ({
          ...prev,
          totalBusinesses: userBusinesses.length,
          totalReviews,
          averageRating: avgRating
        }))

        // Fetch recent reviews from all businesses
        const allReviews: Review[] = []
        for (const business of userBusinesses.slice(0, 3)) {
          try {
            const reviewRes = await fetch(`/api/business/${business.id}/reviews`)
            const reviewData = await reviewRes.json()
            if (reviewData.success && reviewData.data) {
              allReviews.push(...reviewData.data.slice(0, 3))
            }
          } catch (e) {
            console.error('Error fetching reviews:', e)
          }
        }
        setRecentReviews(allReviews.slice(0, 5))
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Your Businesses',
      value: stats.totalBusinesses,
      change: 'Total',
      changeType: 'neutral' as const,
      icon: Building2,
      color: 'bg-[#006747]',
      href: '/dashboard/listings'
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      change: '+New',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'bg-purple-500',
      href: '#reviews'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      change: stars(stats.averageRating),
      changeType: 'positive' as const,
      icon: Star,
      color: 'bg-yellow-500',
      href: '#reviews'
    },
    {
      title: 'Profile Completion',
      value: `${stats.profileCompletion}%`,
      change: 'Complete',
      changeType: 'neutral' as const,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/dashboard/listings'
    }
  ]

  function stars(rating: number) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#006747] animate-spin" />
        <span className="ml-2 text-neutral-600">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Welcome, {session?.user?.name?.split(' ')[0] || 'Business Owner'}!</h1>
          <p className="text-neutral-600 mt-1">Here's what's happening with your businesses today.</p>
        </div>
        <Link 
          href="/dashboard/businesses/new"
          className="flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Business
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const Wrapper = stat.href ? Link : 'div'
          return (
            <Wrapper 
              key={index} 
              href={stat.href || '#'}
              className={`bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow ${stat.href ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-neutral-500'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-800">{stat.value}</div>
              <div className="text-sm text-neutral-600 mt-1 flex items-center gap-1">
                {stat.title}
                {stat.href && <ArrowUpRight className="w-3 h-3" />}
              </div>
            </Wrapper>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Businesses */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">My Businesses</h3>
            <Link href="/dashboard/listings" className="text-sm text-[#006747] hover:text-[#00523A] transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          {businesses.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-3">No businesses yet</p>
              <Link 
                href="/dashboard/businesses/new"
                className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Your First Business
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={business.id} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                    {business.images?.[0]?.imageUrl ? (
                      <img 
                        src={business.images[0].imageUrl} 
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-neutral-800 truncate">{business.name}</h4>
                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {business.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{business.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-neutral-500">({business.reviewCount || 0})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-white rounded-full text-neutral-600 border border-neutral-200">
                        {business.category}
                      </span>
                      {business.verified && (
                        <span className="text-xs px-2 py-1 bg-green-100 rounded-full text-green-700">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6" id="reviews">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800">Recent Reviews</h3>
          </div>
          
          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 line-clamp-2">{review.comment || 'No comment'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500">{review.user?.name}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#D1EFE4] to-white rounded-xl shadow-sm border border-[#D1EFE4] p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/businesses/new" className="flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-[#D1EFE4] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#006747]" />
            </div>
            <div className="text-left">
              <div className="font-medium text-neutral-800">Add New Listing</div>
              <div className="text-sm text-neutral-600">Expand your presence</div>
            </div>
          </Link>
          <Link href="/dashboard/listings" className="flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-neutral-800">Manage Listings</div>
              <div className="text-sm text-neutral-600">Update your businesses</div>
            </div>
          </Link>
          <Link href="/businesses" className="flex items-center space-x-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-neutral-800">Browse All</div>
              <div className="text-sm text-neutral-600">See all businesses</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component - Routes to appropriate dashboard based on user role
export default function DashboardOverview() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#006747] animate-spin" />
        <span className="ml-2 text-neutral-600">Loading...</span>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard')
    return null
  }

  // Route to appropriate dashboard based on user role
  const userRole = session?.user?.role

  if (userRole === 'BUSINESS_OWNER') {
    return <BusinessOwnerDashboard session={session} />
  }

  // Default to User Dashboard for regular users and admins
  return <UserDashboard session={session} />
}
