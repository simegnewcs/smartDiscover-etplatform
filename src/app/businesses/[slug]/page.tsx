import { Metadata } from 'next'
import BusinessDetail from '@/components/business/BusinessDetail'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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
      cache: 'no-store'
    })
    const data = await response.json()

    if (!data.success || !data.data) {
      return {
        title: `${params.slug} - HelloET Ethiopia`,
        description: 'View business details and information on HelloET Ethiopia.',
      }
    }

    const business: BusinessData = data.data
    const location = business.subcity
      ? `${business.subcity.name}, ${business.city.name}`
      : business.city.name
    const category = business.category?.name || 'Business'
    const title = `${business.name} - ${category} in ${location} | HelloET`
    const description = business.description
      ? `${business.description.substring(0, 155)} | ${category} in ${location}, Ethiopia.`
      : `${business.name} is on HelloET. Get contact info, reviews, location, and more.`

    return {
      title,
      description,
      alternates: { canonical: `${siteUrl}/businesses/${params.slug}` },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/businesses/${params.slug}`,
        type: 'website',
        locale: 'en_ET',
        siteName: 'HelloET',
      }
    }
  } catch {
    return {
      title: 'Business Details - HelloET Ethiopia',
      description: 'Discover local businesses in Ethiopia on HelloET.'
    }
  }
}

export default async function BusinessesDetailPage({ params }: PageProps) {
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
        description: b.description || `${b.name} - ${b.category?.name} in ${location}, Ethiopia`,
        url: `${siteUrl}/businesses/${params.slug}`,
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
        servesCuisine: b.category?.name,
        areaServed: location,
      }
    }
  } catch {
    // Ignore server-fetch error; BusinessDetail will fetch client-side with session
  }

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
