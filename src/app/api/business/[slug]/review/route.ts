import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const body = await request.json()
    const { rating, comment, userId } = body

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Find the business
    const business = await prisma.business.findUnique({
      where: { slug }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || null,
        businessId: business.id,
        userId: BigInt(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Calculate new average rating
    const avgRating = await prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true }
    })

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
        averageRating: avgRating._avg.rating || 0,
        totalReviews: await prisma.review.count({ where: { businessId: business.id } })
      }
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
