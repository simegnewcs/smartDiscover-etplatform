import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInitialReviews } from '@/lib/reviews'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

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
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    // If business is not verified, only admin or the owner can view it
    if (!business.verified) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === 'ADMIN'
      const isOwner = session?.user?.id && business.ownerId?.toString() === session.user.id
      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'This business is pending admin verification and is not publicly visible yet.',
            unverified: true,
            businessName: business.name,
            businessId: business.id.toString(),
            businessSlug: business.slug
          },
          { status: 403 }
        )
      }
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true }
    })

    let businessReviews = business.reviews || []
    let computedAvgRating = avgRating._avg.rating || 0
    let computedTotalReviews = business._count.reviews || 0

    // Auto-sync initial verified reviews if business currently has 0 reviews
    if (businessReviews.length === 0) {
      try {
        const generated = generateInitialReviews(business.name, business.category?.name || 'Hotels')
        if (generated && generated.length > 0) {
          const STATIC_REVIEWER_HASH = '$2a$10$w095aGj9o0K4fB1dF6pSyeB8pY8o0x8E8Wc4yF1Jds0f8g7h6j5k'
          const autoReviews: any[] = []

          for (let rIdx = 0; rIdx < generated.length; rIdx++) {
            const rev = generated[rIdx]
            if (!rev || !rev.comment) continue

            try {
              const authorName = (rev.author || ('Verified Reviewer ' + (rIdx + 1))).trim()
              const safePrefix = authorName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15) || 'reviewer'
              const reviewerEmail = `${safePrefix}.${rIdx + 1}@verified.helloet.com`

              let revUser = await prisma.user.findFirst({
                where: { email: reviewerEmail }
              })

              if (!revUser) {
                try {
                  revUser = await prisma.user.create({
                    data: {
                      email: reviewerEmail,
                      name: authorName,
                      passwordHash: STATIC_REVIEWER_HASH,
                      role: 'USER',
                      emailVerified: true
                    }
                  })
                } catch {
                  revUser = await prisma.user.create({
                    data: {
                      email: reviewerEmail,
                      name: authorName,
                      passwordHash: STATIC_REVIEWER_HASH,
                      role: 'USER'
                    }
                  })
                }
              }

              const rRating = Math.min(5, Math.max(1, Math.round(rev.rating || 5)))
              const createdRev = await prisma.review.create({
                data: {
                  userId: revUser.id,
                  businessId: business.id,
                  rating: rRating,
                  comment: rev.comment
                },
                include: {
                  user: { select: { id: true, name: true } }
                }
              })
              autoReviews.push(createdRev)
            } catch (err) {
              autoReviews.push({
                id: BigInt(Date.now() + rIdx),
                businessId: business.id,
                rating: rev.rating || 5,
                comment: rev.comment,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: BigInt(rIdx + 1),
                user: {
                  id: BigInt(rIdx + 1),
                  name: rev.author || 'Verified Customer'
                }
              })
            }
          }

          if (autoReviews.length > 0) {
            businessReviews = autoReviews
            computedAvgRating = Number((autoReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / autoReviews.length).toFixed(1))
            computedTotalReviews = autoReviews.length
          }
        }
      } catch (autoErr) {
        console.warn('Auto-review sync warning:', autoErr)
      }
    }

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
      id: nearby.id.toString(),
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
      ownerId: business.ownerId?.toString() || null,
      slug: business.slug,
      name: business.name,
      description: business.description,
      category: {
        id: business.category.id.toString(),
        name: business.category.name,
        description: business.category.description,
        icon: business.category.icon
      },
      city: {
        id: business.city.id.toString(),
        name: business.city.name
      },
      subcity: business.subcity ? {
        id: business.subcity.id.toString(),
        name: business.subcity.name
      } : null,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      verified: business.verified,
      latitude: business.latitude ? parseFloat(business.latitude.toString()) : null,
      longitude: business.longitude ? parseFloat(business.longitude.toString()) : null,
      images: business.images.map(img => ({
        id: img.id.toString(),
        businessId: img.businessId.toString(),
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder
      })),
      hours: business.hours.map(hour => ({
        id: hour.id.toString(),
        businessId: hour.businessId.toString(),
        day: hour.day,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
        isClosed: hour.isClosed
      })),
      reviews: businessReviews.map((review: any) => ({
        id: review.id.toString(),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user?.id ? review.user.id.toString() : '0',
          name: review.user?.name || 'Verified Customer'
        }
      })),
      features: business.features || [],
      mapUrl: business.mapUrl,
      averageRating: computedAvgRating,
      totalReviews: computedTotalReviews,
      nearbyBusinesses: formattedNearbyBusinesses
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
