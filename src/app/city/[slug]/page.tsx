import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { MapPin, Star, Phone, CheckCircle2, Building2, ArrowRight } from 'lucide-react'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

interface PageProps {
  params: {
    slug: string
  }
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cityName = formatSlugToTitle(params.slug)
  const title = `Local Businesses in ${cityName}, Ethiopia - Restaurants, Hotels, Cafes & Services | HelloET`
  const description = `Discover top-rated local businesses in ${cityName}, Ethiopia. Find verified restaurants, hotels, cafes, pharmacies, supermarkets, attractions, and local services in ${cityName} on HelloET.`
  const canonicalUrl = `${siteUrl}/city/${params.slug}`

  return {
    title,
    description,
    keywords: [
      `businesses in ${cityName}`,
      `restaurants in ${cityName}`,
      `hotels in ${cityName}`,
      `cafes in ${cityName}`,
      `pharmacies in ${cityName}`,
      `supermarkets in ${cityName}`,
      `${cityName} business directory`,
      `${cityName} Ethiopia places`,
      `best places in ${cityName}`,
      `${cityName} yellow pages`,
      'HelloET Ethiopia',
      `ቢዝነሶች ${cityName}`,
      `ሬስቶራንት ${cityName}`,
      `ሆቴል ${cityName}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale: 'en_ET',
      siteName: 'HelloET Ethiopia',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Businesses in ${cityName}, Ethiopia - HelloET Directory`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
      site: '@helloet',
    },
  }
}

export default async function CityPage({ params }: PageProps) {
  const cityName = formatSlugToTitle(params.slug)
  const canonicalUrl = `${siteUrl}/city/${params.slug}`

  let businesses: any[] = []
  let cityData: any = null

  try {
    cityData = await prisma.city.findFirst({
      where: {
        OR: [
          { name: { equals: cityName } },
          { name: { contains: params.slug.replace(/-/g, ' ') } },
        ]
      }
    })

    businesses = await prisma.business.findMany({
      where: {
        OR: [
          { city: { name: { contains: cityName } } },
          ...(cityData ? [{ cityId: cityData.id }] : [])
        ]
      },
      include: {
        category: true,
        city: true,
        subcity: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } }
      },
      orderBy: [
        { verified: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 24,
    })
  } catch (err) {
    console.warn('[City SEO] Error querying DB:', err)
  }

  // Schema.org: ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top Businesses in ${cityName}, Ethiopia`,
    description: `Directory of verified local businesses located in ${cityName}, Ethiopia.`,
    itemListElement: businesses.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      url: `${siteUrl}/business/${b.slug}`
    }))
  }

  // Schema.org: BreadcrumbList
  const breadcrumbSchema = {
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
        name: 'Cities',
        item: `${siteUrl}/businesses`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cityName,
        item: canonicalUrl
      }
    ]
  }

  // Schema.org: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the top rated businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Top verified businesses in ${cityName} include restaurants, hotels, cafes, supermarkets, and essential services listed with verified ratings and phone numbers on HelloET.`
        }
      },
      {
        '@type': 'Question',
        name: `How do I list my business in ${cityName} on HelloET?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Business owners in ${cityName} can register an account on HelloET, select "${cityName}" as their city, add their address, hours, and photos to appear in this directory.`
        }
      }
    ]
  }

  const popularCategories = ['Restaurants', 'Hotels', 'Cafes', 'Pharmacies', 'Supermarkets', 'Tourist Attractions', 'Local Services']

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-neutral-500">
            <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
            <span>/</span>
            <Link href="/businesses" className="hover:text-emerald-700 transition">Cities</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">{cityName}</span>
          </nav>

          {/* Header section */}
          <header className="mb-8 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{cityName}, Ethiopia City Guide</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
              Local Businesses & Services in {cityName}
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
              Discover verified restaurants, hotels, cafes, pharmacies, and trusted local businesses across {cityName}, Ethiopia. Find contact numbers, working hours, and maps.
            </p>

            {/* Category Quick Filters */}
            <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500">Browse Categories:</span>
              {popularCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/businesses?category=${encodeURIComponent(cat)}&city=${encodeURIComponent(cityName)}`}
                  className="px-3 py-1 bg-neutral-100 hover:bg-emerald-600 hover:text-white rounded-full text-xs font-medium text-neutral-700 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </header>

          {/* Listings Grid */}
          {businesses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8">
              <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-neutral-800 mb-2">No businesses listed in {cityName} yet</h2>
              <p className="text-sm text-neutral-500 mb-6">Are you a business owner in {cityName}? List your business today!</p>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                <span>Add Your Business in {cityName}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => {
                const avgRating = b.reviews?.length
                  ? (b.reviews.reduce((s: number, r: any) => s + r.rating, 0) / b.reviews.length).toFixed(1)
                  : '5.0'
                const location = b.subcity ? `${b.subcity.name}, ${b.city.name}` : b.city.name
                const img = b.images?.[0]?.imageUrl || '/HELLOTLOGO.png'

                return (
                  <article
                    key={b.id.toString()}
                    className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    <Link href={`/business/${b.slug}`} className="relative h-48 w-full bg-neutral-100 overflow-hidden block">
                      <Image
                        src={img}
                        alt={`${b.name} in ${cityName}, Ethiopia`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {b.verified && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                          <span>{b.category?.name || 'Local Business'}</span>
                        </div>
                        <h2 className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition line-clamp-1 mb-2">
                          <Link href={`/business/${b.slug}`}>{b.name}</Link>
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                        {b.description && (
                          <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                            {b.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-neutral-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{avgRating}</span>
                          <span className="text-neutral-400 font-normal">({b._count?.reviews || 0})</span>
                        </div>
                        {b.phone ? (
                          <span className="text-neutral-600 font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {b.phone}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            View Details <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

          {/* SEO Content Guide */}
          <section className="mt-12 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Local Directory for {cityName}, Ethiopia
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              {cityName} is one of Ethiopia's key commercial and cultural hubs. HelloET helps residents, domestic travelers, and international visitors discover vetted local services, dining, hospitality, and shopping spots throughout {cityName}.
            </p>

            <h3 className="text-base font-bold text-neutral-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-xl">
                <strong className="text-neutral-900 block mb-1">How can I find businesses near me in {cityName}?</strong>
                <p className="text-neutral-600">Use the category filter buttons above or search directly on HelloET with your specific subcity or neighborhood name in {cityName}.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <strong className="text-neutral-900 block mb-1">Are business phone numbers and locations up to date?</strong>
                <p className="text-neutral-600">Yes! Verified listings on HelloET are confirmed directly with business owners to ensure accurate telephone numbers, working hours, and coordinates.</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
