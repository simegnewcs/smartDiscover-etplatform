import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = parseInt(session.user.id)

    const businesses = await prisma.business.findMany({
      where: {
        ownerId: userId
      },
      include: {
        category: true,
        city: true,
        subcity: true,
        images: {
          where: { sortOrder: 0 },
          take: 1
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get ratings for each business
    const businessIds = businesses.map(b => b.id)
    const ratings = await prisma.review.groupBy({
      by: ['businessId'],
      where: { businessId: { in: businessIds } },
      _avg: { rating: true }
    })

    const ratingMap = ratings.reduce((acc, rating) => {
      acc[rating.businessId.toString()] = rating._avg.rating || 0
      return acc
    }, {} as Record<string, number>)

    const formattedBusinesses = businesses.map(business => ({
      id: business.id.toString(),
      slug: business.slug,
      name: business.name,
      description: business.description,
      category: business.category.name,
      location: `${business.city.name}${business.subcity ? `, ${business.subcity.name}` : ''}`,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      verified: business.verified,
      image: business.images[0]?.imageUrl || null,
      rating: ratingMap[business.id.toString()] || 0,
      reviewCount: business._count.reviews,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedBusinesses
    })
  } catch (error) {
    console.error('Error fetching user businesses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}
