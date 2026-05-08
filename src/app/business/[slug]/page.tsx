import { Metadata } from 'next'
import BusinessDetail from '@/components/business/BusinessDetail'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

interface PageProps {
  params: {
    slug: string
  }
}

interface BusinessData {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  verified?: boolean
  latitude?: number
  longitude?: number
  category: { name: string }
  city: { name: string }
  subcity?: { name: string }
  images?: Array<{ imageUrl: string }>
  reviews?: Array<{ rating: number }>
  _count?: { reviews: number }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${siteUrl}/api/business/${params.slug}`, {
      next: { revalidate: 3600 }
    })
    const data = await response.json()

    if (!data.success || !data.data) {
      return {
        title: 'Business Not Found',
        description: 'The business you are looking for could not be found on HelloET Ethiopia.',
        robots: { index: false, follow: false }
      }
    }

    const business: BusinessData = data.data
    const location = business.subcity
      ? `${business.subcity.name}, ${business.city.name}`
      : business.city.name
    const category = business.category.name
    const title = `${business.name} - ${category} in ${location} | HelloET`
    const description = business.description
      ? `${business.description.substring(0, 155)} | ${category} in ${location}, Ethiopia.`
      : `${business.name} is a trusted ${category} in ${location}, Ethiopia. Get contact info, reviews, location, and more on HelloET.`
    const canonicalUrl = `${siteUrl}/business/${params.slug}`
    const imageUrl = business.images?.[0]?.imageUrl || '/og-image.png'
    const avgRating = business.reviews?.length
      ? (business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length).toFixed(1)
      : null
    const reviewCount = business._count?.reviews || 0

    return {
      title,
      description,
      keywords: [
        business.name,
        `${business.name} ${location}`,
        `${business.name} Ethiopia`,
        `${category} ${location}`,
        `${category} Ethiopia`,
        `${category} Addis Ababa`,
        `best ${category} Ethiopia`,
        `${location} ${category}`,
        `${business.name} contact`,
        `${business.name} reviews`,
        `${business.name} phone`,
        `${business.name} address`,
        `local ${category} Ethiopia`,
        `verified ${category} Ethiopia`,
        `HelloET ${business.name}`,
        'Ethiopia business directory',
        `${category} near me Ethiopia`,
      ],
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        locale: 'en_ET',
        siteName: 'HelloET',
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
      },
      other: {
        'geo.region': 'ET',
        'geo.placename': `${location}, Ethiopia`,
        ...(business.latitude && business.longitude ? {
          'geo.position': `${business.latitude};${business.longitude}`,
          'ICBM': `${business.latitude}, ${business.longitude}`,
        } : {}),
        ...(avgRating ? { 'og:rating': avgRating, 'og:rating_count': String(reviewCount) } : {}),
        ...(business.verified ? { 'og:certified': 'true' } : {}),
      }
    }
  } catch {
    return {
      title: 'Business - HelloET Ethiopia',
      description: 'Discover local businesses in Ethiopia on HelloET - your trusted business discovery platform.'
    }
  }
}

export default async function BusinessPage({ params }: PageProps) {
  let jsonLd = null

  try {
    const response = await fetch(`${siteUrl}/api/business/${params.slug}`, {
      next: { revalidate: 3600 }
    })
    const data = await response.json()
    if (data.success && data.data) {
      const b: BusinessData = data.data
      const location = b.subcity ? `${b.subcity.name}, ${b.city.name}` : b.city.name
      const avgRating = b.reviews?.length
        ? (b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length).toFixed(1)
        : null
      const reviewCount = b._count?.reviews || 0

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: b.name,
        description: b.description || `${b.name} - ${b.category.name} in ${location}, Ethiopia`,
        url: `${siteUrl}/business/${params.slug}`,
        image: b.images?.map(img => img.imageUrl) || [],
        address: {
          '@type': 'PostalAddress',
          streetAddress: b.address || '',
          addressLocality: b.city.name,
          addressRegion: b.subcity?.name || b.city.name,
          addressCountry: 'ET'
        },
        ...(b.latitude && b.longitude ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: b.latitude,
            longitude: b.longitude
          }
        } : {}),
        ...(b.phone ? { telephone: b.phone } : {}),
        ...(b.email ? { email: b.email } : {}),
        ...(b.website ? { sameAs: [b.website] } : {}),
        ...(avgRating && reviewCount > 0 ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: reviewCount,
            bestRating: '5',
            worstRating: '1'
          }
        } : {}),
        servesCuisine: b.category.name,
        priceRange: '$$',
        areaServed: location,
        isAccessibleForFree: false,
      }
    }
  } catch { /* ignore */ }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BusinessDetail slug={params.slug} />
    </>
  )
}
