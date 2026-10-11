'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
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
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Compass,
  Briefcase,
  Share2,
  ShieldCheck
} from 'lucide-react'

// ========================================================
// 1. REGULAR USER / EXPLORER DASHBOARD COMPONENT
// ========================================================
function UserDashboard({ session }: { session: any }) {
  const isAdmin = session?.user?.role === 'ADMIN'
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    savedBusinesses: 0,
    recentSearches: 0,
    memberLevel: 'Explorer',
    accountAgeDays: 0
  })
  const [myReviews, setMyReviews] = useState<any[]>([])
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
      const res = await fetch('/api/dashboard/overview')
      const data = await res.json()

      if (data.success) {
        setUserStats(data.data.stats)
        setMyReviews(data.data.myReviews || [])
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-[#16A34A] animate-spin" />
        <span className="text-sm font-semibold text-[#64748B]">Loading your HelloET dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-7 pb-12">
      {/* Hero Card - Dabang Styled */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <span>Welcome, {session?.user?.name?.split(' ')[0] || (isAdmin ? 'Admin' : 'Explorer')}!</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                {isAdmin ? 'ADMINISTRATOR' : 'EXPLORER'}
              </span>
            </h1>
            <p className="text-sm font-medium text-[#64748B] mt-0.5">
              {isAdmin
                ? 'Manage all Ethiopian businesses, verify listings, and oversee users and reviews.'
                : 'Discover top restaurants, hotels, and verified services across Ethiopia.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            {isAdmin ? (
              <>
                <Link 
                  href="/admin/businesses"
                  className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Manage All Businesses</span>
                </Link>
                <Link 
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] px-4 py-2.5 rounded-2xl font-bold transition-all text-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Admin Dashboard</span>
                </Link>
              </>
            ) : (
              <Link 
                href="/businesses"
                className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs"
              >
                <Search className="w-4 h-4" />
                <span>Explore Ethiopia</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Pastel Stat Cards (HelloET Palette) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Mint Green (Your Reviews) */}
          <Link
            href="/my-reviews"
            className="bg-[#DCFCE7] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {userStats.totalReviews}
              </div>
              <div className="text-sm font-bold text-[#14532D] mt-1">Your Reviews</div>
              <div className="text-xs font-bold text-[#15803D] mt-2">Verified Feedback</div>
            </div>
          </Link>

          {/* Card 2: Golden Amber (Saved Places) */}
          <Link
            href="/saved"
            className="bg-[#FEF3C7] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {userStats.savedBusinesses}
              </div>
              <div className="text-sm font-bold text-[#78350F] mt-1">Saved Places</div>
              <div className="text-xs font-bold text-[#D97706] mt-2">Bookmarks</div>
            </div>
          </Link>

          {/* Card 3: Sky Blue (Recent Searches) */}
          <div className="bg-[#E0F2FE] rounded-2xl p-5 flex flex-col justify-between">
            <div className="w-11 h-11 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-sm mb-4">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {userStats.recentSearches}
              </div>
              <div className="text-sm font-bold text-[#075985] mt-1">Recent Searches</div>
              <div className="text-xs font-bold text-[#0284C7] mt-2">Discovery History</div>
            </div>
          </div>

          {/* Card 4: Warm Rose (Member Level) */}
          <div className="bg-[#FFE4E6] rounded-2xl p-5 flex flex-col justify-between">
            <div className="w-11 h-11 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shadow-sm mb-4">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {userStats.memberLevel}
              </div>
              <div className="text-sm font-bold text-[#881337] mt-1">Member Rank</div>
              <div className="text-xs font-bold text-[#E11D48] mt-2">Active Explorer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: My Reviews & Quick Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: My Reviews */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-[#0F172A]">My Recent Reviews</h3>
            <Link href="/my-reviews" className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myReviews.length === 0 ? (
            <div className="text-center py-10 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
              <MessageSquare className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#64748B] mb-3">You haven&apos;t written any reviews yet</p>
              <Link
                href="/businesses"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Find Places to Review
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {myReviews.slice(0, 4).map((review) => (
                <div key={review.id} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] hover:bg-[#F0FDF4]/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-[#94A3B8]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#0F172A] line-clamp-2">{review.comment || 'No comment text provided'}</p>
                  <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/60 flex items-center justify-between">
                    <Link href={`/businesses/${review.business?.slug || ''}`} className="text-xs font-extrabold text-[#16A34A] hover:underline">
                      {review.business?.name || 'Ethiopian Listing'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Recommended Hubs */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0F172A] mb-4">Discovery Hub</h3>
            <div className="space-y-3">
              <Link 
                href="/businesses" 
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#16A34A]/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Explore Ethiopia</div>
                  <div className="text-[11px] text-[#64748B]">Top restaurants, hotels & shops</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] ml-auto transition-colors" />
              </Link>

              <Link 
                href="/saved" 
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#FEF3C7]/40 border border-[#E2E8F0] hover:border-[#F59E0B]/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Saved Bookmarks</div>
                  <div className="text-[11px] text-[#64748B]">Your favorite Ethiopian places</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] ml-auto transition-colors" />
              </Link>

              <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#16A34A]/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Account Settings</div>
                  <div className="text-[11px] text-[#64748B]">Manage your profile & preferences</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0284C7] ml-auto transition-colors" />
              </Link>
            </div>
          </div>

          <div className="pt-5 border-t border-[#F8FAFC] mt-4 flex items-center justify-between text-xs font-semibold text-[#64748B]">
            <span>HelloET Member Community</span>
            <span className="text-[#16A34A] font-bold">Ethiopia</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 text-center text-xs font-semibold text-[#64748B]">
        <span>Made with </span>
        <span className="text-[#EF4444]">❤️</span>
        <span> for HelloET Platform · Ethiopia&apos;s Business Discovery Directory</span>
      </div>
    </div>
  )
}

// ========================================================
// 2. BUSINESS OWNER DASHBOARD COMPONENT
// ========================================================
function BusinessOwnerDashboard({ session }: { session: any }) {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [stats, setStats] = useState({
    averageRating: 0,
    profileCompletion: 0,
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
      const res = await fetch('/api/dashboard/overview')
      const data = await res.json()

      if (data.success) {
        setStats(data.data.stats)
        setBusinesses(data.data.businesses || [])
        setRecentReviews(data.data.recentReviews || [])
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-[#16A34A] animate-spin" />
        <span className="text-sm font-semibold text-[#64748B]">Loading business dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-7 pb-12">
      {/* 1. Hero Card: "Business Overview" (Dabang Pastel Style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <span>Business Overview</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                HELLOET PARTNER
              </span>
            </h1>
            <p className="text-sm font-medium text-[#64748B] mt-0.5">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'Partner'}! Manage your listings and customer feedback.
            </p>
          </div>
          <Link 
            href="/dashboard/businesses/new"
            className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Business</span>
          </Link>
        </div>

        {/* 4 Pastel Stat Cards (HelloET Palette) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Mint Green (Your Businesses) */}
          <Link
            href="/dashboard/listings"
            className="bg-[#DCFCE7] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats.totalBusinesses}
              </div>
              <div className="text-sm font-bold text-[#14532D] mt-1">Your Businesses</div>
              <div className="text-xs font-bold text-[#15803D] mt-2">Active Listings</div>
            </div>
          </Link>

          {/* Card 2: Amber Gold (Total Reviews) */}
          <Link
            href="/dashboard/reviews"
            className="bg-[#FEF3C7] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats.totalReviews}
              </div>
              <div className="text-sm font-bold text-[#78350F] mt-1">Total Reviews</div>
              <div className="text-xs font-bold text-[#D97706] mt-2">Verified Ratings</div>
            </div>
          </Link>

          {/* Card 3: Warm Rose (Average Rating) */}
          <Link
            href="/dashboard/reviews"
            className="bg-[#FFE4E6] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#F43F5E] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm font-bold text-[#881337] mt-1">Average Rating</div>
              <div className="text-xs font-bold text-[#E11D48] mt-2">Customer Satisfaction</div>
            </div>
          </Link>

          {/* Card 4: Sky Blue (Profile Completion) */}
          <Link
            href="/dashboard/listings"
            className="bg-[#E0F2FE] rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-11 h-11 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats.profileCompletion}%
              </div>
              <div className="text-sm font-bold text-[#075985] mt-1">Listing Strength</div>
              <div className="text-xs font-bold text-[#0284C7] mt-2">Profile Optimization</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Charts Row: Customer Traffic & Weekly Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Customer Traffic Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Customer Engagements</h3>
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 rounded-xl">
              Real-time Insights
            </span>
          </div>

          {/* Spline Wave SVG Chart */}
          <div className="relative w-full h-56 my-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="30" y1="30" x2="480" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="80" x2="480" y2="80" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="30" y1="130" x2="480" y2="130" stroke="#F1F5F9" strokeWidth="1" />

              {/* Curve 1: Views (HelloET Green) */}
              <path
                d="M 40 120 C 100 110, 160 50, 220 70 C 280 90, 340 40, 400 45 C 440 50, 460 70, 480 80"
                fill="none"
                stroke="#16A34A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Curve 2: Inquiries (Golden Yellow) */}
              <path
                d="M 40 140 C 100 135, 160 110, 220 120 C 280 130, 340 90, 400 95 C 440 100, 460 110, 480 115"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Month Labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <text key={d} x={45 + i * 70} y="185" fill="#94A3B8" fontSize="11" textAnchor="middle" fontFamily="sans-serif">
                  {d}
                </text>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#F8FAFC] text-xs font-bold text-[#0F172A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span>Listing Views</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span>Direct Inquiries</span>
            </div>
          </div>
        </div>

        {/* Weekly Enquiries Bars (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Customer Actions</h3>
            <span className="text-xs font-bold text-[#64748B]">Weekly</span>
          </div>

          <div className="relative w-full h-56 my-2 flex items-end justify-between px-2 pt-6">
            {[
              { d: 'Mon', a: 65, b: 45 },
              { d: 'Tue', a: 80, b: 60 },
              { d: 'Wed', a: 55, b: 40 },
              { d: 'Thu', a: 90, b: 75 },
              { d: 'Fri', a: 95, b: 85 },
              { d: 'Sat', a: 70, b: 50 },
              { d: 'Sun', a: 85, b: 70 }
            ].map((col) => (
              <div key={col.d} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-end gap-1.5 h-36 w-full justify-center">
                  <div className="w-2 sm:w-3 bg-[#16A34A] rounded-t-md" style={{ height: `${col.a}%` }} />
                  <div className="w-2 sm:w-3 bg-[#FBBF24] rounded-t-md" style={{ height: `${col.b}%` }} />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B]">{col.d}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#F8FAFC] text-xs font-bold text-[#0F172A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span>Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
              <span>Directions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. My Businesses Table Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-[#0F172A]">My Businesses</h3>
          <Link href="/dashboard/listings" className="text-xs font-extrabold text-[#16A34A] hover:underline flex items-center gap-1">
            <span>View All Listings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-10 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E2E8F0]">
            <Building2 className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#64748B] mb-3">You don&apos;t have any listed businesses yet</p>
            <Link
              href="/dashboard/businesses/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Your First Business
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8] pb-3">
                  <th className="pb-3 font-semibold">Business</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {businesses.map((biz) => (
                  <tr key={biz.id} className="text-sm font-semibold hover:bg-[#F8FAFC]/70 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-[#22C55E] text-white flex items-center justify-center font-extrabold text-xs shadow-sm flex-shrink-0">
                          {biz.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0F172A] text-xs">{biz.name}</div>
                          <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#16A34A]" /> {biz.city || 'Addis Ababa'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-xs font-bold text-[#0F172A]">
                      {biz.category || 'General Directory'}
                    </td>

                    <td className="py-4">
                      {biz.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/30">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-1 text-xs font-extrabold text-[#0F172A]">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{biz.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-[11px] font-normal text-[#94A3B8]">({biz.reviewCount || 0})</span>
                      </div>
                    </td>

                    <td className="py-4 text-right">
                      <Link
                        href={`/businesses/${biz.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#16A34A] text-[#64748B] hover:text-white text-xs font-bold transition-colors"
                      >
                        <span>Preview</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Recent Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-[#0F172A]">Recent Customer Reviews</h3>
          <Link href="/dashboard/reviews" className="text-xs font-extrabold text-[#16A34A] hover:underline flex items-center gap-1">
            <span>Manage All Reviews</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <div className="text-center py-8 text-xs font-semibold text-[#64748B]">
            No customer reviews submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReviews.slice(0, 4).map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-[#94A3B8]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#0F172A] line-clamp-2">{r.comment || 'No comment provided'}</p>
                <div className="mt-3 text-[11px] font-bold text-[#16A34A]">
                  Reviewed on {r.business?.name || 'Your Business'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 text-center text-xs font-semibold text-[#64748B]">
        <span>Made with </span>
        <span className="text-[#EF4444]">❤️</span>
        <span> for HelloET Platform · Ethiopia&apos;s Business Discovery Directory</span>
      </div>
    </div>
  )
}

// ========================================================
// 3. MAIN DASHBOARD PAGE ROUTER
// ========================================================
export default function DashboardPage() {
  const { data: session } = useSession()

  if (session?.user?.role === 'BUSINESS_OWNER') {
    return <BusinessOwnerDashboard session={session} />
  }

  return <UserDashboard session={session} />
}
