import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { 
      name, email, password, userType,
      businessName, businessType, businessDescription, 
      businessCity, businessSubcity, businessAddress,
      businessLatitude, businessLongitude, phone, businessWebsite,
      images
    } = body

    console.log('Registration attempt for email:', email, 'userType:', userType)

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 409 }
        )
      }
    } catch (dbError) {
      console.error('Database error during user check:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      )
    }

    // Determine user role
    const role = userType === 'business' || businessName ? 'BUSINESS_OWNER' : 'USER'
    console.log('User role will be:', role)

    // Create user and business (using plain text password for demo - in production use bcrypt)
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: password, // In production, hash this with bcrypt
          role: role,
        }
      })

      // If business owner, create the business
      if (role === 'BUSINESS_OWNER' && businessName && businessType && phone && businessCity) {
        // Always create a unique category for each business
        let category;
        try {
          // Create unique category name by combining business type and business name
          const uniqueCategoryName = `${businessType} - ${businessName}`
          
          try {
            category = await prisma.category.create({
              data: {
                name: uniqueCategoryName,
                description: `${businessType} business: ${businessName}`,
                icon: 'building'
              }
            })
          } catch (createError) {
            console.error('Error creating category:', createError)
            // If unique constraint fails, append timestamp
            const timestamp = Date.now()
            const uniqueNameWithTimestamp = `${uniqueCategoryName} (${timestamp})`
            
            category = await prisma.category.create({
              data: {
                name: uniqueNameWithTimestamp,
                description: `${businessType} business: ${businessName}`,
                icon: 'building'
              }
            })
          }
        } catch (categoryError) {
          console.error('Error creating category:', categoryError)
          return NextResponse.json(
            { success: false, message: 'Failed to create business category' },
            { status: 500 }
          )
        }

        // Find or create city
        let city;
        try {
          city = await prisma.city.findFirst({
            where: { name: { contains: businessCity } }
          })
          
          if (!city) {
            city = await prisma.city.create({
              data: {
                name: businessCity
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
        let subcity = null;
        if (businessSubcity) {
          try {
            subcity = await prisma.subcity.findFirst({
              where: { 
                name: { contains: businessSubcity },
                cityId: city.id
              }
            })
            
            if (!subcity) {
              subcity = await prisma.subcity.create({
                data: {
                  name: businessSubcity,
                  cityId: city.id
                }
              })
            }
          } catch (subcityError) {
            console.error('Error finding/creating subcity:', subcityError)
            // Continue without subcity if it fails
          }
        }

        // Create business
        let business;
        try {
          // Generate unique slug
          let slug = businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          let uniqueSlug = slug
          let counter = 1
          
          while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${slug}-${counter}`
            counter++
          }

          business = await prisma.business.create({
            data: {
              slug: uniqueSlug,
              name: businessName,
              description: businessDescription || `${businessName} - ${businessType} in ${businessCity}`,
              categoryId: category.id,
              cityId: city.id,
              subcityId: subcity?.id || null,
              address: businessAddress || businessCity,
              latitude: businessLatitude ? parseFloat(businessLatitude) : null,
              longitude: businessLongitude ? parseFloat(businessLongitude) : null,
              phone: phone,
              email: email,
              website: businessWebsite || null,
              verified: false,
              ownerId: user.id,
            }
          })

          // Create business images if provided
          if (images && images.length > 0) {
            try {
              for (let i = 0; i < images.length; i++) {
                await prisma.businessImage.create({
                  data: {
                    businessId: business.id,
                    imageUrl: images[i],
                    sortOrder: i
                  }
                })
              }
            } catch (imageError) {
              console.error('Error creating business images:', imageError)
              // Don't fail the registration if images fail
            }
          }
        } catch (businessError) {
          console.error('Error creating business:', businessError)
          return NextResponse.json(
            { success: false, message: 'Failed to create business listing' },
            { status: 500 }
          )
        }
      }
    } catch (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Remove sensitive data and convert BigInt to string
    const { passwordHash, ...userWithoutPassword } = user
    const userForResponse = {
      ...userWithoutPassword,
      id: user.id.toString() // Convert BigInt to string
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userForResponse
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
