import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create demo users (using plain text for demo - in production use bcrypt)
  const businessOwnerPassword = 'demo123'
  const userPassword = 'demo123'

  // Create business owner
  const businessOwner = await prisma.user.upsert({
    where: { email: 'business@helloet.com' },
    update: {},
    create: {
      email: 'business@helloet.com',
      name: 'Demo Business Owner',
      passwordHash: businessOwnerPassword,
      role: 'BUSINESS_OWNER',
    },
  })

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@helloet.com' },
    update: {},
    create: {
      email: 'user@helloet.com',
      name: 'Demo User',
      passwordHash: userPassword,
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

  // Create demo hotel for business owner
  await prisma.business.upsert({
    where: { slug: 'demo-hotel' },
    update: {},
    create: {
      name: 'Demo Hotel',
      slug: 'demo-hotel',
      description: 'A comfortable hotel in the heart of Addis Ababa',
      address: 'Mekanisa, Addis Ababa',
      phone: '+251911765432',
      email: 'info@demohotel.com',
      website: 'https://demohotel.com',
      verified: true,
      latitude: 9.0200,
      longitude: 38.7467,
      ownerId: businessOwner.id,
      categoryId: hotelCategory.id,
      cityId: addisAbaba.id,
    },
  })

  console.log('Seeding finished.')
  console.log('Demo accounts created:')
  console.log('Business Owner: business@helloet.com / demo123')
  console.log('Regular User: user@helloet.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
