import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1. Core Platform Pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/businesses`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/auth/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // 2. High-Intent Category Landing Pages
  const mainCategories = [
    'Restaurants',
    'Hotels',
    'Cafes',
    'Pharmacies',
    'Supermarkets',
    'Tourist Attractions',
    'Local Services',
    'Healthcare',
    'Education',
    'Entertainment',
  ]

  const categoryPages: MetadataRoute.Sitemap = mainCategories.flatMap((cat) => [
    {
      url: `${siteUrl}/businesses?category=${encodeURIComponent(cat)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${siteUrl}/category/${cat.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
  ])

  // 3. High-Intent City Landing Pages
  const mainCities = [
    'Addis Ababa',
    'Dire Dawa',
    'Bahir Dar',
    'Hawassa',
    'Gondar',
    'Mekelle',
    'Jimma',
    'Adama',
    'Harar',
    'Dessie',
    'Debre Birhan',
    'Lalibela',
    'Axum',
    'Arba Minch',
  ]

  const cityPages: MetadataRoute.Sitemap = mainCities.flatMap((city) => [
    {
      url: `${siteUrl}/businesses?city=${encodeURIComponent(city)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/city/${city.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ])

  // 4. Programmatic City + Category High-Intent Landing Pages (e.g. /city/addis-ababa/restaurants)
  const coreCities = [
    'addis-ababa',
    'bahir-dar',
    'hawassa',
    'gondar',
    'dire-dawa',
    'mekelle',
    'jimma',
    'lalibela',
    'adama',
    'harar'
  ]

  const coreCategories = [
    'restaurants',
    'hotels',
    'cafes',
    'pharmacies',
    'supermarkets',
    'tourist-attractions',
    'local-services'
  ]

  const programmaticCityCategoryPages: MetadataRoute.Sitemap = coreCities.flatMap((citySlug) =>
    coreCategories.map((catSlug) => ({
      url: `${siteUrl}/city/${citySlug}/${catSlug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
  )

  // 5. Dynamic Business Profile Pages (Fetched directly from DB)
  let businessPages: MetadataRoute.Sitemap = []
  try {
    const businesses = await prisma.business.findMany({
      select: {
        slug: true,
        updatedAt: true,
        verified: true,
      },
      take: 2000,
      orderBy: { updatedAt: 'desc' },
    })

    if (businesses && businesses.length > 0) {
      businessPages = businesses.map((b) => ({
        url: `${siteUrl}/business/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: b.verified ? 0.9 : 0.75,
      }))
    }
  } catch (error) {
    console.warn('[Sitemap] Database fetch failed, falling back to static index:', error)
  }

  return [
    ...corePages,
    ...categoryPages,
    ...cityPages,
    ...programmaticCityCategoryPages,
    ...businessPages,
  ]
}
