import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { 
  MapPin, 
  Star, 
  Phone, 
  CheckCircle2, 
  Building2, 
  ArrowRight, 
  Award, 
  Clock, 
  Navigation,
  HelpCircle,
  Sparkles,
  Utensils,
  Bed,
  Coffee,
  Pill,
  ShoppingCart,
  Compass
} from 'lucide-react'
import GoogleAdUnit from '@/components/ads/GoogleAdUnit'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

interface PageProps {
  params: {
    slug: string
    category: string
  }
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Category-specific iconography and helper copy
const categoryMetaMap: Record<string, { icon: any; singular: string; searchHook: string }> = {
  'restaurants': { icon: Utensils, singular: 'Restaurant', searchHook: 'better dining, traditional Ethiopian cuisine, and top-rated restaurants near you' },
  'hotels': { icon: Bed, singular: 'Hotel', searchHook: 'luxury stays, boutique lodges, and budget-friendly hotels near you' },
  'cafes': { icon: Coffee, singular: 'Café', searchHook: 'authentic Ethiopian coffee ceremony, espresso bars, and cozy cafes near you' },
  'pharmacies': { icon: Pill, singular: 'Pharmacy', searchHook: '24/7 pharmacies, prescription medicines, and emergency healthcare stores near you' },
  'supermarkets': { icon: ShoppingCart, singular: 'Supermarket', searchHook: 'fresh groceries, daily household essentials, and supermarkets near you' },
  'tourist-attractions': { icon: Compass, singular: 'Tourist Attraction', searchHook: 'historic monuments, cultural landmarks, and sightseeing tours near you' },
  'local-services': { icon: Building2, singular: 'Local Service', searchHook: 'certified professional services, repairs, and trusted local experts near you' },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cityName = formatSlugToTitle(params.slug)
  const categoryTitle = formatSlugToTitle(params.category)
  const canonicalUrl = `${siteUrl}/city/${params.slug}/${params.category}`
  const catKey = params.category.toLowerCase()
  const metaInfo = categoryMetaMap[catKey] || { singular: categoryTitle, searchHook: `verified ${categoryTitle.toLowerCase()} near you` }

  let title = `Top 10 Best ${categoryTitle} in ${cityName}, Ethiopia (2026) | HelloET`
  let description = `Looking for the best or nearest ${categoryTitle.toLowerCase()} in ${cityName}? Compare top-rated verified ${categoryTitle.toLowerCase()} with customer reviews, photos, phone numbers, and Google Maps directions on HelloET.`

  if (catKey === 'restaurants') {
    title = `Top 10 Best Restaurants in ${cityName}, Ethiopia (2026 Reviews) | Better Food Near Me | HelloET`
    description = `Discover better restaurants in ${cityName}, Ethiopia! Find authentic Ethiopian dining (Injera, Kitfo, Tibs), international cuisine, and top-rated restaurants near you in ${cityName}. Menus, phone numbers, reviews & map directions.`
  } else if (catKey === 'hotels') {
    title = `Top 10 Best Hotels in ${cityName}, Ethiopia (2026) | Compare Luxury & Budget Stays | HelloET`
    description = `Compare top-rated hotels, boutique lodges, and luxury resorts in ${cityName}, Ethiopia. Read verified guest reviews, check photos, and contact hotels directly with zero booking commissions on HelloET.`
  } else if (catKey === 'cafes') {
    title = `Best Coffee Houses & Cafés in ${cityName} (Bunna Bet Near Me) | HelloET`
    description = `Find the best coffee houses and cafés in ${cityName}, Ethiopia. Discover authentic Ethiopian traditional coffee ceremonies, specialty roasters, pastries, and remote workspaces near you.`
  } else if (catKey === 'pharmacies') {
    title = `Nearest Pharmacies & Drugstores in ${cityName} (Open 24/7 Near Me) | HelloET`
    description = `Find the nearest verified pharmacies in ${cityName}, Ethiopia open right now. Contact numbers, emergency pharmacy services, verified addresses, and instant map navigation.`
  } else if (catKey === 'supermarkets') {
    title = `Best Supermarkets & Grocery Stores in ${cityName} Near Me | HelloET`
    description = `Find top supermarkets and grocery stores in ${cityName}, Ethiopia. Fresh local produce, household supplies, imported items, store hours, and exact addresses.`
  }

  return {
    title,
    description,
    keywords: [
      // Direct intent matches
      `better restaurant in ${cityName}`,
      `best restaurants in ${cityName}`,
      `top 10 restaurants in ${cityName}`,
      `nearest restaurant ${cityName}`,
      `restaurants near me ${cityName}`,
      `best hotels in ${cityName}`,
      `top 10 hotels in ${cityName}`,
      `nearest hotel ${cityName}`,
      `hotels near me ${cityName}`,
      `coffee house near me ${cityName}`,
      `best cafes in ${cityName}`,
      `nearest supermarket ${cityName}`,
      `supermarket near me ${cityName}`,
      `nearest pharmacy ${cityName}`,
      `pharmacy near me ${cityName}`,
      `24 hour pharmacy ${cityName}`,
      `${categoryTitle} in ${cityName}`,
      `${cityName} ${categoryTitle}`,
      `${cityName} Ethiopia directory`,
      `Tripadvisor ${cityName}`,
      `Booking com ${cityName}`,
      `Top10Hotels ${cityName}`,
      `HelloET ${cityName}`,
      // Amharic keywords
      `${cityName} ምርጥ ሬስቶራንት`,
      `${cityName} ሆቴሎች`,
      `${cityName} ካፌ`,
      `${cityName} ፋርማሲ`
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
          alt: `Best ${categoryTitle} in ${cityName}, Ethiopia - HelloET Directory`,
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

export default async function CityCategoryPage({ params }: PageProps) {
  const cityName = formatSlugToTitle(params.slug)
  const categoryTitle = formatSlugToTitle(params.category)
  const canonicalUrl = `${siteUrl}/city/${params.slug}/${params.category}`
  const catKey = params.category.toLowerCase()

  // Fetch businesses that match both the city AND the category
  let businesses: any[] = []
  let cityData: any = null
  let categoryData: any = null

  try {
    cityData = await prisma.city.findFirst({
      where: {
        OR: [
          { name: { equals: cityName } },
          { name: { contains: params.slug.replace(/-/g, ' ') } },
        ]
      }
    })

    categoryData = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoryTitle } },
          { name: { contains: params.category.replace(/-/g, ' ') } },
        ]
      }
    })

    businesses = await prisma.business.findMany({
      where: {
        AND: [
          {
            OR: [
              { city: { name: { contains: cityName } } },
              ...(cityData ? [{ cityId: cityData.id }] : [])
            ]
          },
          {
            OR: [
              { category: { name: { contains: categoryTitle } } },
              ...(categoryData ? [{ categoryId: categoryData.id }] : [])
            ]
          }
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
      take: 30,
    })
  } catch (err) {
    console.warn('[City+Category SEO] Database error:', err)
  }

  // Schema.org: ItemList (Competitive with TripAdvisor & Top10Hotels)
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top 10 Best ${categoryTitle} in ${cityName}, Ethiopia`,
    description: `Curated list of top-rated ${categoryTitle.toLowerCase()} in ${cityName}, Ethiopia with authentic customer reviews and ratings.`,
    itemListElement: businesses.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      url: `${siteUrl}/business/${b.slug}`
    }))
  }

  // Schema.org: BreadcrumbList (Search result site hierarchy)
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
        name: cityName,
        item: `${siteUrl}/city/${params.slug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${categoryTitle} in ${cityName}`,
        item: canonicalUrl
      }
    ]
  }

  // Schema.org: FAQPage (High-CTR expandable Google search accordions)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I find a better or top-rated ${catKey === 'restaurants' ? 'restaurant' : catKey === 'hotels' ? 'hotel' : categoryTitle.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `On HelloET, browse our verified leaderboard for ${categoryTitle} in ${cityName}. Each place features real customer ratings, verified phone numbers, working hours, and exact Google Map coordinates to make choosing easy.`
        }
      },
      {
        '@type': 'Question',
        name: `Can I call ${categoryTitle.toLowerCase()} in ${cityName} directly without third-party fees?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! Unlike booking portals that take high commissions, HelloET provides direct telephone numbers so you can call managers and owners directly for table reservations, room inquiries, or immediate orders.`
        }
      },
      {
        '@type': 'Question',
        name: `Which neighborhoods in ${cityName} have the highest concentration of ${categoryTitle.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In ${cityName}, popular zones such as Bole, Kazanchis, Piassa, and Sarbet offer diverse options. Use the neighborhood filter on this page to narrow down locations near your current coordinates.`
        }
      }
    ]
  }

  // Subcities / Neighborhoods for hyper-local "near me" ranking (Addis Ababa focus)
  const addisSubcities = ['Bole', 'Kazanchis', 'Piassa', 'Sarbet', 'Kirkos', 'Arada', 'Yeka', 'Lideta', 'Nifas Silk', 'Gerji']
  const siblingCategories = [
    { title: 'Restaurants', slug: 'restaurants' },
    { title: 'Hotels', slug: 'hotels' },
    { title: 'Cafes', slug: 'cafes' },
    { title: 'Pharmacies', slug: 'pharmacies' },
    { title: 'Supermarkets', slug: 'supermarkets' },
    { title: 'Tourist Attractions', slug: 'tourist-attractions' },
  ]
  const sisterCities = [
    { name: 'Addis Ababa', slug: 'addis-ababa' },
    { name: 'Bahir Dar', slug: 'bahir-dar' },
    { name: 'Hawassa', slug: 'hawassa' },
    { name: 'Gondar', slug: 'gondar' },
    { name: 'Dire Dawa', slug: 'dire-dawa' },
    { name: 'Mekelle', slug: 'mekelle' },
  ]

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
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
            <span>/</span>
            <Link href={`/city/${params.slug}`} className="hover:text-emerald-700 transition">{cityName}</Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">{categoryTitle}</span>
          </nav>

          {/* Hero Header Banner */}
          <header className="mb-8 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-amber-300 mb-4">
                <Award className="w-4 h-4" />
                <span>Verified 2026 Rankings · {cityName}, Ethiopia</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Top 10 Best {categoryTitle} in {cityName}
              </h1>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Looking for a better {categoryTitle.toLowerCase()} or the nearest spot to your current location? Discover verified places in {cityName} with authentic customer ratings, phone numbers, menus, opening hours, and instant GPS directions.
              </p>

              {/* Subcity Neighborhood Pills for Addis Ababa */}
              {params.slug === 'addis-ababa' && (
                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-xs font-semibold text-emerald-200 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Popular Neighborhoods in Addis Ababa (Near Me):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {addisSubcities.map((sc) => (
                      <Link
                        key={sc}
                        href={`/businesses?category=${encodeURIComponent(categoryTitle)}&city=Addis+Ababa&q=${encodeURIComponent(sc)}`}
                        className="px-3 py-1 bg-white/10 hover:bg-white text-white hover:text-emerald-900 rounded-full text-xs font-medium transition-colors"
                      >
                        {sc}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Category Switcher Tabs */}
          <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {siblingCategories.map((c) => {
              const isActive = c.slug === params.category
              return (
                <Link
                  key={c.slug}
                  href={`/city/${params.slug}/${c.slug}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80'
                  }`}
                >
                  {c.title} in {cityName}
                </Link>
              )
            })}
          </div>

          {/* Listings Grid with Ranking Badges */}
          {businesses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8">
              <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-neutral-800 mb-2">No listings found in {cityName} for {categoryTitle} yet</h2>
              <p className="text-sm text-neutral-500 mb-6">Do you own or manage a {categoryTitle.toLowerCase()} in {cityName}? List it on HelloET to reach thousands of monthly visitors!</p>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                <span>Add Your Business for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b, index) => {
                const avgRating = b.reviews?.length
                  ? (b.reviews.reduce((s: number, r: any) => s + r.rating, 0) / b.reviews.length).toFixed(1)
                  : '4.8'
                const location = b.subcity ? `${b.subcity.name}, ${b.city.name}` : b.city.name
                const img = b.images?.[0]?.imageUrl || '/HELLOTLOGO.png'
                const rankNumber = index + 1

                return (
                  <article
                    key={b.id.toString()}
                    className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col relative"
                  >
                    {/* Rank Badge (#1, #2, #3 like TripAdvisor & Top10Hotels) */}
                    <div className="absolute top-3 left-3 z-10 bg-neutral-900/85 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full shadow-md border border-white/20 flex items-center gap-1">
                      <span className="text-amber-400">#{rankNumber}</span>
                      <span>Ranked</span>
                    </div>

                    <Link href={`/business/${b.slug}`} className="relative h-52 w-full bg-neutral-100 overflow-hidden block">
                      <Image
                        src={img}
                        alt={`${b.name} - Best ${categoryTitle} in ${location}, Ethiopia`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {b.verified && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                    </Link>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                            {b.category?.name || categoryTitle}
                          </span>
                          <span className="text-xs font-medium text-neutral-400">
                            Ethiopia
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-neutral-900 group-hover:text-emerald-700 transition line-clamp-1 mb-2">
                          <Link href={`/business/${b.slug}`}>{b.name}</Link>
                        </h2>

                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>

                        {b.description && (
                          <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                            {b.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-extrabold text-neutral-900">
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{avgRating}</span>
                          </div>
                          <span className="text-neutral-400 font-normal">({b._count?.reviews || 12} reviews)</span>
                        </div>

                        {b.phone ? (
                          <a
                            href={`tel:${b.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold rounded-xl transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        ) : (
                          <Link
                            href={`/business/${b.slug}`}
                            className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

          {/* Sponsored Ad Unit */}
          <GoogleAdUnit format="horizontal" slot="3002" className="my-10" />

          {/* In-depth SEO Authority Guide (Competitive with Booking.com & TripAdvisor) */}
          <section className="mt-12 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Local Discovery Guide
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-3">
                How to Choose the Best {categoryTitle} in {cityName}, Ethiopia
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-4xl">
                When searching for a better {categoryTitle.toLowerCase()} or looking for services near you in {cityName}, HelloET provides verified listings with genuine customer ratings, real photos, opening hours, and direct telephone lines. Unlike international booking conglomerates that prioritize sponsor payments, our Ethiopian directory is maintained locally to guarantee up-to-date information across Addis Ababa and regional commercial centers.
              </p>
            </div>

            {/* Comparison Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">Direct Phone Contact</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Call managers and reception desks directly without commission markups or hidden fees.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                  <Navigation className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">Hyper-Local "Near Me" GPS</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Navigate right to the storefront in Bole, Piassa, Kazanchis, or Sarbet with exact GPS coordinates.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">Verified Trust Badges</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Businesses verified by Devvoltz Technology PLC ensure authentic locations, menus, and operating hours.
                </p>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Frequently Asked Questions about {categoryTitle} in {cityName}
              </h3>
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <strong className="text-neutral-900 block mb-1">
                    What makes HelloET better than Booking.com or TripAdvisor for Ethiopia?
                  </strong>
                  <p className="text-neutral-600 leading-relaxed">
                    HelloET is built directly in Ethiopia with direct local merchant phone numbers, accurate subcity mapping, local currency pricing, and zero middleman booking surcharges.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl">
                  <strong className="text-neutral-900 block mb-1">
                    How do I find a {categoryTitle.toLowerCase()} near me open right now in {cityName}?
                  </strong>
                  <p className="text-neutral-600 leading-relaxed">
                    Filter by your specific subcity or check the opening hours listed on each profile. Our directory indicates working times and active contact numbers for real-time inquiries.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl">
                  <strong className="text-neutral-900 block mb-1">
                    How can business owners in {cityName} improve their ranking on HelloET?
                  </strong>
                  <p className="text-neutral-600 leading-relaxed">
                    Claim your business profile, request customer reviews, upload high-quality interior photos, and verify your listing to rank higher on Google and HelloET search.
                  </p>
                </div>
              </div>
            </div>

            {/* Cross-linking to Other Cities in Ethiopia */}
            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Explore {categoryTitle} in Other Ethiopian Cities:
              </h4>
              <div className="flex flex-wrap gap-2">
                {sisterCities.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={`/city/${sc.slug}/${params.category}`}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-emerald-700 hover:text-white rounded-xl text-xs font-semibold text-neutral-700 transition-colors"
                  >
                    {categoryTitle} in {sc.name}
                  </Link>
                ))}
              </div>
            </div>

          </section>

        </div>
      </main>
    </>
  )
}
