import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    console.log('Fetching business with slug:', slug)

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        category: true,
        city: true,
        subcity: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        hours: {
          orderBy: { day: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    })

    if (!business) {
      console.log('Business not found for slug:', slug)
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }
    
    console.log('Business found:', business.name, 'ID:', business.id.toString())

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true }
    })

    // Get nearby businesses (same category, different business)
    const nearbyBusinesses = await prisma.business.findMany({
      where: {
        id: { not: business.id },
        categoryId: business.categoryId,
        verified: true
      },
      include: {
        category: true,
        city: true,
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
      take: 6,
      orderBy: { name: 'asc' }
    })

    // Get ratings for nearby businesses
    const nearbyBusinessIds = nearbyBusinesses.map(b => b.id)
    const nearbyRatings = await prisma.review.groupBy({
      by: ['businessId'],
      where: { businessId: { in: nearbyBusinessIds } },
      _avg: { rating: true }
    })

    const nearbyRatingMap = nearbyRatings.reduce((acc, rating) => {
      acc[rating.businessId.toString()] = rating._avg.rating || 0
      return acc
    }, {} as Record<string, number>)

    const formattedNearbyBusinesses = nearbyBusinesses.map(nearby => ({
      id: nearby.id,
      slug: nearby.slug,
      name: nearby.name,
      category: nearby.category.name,
      location: nearby.city.name,
      image: nearby.images[0]?.imageUrl || null,
      rating: nearbyRatingMap[nearby.id.toString()] || 0,
      reviewCount: nearby._count.reviews
    }))

    const formattedBusiness = {
      id: business.id.toString(),
      slug: business.slug,
      name: business.name,
      description: business.description,
      category: {
        ...business.category,
        id: business.category.id.toString()
      },
      city: {
        ...business.city,
        id: business.city.id.toString()
      },
      subcity: business.subcity ? {
        ...business.subcity,
        id: business.subcity.id.toString()
      } : null,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      verified: business.verified,
      latitude: business.latitude ? parseFloat(business.latitude.toString()) : null,
      longitude: business.longitude ? parseFloat(business.longitude.toString()) : null,
      images: business.images.map(img => ({
        ...img,
        id: img.id.toString(),
        businessId: img.businessId.toString()
      })),
      hours: business.hours.map(hour => ({
        ...hour,
        id: hour.id.toString(),
        businessId: hour.businessId.toString()
      })),
      reviews: business.reviews.map(review => ({
        id: review.id.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          ...review.user,
          id: review.user.id.toString()
        }
      })),
      averageRating: avgRating._avg.rating || 0,
      totalReviews: business._count.reviews,
      nearbyBusinesses: formattedNearbyBusinesses.map((nearby: any) => ({
        ...nearby,
        id: nearby.id.toString()
      }))
    }

    return NextResponse.json({
      success: true,
      data: formattedBusiness
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}
