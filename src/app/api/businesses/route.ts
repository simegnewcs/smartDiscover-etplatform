import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, description, category, city, subcity, address, latitude, longitude, phone, email, website, ownerId, images } = await request.json()

    console.log('Creating business:', name)

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
        console.log('Creating new category:', category)
        try {
          categoryRecord = await prisma.category.create({
            data: {
              name: category,
              description: `${category} businesses`,
              icon: 'building'
            }
          })
          console.log('Category created:', categoryRecord.name, 'ID:', categoryRecord.id.toString())
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
      } else {
        console.log('Found existing category:', categoryRecord.name)
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
        console.log('Creating new city:', city)
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
          console.log('Creating new subcity:', subcity)
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

      if (latitude && longitude) {
        businessData.latitude = parseFloat(latitude)
        businessData.longitude = parseFloat(longitude)
      }

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
          url: url,
          sortOrder: index,
          alt: `${name} image ${index + 1}`
        }))

        await prisma.businessImage.createMany({
          data: imageData
        })
      }

      console.log('Business created successfully:', business.name)
    } catch (businessError) {
      console.error('Error creating business:', businessError)
      return NextResponse.json(
        { success: false, message: 'Failed to create business listing' },
        { status: 500 }
      )
    }

    // Convert BigInt to string for response
    const businessForResponse = {
      ...business,
      id: business.id.toString(),
      categoryId: business.categoryId.toString(),
      cityId: business.cityId.toString(),
      subcityId: business.subcityId?.toString(),
      ownerId: business.ownerId?.toString(),
      owner: business.owner ? {
        ...business.owner,
        id: business.owner.id.toString()
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
