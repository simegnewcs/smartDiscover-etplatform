import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)

    // Get user's businesses
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      include: {
        category: true,
        city: true,
        images: { where: { sortOrder: 0 }, take: 1 },
        _count: { select: { reviews: true } }
      }
    })

    const businessIds = businesses.map(b => b.id)

    // Total reviews
    const totalReviews = businessIds.length > 0
      ? await prisma.review.count({ where: { businessId: { in: businessIds } } })
      : 0

    // Overall average rating
    const overallAvg = businessIds.length > 0
      ? await prisma.review.aggregate({
          where: { businessId: { in: businessIds } },
          _avg: { rating: true }
        })
      : { _avg: { rating: 0 } }

    // Per-business ratings
    const perBusinessRatings = businessIds.length > 0
      ? await prisma.review.groupBy({
          by: ['businessId'],
          where: { businessId: { in: businessIds } },
          _avg: { rating: true },
          _count: { rating: true }
        })
      : []

    const ratingMap: Record<string, { avg: number; count: number }> = {}
    perBusinessRatings.forEach(r => {
      ratingMap[r.businessId.toString()] = {
        avg: r._avg.rating || 0,
        count: r._count.rating
      }
    })

    // Rating distribution across all reviews
    const ratingDistribution = [0, 0, 0, 0, 0]
    if (businessIds.length > 0) {
      const allReviews = await prisma.review.findMany({
        where: { businessId: { in: businessIds } },
        select: { rating: true }
      })
      allReviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating - 1]++
        }
      })
    }

    // Reviews over time (last 6 months, grouped by month)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentReviews = businessIds.length > 0
      ? await prisma.review.findMany({
          where: {
            businessId: { in: businessIds },
            createdAt: { gte: sixMonthsAgo }
          },
          select: { createdAt: true, rating: true }
        })
      : []

    // Group reviews by month
    const monthlyData: Record<string, { count: number; totalRating: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyData[key] = { count: 0, totalRating: 0 }
    }

    recentReviews.forEach(r => {
      const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[key]) {
        monthlyData[key].count++
        monthlyData[key].totalRating += r.rating
      }
    })

    const reviewTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      reviews: data.count,
      avgRating: data.count > 0 ? data.totalRating / data.count : 0
    }))

    // Top performing businesses (by rating)
    const businessPerformance = businesses.map(b => {
      const rating = ratingMap[b.id.toString()]
      return {
        id: b.id.toString(),
        name: b.name,
        slug: b.slug,
        category: b.category.name,
        city: b.city.name,
        image: b.images[0]?.imageUrl || null,
        rating: rating?.avg || 0,
        reviewCount: rating?.count || 0,
        verified: b.verified
      }
    }).sort((a, b) => b.rating - a.rating)

    // Category breakdown
    const categoryMap: Record<string, { count: number; reviews: number; rating: number }> = {}
    businesses.forEach(b => {
      const cat = b.category.name
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, reviews: 0, rating: 0 }
      }
      categoryMap[cat].count++
      const bRating = ratingMap[b.id.toString()]
      categoryMap[cat].reviews += bRating?.count || 0
      categoryMap[cat].rating += bRating?.avg || 0
    })

    const categoryBreakdown = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      businessCount: data.count,
      totalReviews: data.reviews,
      avgRating: data.count > 0 ? data.rating / data.count : 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalBusinesses: businesses.length,
          totalReviews,
          averageRating: overallAvg._avg.rating || 0,
          verifiedCount: businesses.filter(b => b.verified).length
        },
        ratingDistribution,
        reviewTrend,
        businessPerformance,
        categoryBreakdown
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
