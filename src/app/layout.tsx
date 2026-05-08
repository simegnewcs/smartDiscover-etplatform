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
    'Ethiopia business directory', 'HelloET', 'local businesses Ethiopia',
    'restaurants Addis Ababa', 'hotels Ethiopia', 'cafes Addis Ababa',
    'pharmacies Ethiopia', 'supermarkets Addis Ababa', 'tourist attractions Ethiopia',
    'Ethiopian restaurants', 'find businesses Ethiopia', 'local services Ethiopia',
    'Addis Ababa business directory', 'Ethiopian business listings',
    'Ethiopian local discovery', 'businesses near me Ethiopia',
    'Ethiopia yellow pages', 'Ethiopian companies', 'Ethiopian shops',
    'Dire Dawa businesses', 'Gondar businesses', 'Bahir Dar businesses',
    'Hawassa businesses', 'Mekelle businesses', 'Jimma businesses',
    'Adama Nazret businesses', 'Harar businesses',
    'Ethiopian food', 'Ethiopian hotels', 'Ethiopian tourism',
    'local discovery platform Ethiopia', 'Ethiopia services directory',
    'verified Ethiopian businesses', 'trusted businesses Ethiopia',
    'Ethiopian entrepreneurs', 'small business Ethiopia',
    'ቢዝነስ ኢትዮጵያ', 'አዲስ አበባ ሬስቶራንት', 'ኢትዮጵያ ሆቴሎች'
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
