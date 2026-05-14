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

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            images: {
              select: { imageUrl: true },
              orderBy: { sortOrder: 'asc' },
              take: 1
            },
            category: {
              select: { name: true }
            },
            city: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedReviews = reviews.map((r: any) => ({
      id: r.id.toString(),
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      business: {
        id: r.business.id.toString(),
        name: r.business.name,
        slug: r.business.slug,
        address: r.business.address,
        imageUrl: r.business.images[0]?.imageUrl || null,
        category: r.business.category?.name || null,
        city: r.business.city?.name || null
      }
    }))

    // Stats
    const totalReviews = formattedReviews.length
    const avgRating = totalReviews > 0
      ? formattedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
      : 0

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: formattedReviews.filter((r: any) => r.rating === rating).length,
      percentage: totalReviews > 0
        ? Math.round((formattedReviews.filter((r: any) => r.rating === rating).length / totalReviews) * 100)
        : 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        stats: {
          totalReviews,
          avgRating: Math.round(avgRating * 10) / 10,
          ratingDistribution
        }
      }
    })

  } catch (error) {
    console.error('Error fetching my reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
