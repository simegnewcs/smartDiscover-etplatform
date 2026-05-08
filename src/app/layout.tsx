import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HelloET - Discover Local Businesses in Ethiopia',
    template: '%s | HelloET Ethiopia'
  },
  description: 'HelloET is Ethiopia\'s #1 trusted local business discovery platform. Find restaurants, hotels, cafés, pharmacies, supermarkets, tourist attractions and services in Addis Ababa, Dire Dawa, Gondar, Bahir Dar, Hawassa and across Ethiopia.',
  keywords: [
    // --- Platform ---
    'HelloET', 'HelloET Ethiopia', 'helloet.devvoltz.com',
    'Ethiopia business directory', 'Ethiopian business listings',
    'local businesses Ethiopia', 'find businesses Ethiopia',
    'Ethiopia yellow pages', 'Ethiopian companies directory',
    'verified Ethiopian businesses', 'trusted businesses Ethiopia',
    'local discovery platform Ethiopia', 'businesses near me Ethiopia',
    'Ethiopian entrepreneurs', 'small business Ethiopia',

    // --- Restaurants + Cities ---
    'restaurants in Ethiopia', 'best restaurants Ethiopia',
    'restaurants in Addis Ababa', 'best restaurants Addis Ababa',
    'restaurants in Bahir Dar', 'best restaurants Bahir Dar',
    'restaurants in Hawassa', 'best restaurants Hawassa',
    'restaurants in Gondar', 'best restaurants Gondar',
    'restaurants in Dire Dawa', 'best restaurants Dire Dawa',
    'restaurants in Mekelle', 'best restaurants Mekelle',
    'restaurants in Jimma', 'best restaurants Jimma',
    'restaurants in Adama', 'restaurants in Nazret',
    'restaurants in Harar', 'restaurants in Dessie',
    'restaurants in Debre Birhan', 'restaurants in Shashamane',
    'Ethiopian food restaurants', 'traditional Ethiopian restaurant',
    'injera restaurants Ethiopia', 'top 10 restaurants Ethiopia',
    'top 10 restaurants Addis Ababa', 'top 10 restaurants Bahir Dar',

    // --- Hotels + Cities ---
    'hotels in Ethiopia', 'best hotels Ethiopia',
    'hotels in Addis Ababa', 'best hotels Addis Ababa',
    'hotels in Bahir Dar', 'best hotels Bahir Dar',
    'hotels in Hawassa', 'best hotels Hawassa',
    'hotels in Gondar', 'best hotels Gondar',
    'hotels in Dire Dawa', 'best hotels Dire Dawa',
    'hotels in Mekelle', 'best hotels Mekelle',
    'hotels in Jimma', 'best hotels Jimma',
    'hotels in Adama', 'hotels in Nazret',
    'hotels in Harar', 'hotels in Dessie',
    'hotels in Lalibela', 'hotels in Axum',
    'hotels in Debre Birhan', 'hotels near Bole airport',
    'budget hotels Ethiopia', 'luxury hotels Addis Ababa',
    'cheap hotels Ethiopia', 'hotel booking Ethiopia',
    'top 10 hotels Ethiopia', 'top 10 hotels Addis Ababa',
    'top 10 hotels Bahir Dar', 'top 10 hotels Hawassa',

    // --- Cafes + Cities ---
    'cafes in Ethiopia', 'best cafes Ethiopia',
    'cafes in Addis Ababa', 'best cafes Addis Ababa',
    'cafes in Bahir Dar', 'best cafes Bahir Dar',
    'cafes in Hawassa', 'best cafes Hawassa',
    'cafes in Gondar', 'cafes in Dire Dawa',
    'cafes in Mekelle', 'cafes in Jimma',
    'coffee shops Ethiopia', 'coffee shops Addis Ababa',
    'Ethiopian coffee ceremony', 'specialty coffee Ethiopia',
    'top 10 cafes Ethiopia', 'top 10 cafes Addis Ababa',

    // --- Pharmacies + Cities ---
    'pharmacies in Ethiopia', 'pharmacies in Addis Ababa',
    'pharmacies in Bahir Dar', 'pharmacies in Hawassa',
    'pharmacies in Gondar', 'pharmacies in Dire Dawa',
    'pharmacies in Mekelle', 'pharmacies in Jimma',
    'pharmacy near me Ethiopia', 'Ethiopian pharmacies',
    'drug stores Ethiopia', '24 hour pharmacy Addis Ababa',

    // --- Supermarkets + Cities ---
    'supermarkets in Ethiopia', 'supermarkets in Addis Ababa',
    'supermarkets in Bahir Dar', 'supermarkets in Hawassa',
    'supermarkets in Gondar', 'supermarkets in Dire Dawa',
    'grocery stores Ethiopia', 'shopping in Addis Ababa',
    'supermarket near me Ethiopia', 'top supermarkets Ethiopia',

    // --- Tourist Attractions + Cities ---
    'tourist attractions Ethiopia', 'tourist attractions Addis Ababa',
    'tourist attractions Bahir Dar', 'tourist attractions Gondar',
    'tourist attractions Lalibela', 'tourist attractions Axum',
    'tourist attractions Dire Dawa', 'tourist attractions Harar',
    'things to do in Ethiopia', 'things to do in Addis Ababa',
    'Ethiopia tourism', 'Ethiopian heritage sites',
    'visit Ethiopia', 'travel Ethiopia', 'Ethiopia travel guide',
    'Blue Nile Falls Bahir Dar', 'Gondar castles Ethiopia',
    'Lalibela rock churches', 'Axum obelisks',
    'Bale Mountains Ethiopia', 'Omo Valley Ethiopia',

    // --- Healthcare + Cities ---
    'healthcare Ethiopia', 'hospitals in Addis Ababa',
    'hospitals in Ethiopia', 'clinics Addis Ababa',
    'clinics in Ethiopia', 'healthcare services Ethiopia',
    'private hospitals Ethiopia', 'medical centers Addis Ababa',
    'doctors in Addis Ababa', 'healthcare Bahir Dar',

    // --- Education + Cities ---
    'schools in Ethiopia', 'schools in Addis Ababa',
    'universities in Ethiopia', 'colleges Addis Ababa',
    'private schools Ethiopia', 'kindergarten Addis Ababa',
    'education services Ethiopia', 'tutoring Ethiopia',

    // --- Local Services + Cities ---
    'local services Ethiopia', 'local services Addis Ababa',
    'repair services Ethiopia', 'plumbers Addis Ababa',
    'electricians Ethiopia', 'cleaning services Addis Ababa',
    'home services Ethiopia', 'contractors Addis Ababa',

    // --- Entertainment + Cities ---
    'entertainment Ethiopia', 'entertainment Addis Ababa',
    'nightlife Addis Ababa', 'bars Addis Ababa',
    'clubs Addis Ababa', 'cinemas Ethiopia',
    'events Addis Ababa', 'things to do Addis Ababa',

    // --- City-level directories ---
    'Addis Ababa business directory', 'Bahir Dar business directory',
    'Hawassa business directory', 'Gondar business directory',
    'Dire Dawa business directory', 'Mekelle business directory',
    'Jimma business directory', 'Adama business directory',
    'businesses in Addis Ababa', 'businesses in Bahir Dar',
    'businesses in Hawassa', 'businesses in Gondar',
    'businesses in Dire Dawa', 'businesses in Mekelle',

    // --- Amharic keywords ---
    'ቢዝነስ ኢትዮጵያ', 'አዲስ አበባ ሬስቶራንት', 'ኢትዮጵያ ሆቴሎች',
    'አዲስ አበባ ካፌ', 'ኢትዮጵያ ፋርማሲ', 'አዲስ አበባ ሱፐርማርኬት',
    'ባህር ዳር ሆቴሎች', 'ሃዋሳ ሬስቶራንት', 'ጎንደር ሆቴሎች',
  ],
  authors: [{ name: 'HelloET', url: siteUrl }],
  creator: 'HelloET',
  publisher: 'HelloET',
  applicationName: 'HelloET',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_ET',
    alternateLocale: ['am_ET'],
    url: siteUrl,
    siteName: 'HelloET - Ethiopia Business Discovery',
    title: 'HelloET - Discover Local Businesses in Ethiopia',
    description: 'Ethiopia\'s trusted local business discovery platform. Find restaurants, hotels, cafés, pharmacies and more in Addis Ababa and across Ethiopia.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HelloET - Ethiopia Local Business Discovery Platform',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@helloet',
    creator: '@helloet',
    title: 'HelloET - Discover Local Businesses in Ethiopia',
    description: 'Ethiopia\'s trusted local business discovery platform. Find restaurants, hotels, cafés and more.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-ET': siteUrl,
      'am-ET': siteUrl,
    },
  },
  category: 'Business Directory',
  classification: 'Business',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'geo.region': 'ET',
    'geo.placename': 'Ethiopia',
    'geo.position': '9.1450;40.4897',
    'ICBM': '9.1450, 40.4897',
    'og:country-name': 'Ethiopia',
    'og:locality': 'Addis Ababa',
    'og:region': 'Addis Ababa',
    'rating': 'general',
    'revisit-after': '3 days',
    'language': 'English',
    'copyright': 'HelloET',
    'theme-color': '#006747',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
