import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const body = await request.json().catch(() => ({}))
    const { rating, comment, userId } = body

    // 1. Validate rating
    const numRating = parseInt(String(rating))
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // 2. Resolve User from NextAuth Session or Request Body
    const session = await getServerSession(authOptions)
    const candidateUserId = session?.user?.id || userId

    let user = null

    // Try finding by ID if provided
    if (candidateUserId) {
      try {
        user = await prisma.user.findUnique({
          where: { id: BigInt(candidateUserId) },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
      } catch (idErr) {
        console.warn('[Review API] User lookup by ID error:', idErr)
      }
    }

    // Fallback: Try finding user by session email
    if (!user && session?.user?.email) {
      try {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
      } catch (emailErr) {
        console.warn('[Review API] User lookup by email error:', emailErr)
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to submit a review' },
        { status: 401 }
      )
    }

    // 3. Find the business (select only required fields to avoid schema mismatch)
    const business = await prisma.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    // 4. Create the review
    const review = await prisma.review.create({
      data: {
        rating: numRating,
        comment: comment?.trim() || null,
        businessId: business.id,
        userId: user.id
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 5. Calculate new aggregate rating
    let computedAvg = numRating
    let totalCount = 1

    try {
      const avgRating = await prisma.review.aggregate({
        where: { businessId: business.id },
        _avg: { rating: true }
      })
      computedAvg = avgRating._avg.rating || numRating
      totalCount = await prisma.review.count({ where: { businessId: business.id } })
    } catch (aggErr) {
      console.warn('[Review API] Rating aggregate warning:', aggErr)
    }

    return NextResponse.json({
      success: true,
      data: {
        review: {
          id: review.id.toString(),
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          user: {
            id: review.user.id.toString(),
            name: review.user.name
          }
        },
        averageRating: Number(computedAvg.toFixed(1)),
        totalReviews: totalCount
      }
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to create review' 
      },
      { status: 500 }
    )
  }
}
