import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MapPin, Star, Phone, CheckCircle2, Building2, ArrowRight } from 'lucide-react'
import GoogleAdUnit from '@/components/ads/GoogleAdUnit'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

interface PageProps {
  params: {
    slug: string
  }
}

// Helper to convert slug to readable category title
function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoryTitle = formatSlugToTitle(params.slug)
  const title = `Top Rated ${categoryTitle} in Ethiopia | Best ${categoryTitle} Directory | HelloET`
  const description = `Discover top-rated ${categoryTitle.toLowerCase()} in Addis Ababa, Bahir Dar, Hawassa and across Ethiopia. Verified contact details, photos, customer reviews, opening hours, and location maps on HelloET.`
  const canonicalUrl = `${siteUrl}/category/${params.slug}`

  return {
    title,
    description,
    keywords: [
      `${categoryTitle} Ethiopia`,
      `best ${categoryTitle} Ethiopia`,
      `${categoryTitle} Addis Ababa`,
      `top ${categoryTitle} Ethiopia`,
      `${categoryTitle} near me Ethiopia`,
      `find ${categoryTitle} Ethiopia`,
      `verified ${categoryTitle} Ethiopia`,
      'Ethiopian business directory',
      'HelloET Ethiopia',
      `ሬስቶራንት ${categoryTitle}`,
      `ሆቴል ${categoryTitle}`,
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
          alt: `Best ${categoryTitle} in Ethiopia - HelloET Directory`,
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

export default async function CategoryPage({ params }: PageProps) {
  const categoryTitle = formatSlugToTitle(params.slug)
  const canonicalUrl = `${siteUrl}/category/${params.slug}`

  // Fetch category & businesses
  let businesses: any[] = []
  let categoryData: any = null

  try {
    categoryData = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoryTitle } },
          { name: { contains: params.slug.replace(/-/g, ' ') } },
        ]
      }
    })

    businesses = await prisma.business.findMany({
      where: {
        OR: [
          { category: { name: { contains: categoryTitle } } },
          ...(categoryData ? [{ categoryId: categoryData.id }] : [])
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
    console.warn('[Category SEO] Error querying DB:', err)
  }

  // Schema.org: ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top ${categoryTitle} in Ethiopia`,
    description: `Directory of top-rated ${categoryTitle.toLowerCase()} across Ethiopian cities.`,
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
        name: 'Categories',
        item: `${siteUrl}/businesses`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryTitle,
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
        name: `Where can I find the best ${categoryTitle} in Ethiopia?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can find verified ${categoryTitle.toLowerCase()} in Addis Ababa (Bole, Kazanchis, Piazza, Piassa), Bahir Dar, Hawassa, Gondar, and across Ethiopia listed with phone numbers and map directions on HelloET.`
        }
      },
      {
        '@type': 'Question',
        name: `Are the ${categoryTitle} on HelloET verified?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! Listings featuring the green verified badge have undergone verification on HelloET for legitimate location and contact details.`
        }
      }
    ]
  }

  const popularCities = ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa', 'Gondar', 'Mekelle', 'Jimma']

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
            <Link href="/businesses" className="hover:text-emerald-700 transition">Categories</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">{categoryTitle}</span>
          </nav>

          {/* Header section */}
          <header className="mb-8 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Ethiopia Business Directory</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
              Top Rated {categoryTitle} in Ethiopia
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
              Explore trusted, verified {categoryTitle.toLowerCase()} across Ethiopian cities. Compare ratings, view verified addresses, phone numbers, working hours, and customer reviews.
            </p>

            {/* City Quick Filters */}
            <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500">Filter by City:</span>
              {popularCities.map((c) => (
                <Link
                  key={c}
                  href={`/businesses?category=${encodeURIComponent(categoryTitle)}&city=${encodeURIComponent(c)}`}
                  className="px-3 py-1 bg-neutral-100 hover:bg-emerald-600 hover:text-white rounded-full text-xs font-medium text-neutral-700 transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
          </header>

          {/* Listings Grid */}
          {businesses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8">
              <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-neutral-800 mb-2">No listings found in {categoryTitle} yet</h2>
              <p className="text-sm text-neutral-500 mb-6">Be the first to list a business in this category!</p>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                <span>Add Your Business</span>
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
                        alt={`${b.name} - ${categoryTitle} in ${location}, Ethiopia`}
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
                          <span>{b.category?.name || categoryTitle}</span>
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

          {/* Sponsored Ad Unit */}
          <GoogleAdUnit format="horizontal" slot="3001" className="my-8" />

          {/* SEO Content & FAQ Section */}
          <section className="mt-12 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Finding the Best {categoryTitle} in Ethiopia
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              Ethiopia is home to vibrant businesses catering to locals, international expats, and tourists alike. Whether you are looking for traditional Ethiopian experiences or modern services in {categoryTitle.toLowerCase()}, HelloET is the premier directory to discover locations, phone contacts, authentic customer feedback, and business operating hours in Addis Ababa and all regional cities.
            </p>

            <h3 className="text-base font-bold text-neutral-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-xl">
                <strong className="text-neutral-900 block mb-1">How can I contact a listed {categoryTitle.toLowerCase()}?</strong>
                <p className="text-neutral-600">Each business profile on HelloET displays direct telephone numbers, social links, and physical addresses to connect directly with the merchant.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <strong className="text-neutral-900 block mb-1">Can I add my business to this directory?</strong>
                <p className="text-neutral-600">Yes! Business owners can register on HelloET, submit their listing details, upload photos, and obtain a verified badge to reach thousands of potential customers across Ethiopia.</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
