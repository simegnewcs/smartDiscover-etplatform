import type { Metadata } from 'next'
import HeroSection from '@/components/layout/HeroSection'
import TrustStrip from '@/components/layout/TrustStrip'
import CategoryGrid from '@/components/layout/CategoryGrid'
import FeaturedListings from '@/components/layout/FeaturedListings'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: 'HelloET - Find Local Businesses in Ethiopia | Ethiopia Business Directory',
  description: 'Discover trusted local businesses in Ethiopia. Search restaurants, hotels, cafés, pharmacies, supermarkets, tourist attractions, and local services in Addis Ababa, Dire Dawa, Gondar, Bahir Dar, Hawassa, Mekelle and all Ethiopian cities.',
  keywords: [
    'Ethiopia business directory', 'local businesses Ethiopia', 'find business Ethiopia',
    'restaurants Addis Ababa', 'hotels Addis Ababa', 'cafes Addis Ababa',
    'pharmacies Addis Ababa', 'supermarkets Ethiopia', 'Ethiopian restaurants',
    'tourist attractions Ethiopia', 'local services Ethiopia',
    'Addis Ababa restaurants', 'Addis Ababa hotels', 'Addis Ababa cafes',
    'Ethiopia yellow pages', 'Ethiopian business listings', 'Ethiopian companies',
    'businesses near me Ethiopia', 'trusted businesses Ethiopia',
    'Ethiopian food delivery', 'Ethiopia tourism', 'Ethiopian shops',
    'Dire Dawa restaurants', 'Gondar hotels', 'Bahir Dar restaurants',
    'Hawassa hotels', 'Mekelle businesses', 'Jimma restaurants',
    'best restaurants Ethiopia', 'best hotels Ethiopia',
    'HelloET Ethiopia', 'helloet.com', 'discover Ethiopia',
    'ቢዝነስ ኢትዮጵያ', 'አዲስ አበባ', 'ኢትዮጵያ ሬስቶራንት', 'ኢትዮጵያ ሆቴሎች'
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'HelloET - Find Local Businesses in Ethiopia',
    description: 'Ethiopia\'s #1 business discovery platform. Find restaurants, hotels, cafés, pharmacies and more across all Ethiopian cities.',
    url: siteUrl,
    type: 'website',
    locale: 'en_ET',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HelloET Ethiopia Business Directory' }],
  },
}

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HelloET',
  alternateName: 'HelloET Ethiopia',
  url: siteUrl,
  description: 'Ethiopia\'s trusted local business discovery platform',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/businesses?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
}

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HelloET',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: 'Ethiopia\'s #1 trusted local business discovery platform connecting users with verified local businesses across Ethiopia.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ET',
    addressLocality: 'Addis Ababa',
    addressRegion: 'Addis Ababa'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Amharic']
  },
  sameAs: [
    'https://helloet.devvoltz.com'
  ]
}

const jsonLdLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusinessDirectory',
  name: 'HelloET Business Directory',
  url: siteUrl,
  description: 'Find verified local businesses across Ethiopia including restaurants, hotels, cafes, pharmacies, and more.',
  areaServed: {
    '@type': 'Country',
    name: 'Ethiopia'
  }
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
      />
      <div className="min-h-screen bg-white">
        <HeroSection />
        <TrustStrip />
        <CategoryGrid />
        <FeaturedListings />
      </div>
    </>
  )
}
