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
    const userRole = session.user.role
    const isBusinessOwner = userRole === 'BUSINESS_OWNER'

    if (isBusinessOwner) {
      // Fetch businesses with related data
      const businesses = await prisma.business.findMany({
        where: { ownerId: userId },
        include: {
          category: true,
          city: true,
          subcity: true,
          images: {
            where: { sortOrder: 0 },
            take: 1
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Get ratings
      const businessIds = businesses.map(b => b.id)
      const ratings = businessIds.length > 0
        ? await prisma.review.groupBy({
            by: ['businessId'],
            where: { businessId: { in: businessIds } },
            _avg: { rating: true }
          })
        : []

      const ratingMap = ratings.reduce((acc, r) => {
        acc[r.businessId.toString()] = r._avg.rating || 0
        return acc
      }, {} as Record<string, number>)

      // Total reviews across all businesses
      const totalReviews = businessIds.length > 0
        ? await prisma.review.count({
            where: { businessId: { in: businessIds } }
          })
        : 0

      // Average rating across all businesses
      const overallAvg = businessIds.length > 0
        ? await prisma.review.aggregate({
            where: { businessId: { in: businessIds } },
            _avg: { rating: true }
          })
        : { _avg: { rating: 0 } }

      // Recent reviews
      const recentReviews = businessIds.length > 0
        ? await prisma.review.findMany({
            where: { businessId: { in: businessIds } },
            include: {
              user: { select: { id: true, name: true } },
              business: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          })
        : []

      // Calculate profile completion
      let filledFields = 0
      let totalFields = 0
      for (const b of businesses) {
        const bAny = b as any
        totalFields += 8
        if (b.name) filledFields++
        if (b.description) filledFields++
        if (b.address) filledFields++
        if (b.phone) filledFields++
        if (b.email) filledFields++
        if (b.website) filledFields++
        if (b.images.length > 0) filledFields++
        if (bAny.mapUrl) filledFields++
      }
      const profileCompletion = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0

      // Format businesses
      const formattedBusinesses = businesses.map(b => ({
        id: b.id.toString(),
        slug: b.slug,
        name: b.name,
        category: b.category.name,
        city: b.city.name,
        subcity: b.subcity?.name || null,
        rating: ratingMap[b.id.toString()] || 0,
        reviewCount: b._count.reviews,
        verified: b.verified,
        image: b.images[0]?.imageUrl || null,
        createdAt: b.createdAt.toISOString()
      }))

      // Format reviews
      const formattedReviews = recentReviews.map(r => ({
        id: r.id.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: { name: r.user.name },
        business: { name: r.business.name, slug: r.business.slug }
      }))

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalBusinesses: businesses.length,
            totalReviews,
            averageRating: overallAvg._avg.rating || 0,
            profileCompletion
          },
          businesses: formattedBusinesses,
          recentReviews: formattedReviews
        }
      })

    } else {
      // Regular user
      const reviewCount = await prisma.review.count({
        where: { userId }
      })

      const myReviews = await prisma.review.findMany({
        where: { userId },
        include: {
          business: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      const formattedReviews = myReviews.map(r => ({
        id: r.id.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        business: {
          id: r.business.id.toString(),
          name: r.business.name,
          slug: r.business.slug
        }
      }))

      // Calculate account age in days
      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        select: { createdAt: true }
      })
      const accountAgeDays = user 
        ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // Determine member level
      let memberLevel = 'Explorer'
      if (reviewCount >= 50) memberLevel = 'Elite Reviewer'
      else if (reviewCount >= 20) memberLevel = 'Top Contributor'
      else if (reviewCount >= 10) memberLevel = 'Active Reviewer'
      else if (reviewCount >= 5) memberLevel = 'Rising Reviewer'

      // Get saved businesses count
      let savedBusinesses = 0
      try {
        const savedResult: any[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM saved_businesses WHERE user_id = ?`, userId
        )
        savedBusinesses = Number(savedResult[0]?.count) || 0
      } catch (e) { /* table may not exist */ }

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            totalReviews: reviewCount,
            savedBusinesses,
            recentSearches: 0,
            memberLevel,
            accountAgeDays
          },
          myReviews: formattedReviews
        }
      })
    }

  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview data' },
      { status: 500 }
    )
  }
}
