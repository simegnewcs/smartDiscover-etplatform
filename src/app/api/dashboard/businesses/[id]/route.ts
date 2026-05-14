import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET single business for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const businessId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: userId
      },
      include: {
        category: true,
        city: true,
        subcity: true,
        images: true,
        hours: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: business.id.toString(),
        slug: business.slug,
        name: business.name,
        description: business.description,
        categoryId: business.categoryId.toString(),
        cityId: business.cityId.toString(),
        subcityId: business.subcityId?.toString(),
        address: business.address,
        phone: business.phone,
        email: business.email,
        website: business.website,
        mapUrl: business.mapUrl,
        features: business.features,
        verified: business.verified,
        category: { name: business.category.name },
        city: { name: business.city.name },
        subcity: business.subcity ? { name: business.subcity.name } : null,
        images: business.images.map(img => ({
          id: img.id.toString(),
          imageUrl: img.imageUrl,
          sortOrder: img.sortOrder
        })),
        hours: business.hours.map(hour => ({
          day: hour.day,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}

// PUT update business
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const businessId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Check ownership
    const existing = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      city,
      subcity,
      address,
      phone,
      email,
      website,
      mapUrl,
      features,
      images
    } = body

    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    })
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: { name: category, description: `${category} business` }
      })
    }

    // Find or create city
    let cityRecord = await prisma.city.findFirst({
      where: { name: city }
    })
    if (!cityRecord) {
      cityRecord = await prisma.city.create({
        data: { name: city }
      })
    }

    // Find or create subcity
    let subcityRecord = null
    if (subcity) {
      subcityRecord = await prisma.subcity.findFirst({
        where: { name: subcity, cityId: cityRecord.id }
      })
      if (!subcityRecord) {
        subcityRecord = await prisma.subcity.create({
          data: { name: subcity, cityId: cityRecord.id }
        })
      }
    }

    // Update business
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        description,
        categoryId: categoryRecord.id,
        cityId: cityRecord.id,
        subcityId: subcityRecord?.id,
        address,
        phone,
        email,
        website,
        mapUrl,
        features: features || []
      }
    })

    // Update images if provided
    if (images && images.length > 0) {
      // Delete existing images
      await prisma.businessImage.deleteMany({
        where: { businessId }
      })
      
      // Create new images
      await prisma.businessImage.createMany({
        data: images.map((url: string, index: number) => ({
          businessId,
          imageUrl: url,
          sortOrder: index
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Business updated successfully',
      data: {
        id: updated.id.toString(),
        slug: updated.slug,
        name: updated.name
      }
    })
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update business' },
      { status: 500 }
    )
  }
}

// DELETE business
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const businessId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Check ownership
    const existing = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    // Delete business (cascade will handle related records)
    await prisma.business.delete({
      where: { id: businessId }
    })

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete business' },
      { status: 500 }
    )
  }
}
