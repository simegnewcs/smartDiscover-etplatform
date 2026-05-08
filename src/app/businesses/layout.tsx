import type { Metadata } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: 'Browse All Businesses in Ethiopia - Restaurants, Hotels, Cafés & More',
  description: 'Browse and search thousands of verified local businesses in Ethiopia. Filter by category and city. Find restaurants, hotels, cafés, pharmacies, supermarkets, tourist spots and services in Addis Ababa, Dire Dawa, Gondar, Bahir Dar, Hawassa and all Ethiopian cities.',
  keywords: [
    'all businesses Ethiopia', 'Ethiopian business listings', 'browse businesses Ethiopia',
    'restaurants Ethiopia', 'hotels Ethiopia', 'cafes Ethiopia', 'pharmacies Ethiopia',
    'supermarkets Ethiopia', 'tourist attractions Ethiopia', 'services Ethiopia',
    'Addis Ababa businesses', 'Dire Dawa businesses', 'Gondar businesses',
    'Bahir Dar businesses', 'Hawassa businesses', 'Mekelle businesses',
    'find restaurants Ethiopia', 'find hotels Ethiopia', 'find cafes Ethiopia',
    'local businesses near me Ethiopia', 'verified businesses Ethiopia',
    'Ethiopian directory', 'search businesses Ethiopia', 'business listings Addis Ababa',
    'repair services Ethiopia', 'local services Ethiopia',
    'Ethiopian food restaurants', 'international restaurants Addis Ababa',
    'budget hotels Ethiopia', 'luxury hotels Addis Ababa',
    'pharmacies Addis Ababa', 'supermarkets Addis Ababa',
    'ሬስቶራንቶች ኢትዮጵያ', 'ሆቴሎች ኢትዮጵያ', 'ቤዝነሶች ኢትዮጵያ'
  ],
  alternates: {
    canonical: `${siteUrl}/businesses`,
  },
  openGraph: {
    title: 'Browse All Businesses in Ethiopia | HelloET',
    description: 'Search and filter thousands of verified businesses in Ethiopia by category, city, and keyword.',
    url: `${siteUrl}/businesses`,
    type: 'website',
    locale: 'en_ET',
    siteName: 'HelloET',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HelloET - Browse Ethiopian Businesses' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse All Businesses in Ethiopia | HelloET',
    description: 'Search thousands of verified businesses in Ethiopia - restaurants, hotels, cafes and more.',
    images: ['/og-image.png'],
  },
}

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
