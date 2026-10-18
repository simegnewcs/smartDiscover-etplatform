import { Metadata } from 'next'
import BusinessDetail from '@/components/business/BusinessDetail'
import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

interface PageProps {
  params: {
    slug: string
  }
}

// Map category names to Schema.org specific types for maximum Google rich snippet impact
function getSchemaType(categoryName: string = ''): string {
  const cat = categoryName.toLowerCase()
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('dining')) return 'Restaurant'
  if (cat.includes('hotel') || cat.includes('resort') || cat.includes('lodge')) return 'Hotel'
  if (cat.includes('cafe') || cat.includes('coffee')) return 'CafeOrCoffeeShop'
  if (cat.includes('pharmacy') || cat.includes('drugstore')) return 'Pharmacy'
  if (cat.includes('supermarket') || cat.includes('grocery')) return 'GroceryStore'
  if (cat.includes('tourist') || cat.includes('attraction') || cat.includes('museum')) return 'TouristAttraction'
  if (cat.includes('health') || cat.includes('hospital') || cat.includes('clinic')) return 'MedicalBusiness'
  if (cat.includes('school') || cat.includes('education') || cat.includes('university')) return 'EducationalOrganization'
  if (cat.includes('bar') || cat.includes('nightlife') || cat.includes('club')) return 'BarOrPub'
  return 'LocalBusiness'
}

