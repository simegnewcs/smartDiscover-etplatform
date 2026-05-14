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
    const isBusinessOwner = session.user.role === 'BUSINESS_OWNER'

    if (isBusinessOwner) {
      // Get all businesses owned by user
      const businessIds = await prisma.business.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true, slug: true }
      })

      if (businessIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            reviews: [],
            stats: { totalReviews: 0, averageRating: 0, ratingDistribution: [0, 0, 0, 0, 0] }
          }
        })
      }

      const ids = businessIds.map(b => b.id)

      // Fetch all reviews for user's businesses
      const reviews = await prisma.review.findMany({
        where: { businessId: { in: ids } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          business: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Stats
      const totalReviews = reviews.length
      const avgRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      // Rating distribution [1-star, 2-star, 3-star, 4-star, 5-star]
      const ratingDistribution = [0, 0, 0, 0, 0]
      reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating - 1]++
        }
      })

      const formattedReviews = reviews.map(r => ({
        id: r.id.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: {
          id: r.user.id.toString(),
          name: r.user.name,
          email: r.user.email
        },
        business: {
          id: r.business.id.toString(),
          name: r.business.name,
          slug: r.business.slug
        }
      }))

      return NextResponse.json({
        success: true,
        data: {
          reviews: formattedReviews,
          stats: {
            totalReviews,
            averageRating: avgRating,
            ratingDistribution
          }
        }
      })
    } else {
      // Regular user - their own reviews
      const reviews = await prisma.review.findMany({
        where: { userId },
        include: {
          business: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      const totalReviews = reviews.length
      const avgRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      const ratingDistribution = [0, 0, 0, 0, 0]
      reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating - 1]++
        }
      })

      const formattedReviews = reviews.map(r => ({
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

      return NextResponse.json({
        success: true,
        data: {
          reviews: formattedReviews,
          stats: {
            totalReviews,
            averageRating: avgRating,
            ratingDistribution
          }
        }
      })
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
