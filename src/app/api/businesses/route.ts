import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Helper function to extract coordinates from Google Maps URL
function extractCoordinatesFromMapUrl(url: string): { lat: number; lng: number } | null {
  try {
    // Handle maps.app.goo.gl short URLs (need to resolve)
    if (url.includes('maps.app.goo.gl')) {
      // Short URLs need to be resolved - we'll store the URL without extracting coordinates
      return null
    }

    // Handle standard Google Maps URLs with query parameter
    // e.g., https://www.google.com/maps?q=9.0242,38.7468 or https://maps.google.com/?q=9.0242,38.7468
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch) {
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2])
      }
    }

    // Handle URLs with @lat,lng format
    // e.g., https://www.google.com/maps/@9.0242,38.7468,15z
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      }
    }

    // Handle place URLs with ll parameter
    // e.g., https://maps.google.com/?ll=9.0242,38.7468
    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (llMatch) {
      return {
        lat: parseFloat(llMatch[1]),
        lng: parseFloat(llMatch[2])
      }
    }

    return null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, category, city, subcity, address, mapUrl, phone, email, website, ownerId, images, features } = await request.json()

    // Basic validation
    if (!name || !category || !city || !ownerId) {
      return NextResponse.json(
        { success: false, message: 'Name, category, city, and owner are required' },
        { status: 400 }
      )
    }

    // Find or create category
    let categoryRecord;
    try {
      // Try exact match first
      categoryRecord = await prisma.category.findUnique({
        where: { name: category }
      })
      
      // If not found, try contains search
      if (!categoryRecord) {
        categoryRecord = await prisma.category.findFirst({
          where: { name: { contains: category } }
        })
      }
      
      if (!categoryRecord) {
        try {
          categoryRecord = await prisma.category.create({
            data: {
              name: category,
              description: `${category} businesses`,
              icon: 'building'
            }
          })
        } catch (createError) {
          console.error('Error creating category:', createError)
          // If creation fails, try to find it again
          categoryRecord = await prisma.category.findUnique({
            where: { name: category }
          })
          if (!categoryRecord) {
            throw createError
          }
        }
      }
    } catch (categoryError) {
      console.error('Error finding/creating category:', categoryError)
      return NextResponse.json(
        { success: false, message: 'Failed to process business category' },
        { status: 500 }
      )
    }

    // Find or create city
    let cityRecord;
    try {
      cityRecord = await prisma.city.findFirst({
        where: { name: { contains: city } }
      })
      
      if (!cityRecord) {
        cityRecord = await prisma.city.create({
          data: {
            name: city
          }
        })
      }
    } catch (cityError) {
      console.error('Error finding/creating city:', cityError)
      return NextResponse.json(
        { success: false, message: 'Failed to process business location' },
        { status: 500 }
      )
    }

    // Find or create subcity if provided
    let subcityRecord = null;
    if (subcity) {
      try {
        subcityRecord = await prisma.subcity.findFirst({
          where: { 
            name: { contains: subcity },
            cityId: cityRecord.id
          }
        })
        
        if (!subcityRecord) {
          subcityRecord = await prisma.subcity.create({
            data: {
              name: subcity,
              cityId: cityRecord.id
            }
          })
        }
      } catch (subcityError) {
        console.error('Error finding/creating subcity:', subcityError)
        return NextResponse.json(
          { success: false, message: 'Failed to process subcity' },
          { status: 500 }
        )
      }
    }

    // Generate unique slug
    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    let uniqueSlug = slug
    let counter = 1

    while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    // Create business
    let business: any;
    try {
      const businessData: any = {
        slug: uniqueSlug,
        name: name,
        description: description || `${name} - ${category} in ${city}`,
        categoryId: categoryRecord.id,
        cityId: cityRecord.id,
        address: address || city,
        phone: phone,
        email: email,
        website: website,
        verified: false,
        ownerId: BigInt(ownerId),
      }

      // Add optional fields
      if (subcityRecord) {
        businessData.subcityId = subcityRecord.id
      }

      // Store Google Maps URL for location
      if (mapUrl) {
        businessData.mapUrl = mapUrl
        // Try to extract coordinates from Google Maps URL
        const coords = extractCoordinatesFromMapUrl(mapUrl)
        if (coords) {
          businessData.latitude = coords.lat
          businessData.longitude = coords.lng
        }
      }

      // Store features as JSON (default to empty array)
      businessData.features = features || []

      business = await prisma.business.create({
        data: businessData,
        include: {
          category: true,
          city: true,
          subcity: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Create business images if provided
      if (images && images.length > 0) {
        const imageData = images.map((url: string, index: number) => ({
          businessId: business.id,
          imageUrl: url,
          sortOrder: index
        }))

        await prisma.businessImage.createMany({
          data: imageData
        })
      }

    } catch (businessError) {
      console.error('Error creating business:', businessError)
      return NextResponse.json(
        { success: false, message: 'Failed to create business listing' },
        { status: 500 }
      )
    }

    // Convert BigInt to string for response
    const businessForResponse = {
      id: business.id.toString(),
      slug: business.slug,
      name: business.name,
      description: business.description,
      categoryId: business.categoryId.toString(),
      cityId: business.cityId.toString(),
      subcityId: business.subcityId?.toString() || null,
      address: business.address,
      latitude: business.latitude,
      longitude: business.longitude,
      phone: business.phone,
      email: business.email,
      website: business.website,
      mapUrl: business.mapUrl,
      features: business.features,
      verified: business.verified,
      ownerId: business.ownerId?.toString() || null,
      createdAt: business.createdAt,
      category: business.category ? {
        id: business.category.id.toString(),
        name: business.category.name,
        description: business.category.description,
        icon: business.category.icon
      } : null,
      city: business.city ? {
        id: business.city.id.toString(),
        name: business.city.name
      } : null,
      subcity: business.subcity ? {
        id: business.subcity.id.toString(),
        name: business.subcity.name
      } : null,
      owner: business.owner ? {
        id: business.owner.id.toString(),
        name: business.owner.name,
        email: business.owner.email
      } : null
    }

    return NextResponse.json({
      success: true,
      message: 'Business created successfully',
      business: businessForResponse
    })

  } catch (error) {
    console.error('Business creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (ownerId) {
      where.ownerId = BigInt(ownerId)
    }

    if (category) {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      }
    }

    if (city) {
      where.city = {
        name: { contains: city, mode: 'insensitive' }
      }
    }

    // Get businesses with relations
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          category: true,
          city: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
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
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.business.count({ where })
    ])

    // Convert BigInt to string and format response
    const formattedBusinesses = businesses.map(business => ({
      ...business,
      id: business.id.toString(),
      categoryId: business.categoryId.toString(),
      cityId: business.cityId.toString(),
      ownerId: business.ownerId?.toString(),
      owner: business.owner ? {
        ...business.owner,
        id: business.owner.id.toString()
      } : null,
      reviewCount: business._count.reviews
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
    console.error('Business fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
