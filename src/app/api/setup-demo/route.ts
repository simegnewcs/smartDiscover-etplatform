import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Create demo users
    const businessOwner = await prisma.user.upsert({
      where: { email: 'business@helloet.com' },
      update: {},
      create: {
        email: 'business@helloet.com',
        name: 'Demo Business Owner',
        passwordHash: 'demo123',
        role: 'BUSINESS_OWNER',
      },
    })

    const regularUser = await prisma.user.upsert({
      where: { email: 'user@helloet.com' },
      update: {},
      create: {
        email: 'user@helloet.com',
        name: 'Demo User',
        passwordHash: 'demo123',
        role: 'USER',
      },
    })

    // Create demo categories
    const restaurantCategory = await prisma.category.upsert({
      where: { name: 'Restaurant' },
      update: {},
      create: {
        name: 'Restaurant',
        description: 'Places to eat and drink',
        icon: 'utensils',
      },
    })

    const hotelCategory = await prisma.category.upsert({
      where: { name: 'Hotel' },
      update: {},
      create: {
        name: 'Hotel',
        description: 'Places to stay',
        icon: 'bed',
      },
    })

    // Create demo city
    const addisAbaba = await prisma.city.upsert({
      where: { name: 'Addis Ababa' },
      update: {},
      create: {
        name: 'Addis Ababa',
        description: 'Capital of Ethiopia',
      },
    })

    // Create demo business for business owner
    await prisma.business.upsert({
      where: { slug: 'demo-restaurant' },
      update: {},
      create: {
        name: 'Demo Restaurant',
        slug: 'demo-restaurant',
        description: 'A wonderful Ethiopian restaurant serving traditional dishes',
        address: 'Bole Road, Addis Ababa',
        phone: '+251911234567',
        email: 'demo@restaurant.com',
        website: 'https://demorestaurant.com',
        verified: true,
        latitude: 9.1450,
        longitude: 40.4897,
        ownerId: businessOwner.id,
        categoryId: restaurantCategory.id,
        cityId: addisAbaba.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Demo accounts created successfully',
      users: [
        { email: 'business@helloet.com', password: 'demo123', role: 'BUSINESS_OWNER' },
        { email: 'user@helloet.com', password: 'demo123', role: 'USER' }
      ]
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to setup demo accounts' },
      { status: 500 }
    )
  }
}