async function getBusinessBySlug(slug: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        category: true,
        city: true,
        subcity: true,
        images: { orderBy: { sortOrder: 'asc' } },
        hours: { orderBy: { day: 'asc' } },
        reviews: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 6
        },
        _count: {
          select: { reviews: true }
        }
      }
    })
    return business
  } catch (error) {
    console.warn('[SEO] Direct Prisma fetch error, fallback to HTTP:', error)
    try {
      const res = await fetch(`${siteUrl}/api/business/${slug}`, { next: { revalidate: 3600 } })
      const json = await res.json()
      return json.success ? json.data : null
    } catch {
      return null
    }
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = await getBusinessBySlug(params.slug)

  if (!business) {
    return {
      title: 'Business Not Found | HelloET Ethiopia',
      description: 'The business you are looking for could not be found on HelloET Ethiopia.',
      robots: { index: false, follow: false }
    }
  }

  const location = business.subcity
    ? `${business.subcity.name}, ${business.city.name}`
    : business.city.name
  const category = business.category?.name || 'Local Business'
  const title = `${business.name} - ${category} in ${location}, Ethiopia | HelloET`
  const description = business.description
    ? `${business.description.substring(0, 155)}... Contact info, reviews, hours & location in ${location}, Ethiopia.`
    : `Find contact numbers, verified address, reviews, photos, and opening hours for ${business.name} (${category}) in ${location}, Ethiopia.`
  
  const canonicalUrl = `${siteUrl}/business/${params.slug}`
  const imageUrl = business.images?.[0]?.imageUrl || `${siteUrl}/og-image.png`
  
  const avgRating = business.reviews?.length
    ? (business.reviews.reduce((s: number, r: any) => s + r.rating, 0) / business.reviews.length).toFixed(1)
    : null
  const reviewCount = business._count?.reviews || 0

  return {
    title,
    description,
    keywords: [
      business.name,
      `${business.name} ${location}`,
      `${business.name} Ethiopia`,
      `${business.name} phone number`,
      `${business.name} address`,
      `${business.name} reviews`,
      `${business.name} opening hours`,
      `${category} ${business.city.name}`,
      `${category} Addis Ababa`,
      `best ${category} in ${business.city.name}`,
      `top ${category} Ethiopia`,
      `verified ${category} Ethiopia`,
      `${category} near me ${business.city.name}`,
      `${business.name} direction map`,
      'HelloET Ethiopia',
      'Ethiopian business directory',
      `ቢዝነስ ${business.name}`,
      `አድራሻ ${business.name}`,
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-ET': canonicalUrl,
        'am-ET': canonicalUrl,
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: 'en_ET',
      alternateLocale: ['am_ET'],
      siteName: 'HelloET Ethiopia',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${business.name} - ${category} in ${location}, Ethiopia`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@helloet',
      creator: '@helloet',
    },
    other: {
      'geo.region': 'ET',
      'geo.placename': `${location}, Ethiopia`,
      ...(business.latitude && business.longitude ? {
        'geo.position': `${business.latitude};${business.longitude}`,
        'ICBM': `${business.latitude}, ${business.longitude}`,
      } : {}),
      ...(business.phone ? { 'telephone': business.phone } : {}),
      ...(avgRating ? { 'og:rating': avgRating, 'og:rating_count': String(reviewCount) } : {}),
      ...(business.verified ? { 'og:certified': 'true' } : {}),
    }
  }
}

export default async function BusinessPage({ params }: PageProps) {
  const business = await getBusinessBySlug(params.slug)

  let localBusinessSchema = null
  let breadcrumbSchema = null
  let faqSchema = null

  if (business) {
    const location = business.subcity
      ? `${business.subcity.name}, ${business.city.name}`
      : business.city.name
    const category = business.category?.name || 'Local Business'
    const schemaType = getSchemaType(category)
    const canonicalUrl = `${siteUrl}/business/${params.slug}`
    
    const avgRating = business.reviews?.length
      ? (business.reviews.reduce((s: number, r: any) => s + r.rating, 0) / business.reviews.length).toFixed(1)
      : null
    const reviewCount = business._count?.reviews || 0

    // 1. Specific LocalBusiness / Restaurant / Hotel Schema
    localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      '@id': canonicalUrl,
      name: business.name,
      description: business.description || `${business.name} is a verified ${category} in ${location}, Ethiopia.`,
      url: canonicalUrl,
      image: business.images?.map((img: any) => img.imageUrl) || [`${siteUrl}/og-image.png`],
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address || location,
        addressLocality: business.city.name,
        addressRegion: business.subcity?.name || business.city.name,
        addressCountry: 'ET'
      },
      ...(business.latitude && business.longitude ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: Number(business.latitude),
          longitude: Number(business.longitude)
        },
        hasMap: `https://www.openstreetmap.org/?mlat=${business.latitude}&mlon=${business.longitude}#map=16/${business.latitude}/${business.longitude}`
      } : {}),
      ...(business.phone ? { telephone: business.phone } : {}),
      ...(business.email ? { email: business.email } : {}),
      ...(business.website ? { sameAs: [business.website] } : {}),
      currenciesAccepted: 'ETB',
      priceRange: '$$',
      areaServed: {
        '@type': 'AdministrativeArea',
        name: location
      },
      // Opening hours specification
      ...(business.hours && business.hours.length > 0 ? {
        openingHoursSpecification: business.hours.map((h: any) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${h.day.charAt(0) + h.day.slice(1).toLowerCase()}`,
          ...(h.isClosed ? {
            opens: '00:00',
            closes: '00:00'
          } : {
            opens: h.openTime || '08:00',
            closes: h.closeTime || '20:00'
          })
        }))
      } : {}),
      // Aggregate ratings
      ...(avgRating && reviewCount > 0 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating,
          reviewCount: reviewCount,
          bestRating: '5',
          worstRating: '1'
        }
      } : {}),
      // Individual reviews
      ...(business.reviews && business.reviews.length > 0 ? {
        review: business.reviews.map((r: any) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: r.user?.name || 'Customer'
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: '5',
            worstRating: '1'
          },
          datePublished: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
          description: r.comment || ''
        }))
      } : {})
    }

    // 2. BreadcrumbList Schema (Critical for SERP navigation snippets)
    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Businesses',
          item: `${siteUrl}/businesses`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: business.city.name,
          item: `${siteUrl}/businesses?city=${encodeURIComponent(business.city.name)}`
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: category,
          item: `${siteUrl}/businesses?category=${encodeURIComponent(category)}`
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: business.name,
          item: canonicalUrl
        }
      ]
    }

    // 3. Local FAQ Schema (Enables Google FAQ Accordions)
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Where is ${business.name} located?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${business.name} is located at ${business.address || location} in ${business.city.name}, Ethiopia.`
          }
        },
        {
          '@type': 'Question',
          name: `What is the phone number for ${business.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: business.phone 
              ? `You can reach ${business.name} directly by phone at ${business.phone}.` 
              : `Contact details for ${business.name} can be found on their HelloET verified profile.`
          }
        },
        {
          '@type': 'Question',
          name: `Is ${business.name} a verified business on HelloET?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: business.verified 
              ? `Yes, ${business.name} is an officially verified business listed on the HelloET Ethiopia Directory.` 
              : `${business.name} is listed in the ${category} category on HelloET Ethiopia.`
          }
        }
      ]
    }
  }

  return (
    <>
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BusinessDetail slug={params.slug} />
    </>
  )
}
