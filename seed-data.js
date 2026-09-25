const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create business owner
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

  // Create demo city
  const addisAbaba = await prisma.city.upsert({
    where: { name: 'Addis Ababa' },
    update: {},
    create: {
      name: 'Addis Ababa',
    },
  })

  // Create demo business
  await prisma.business.upsert({
    where: { slug: 'demo-restaurant' },
    update: { verified: true },
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
  
  const count = await prisma.business.count();
  console.log(`There are now ${count} businesses in the database.`);
}
main().catch(console.error).finally(() => prisma.$disconnect())
