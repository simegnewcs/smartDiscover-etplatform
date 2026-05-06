import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } }
      ]
    }

    if (category) {
      where.category = {
        name: { contains: category }
      }
    }

    if (city) {
      where.city = {
        name: { contains: city }
      }
    }

    // Get businesses with relations
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
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
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.business.count({ where })
    ])

    // Calculate average ratings for each business
    const businessIds = businesses.map(b => b.id)
    const ratings = await prisma.review.groupBy({
      by: ['businessId'],
      where: {
        businessId: { in: businessIds }
      },
      _avg: {
        rating: true
      }
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
      website: business.website,
      verified: business.verified,
      image: business.images[0]?.imageUrl || null,
      rating: ratingMap[business.id.toString()] || 0,
      reviewCount: business._count.reviews,
      latitude: business.latitude ? parseFloat(business.latitude.toString()) : null,
      longitude: business.longitude ? parseFloat(business.longitude.toString()) : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        businesses: formattedBusinesses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error searching businesses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search businesses' },
      { status: 500 }
    )
  }
}
