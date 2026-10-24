import type { Metadata } from 'next'
import HeroSection from '@/components/layout/HeroSection'
import TrustStrip from '@/components/layout/TrustStrip'
import CategoryGrid from '@/components/layout/CategoryGrid'
import FeaturedListings from '@/components/layout/FeaturedListings'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: "HelloET - Ethiopia's #1 Local Discovery | Best Restaurants, Top Hotels & Places Near Me",
  description: "Search better restaurants, top 10 hotels, traditional coffee houses, supermarkets, and 24/7 pharmacies across Addis Ababa, Bahir Dar, Hawassa and all Ethiopia. Verified reviews, direct phone numbers, and instant GPS directions on HelloET.",
  keywords: [
    // --- Direct Search Queries (Competitive with TripAdvisor, Booking.com, Top10Hotels) ---
    'better restaurant in Addis Ababa', 'best restaurants Addis Ababa', 'top 10 restaurants Addis Ababa',
    'nearest restaurant', 'nearest restaurant to me', 'restaurants near me Addis Ababa', 'restaurants open now Addis Ababa',
    'best hotels Addis Ababa', 'top 10 hotels Addis Ababa', 'nearest hotel', 'nearest hotel near me',
    'hotels in Addis Ababa booking', 'luxury hotels Addis Ababa', 'cheap hotels Addis Ababa', 'hotels near Bole airport',
    'coffee house near me', 'coffee house Addis Ababa', 'best cafes Addis Ababa', 'traditional Ethiopian coffee',
    'bunna bet near me', 'specialty coffee Addis Ababa', 'cafes in Bole',
    'nearest supermarket', 'supermarkets in Addis Ababa near me', 'grocery store Addis Ababa',
    'nearest pharmacy', 'pharmacy near me Addis Ababa', '24 hour pharmacy Addis Ababa', 'emergency pharmacy Ethiopia',
    'tourist attractions Addis Ababa', 'things to do in Addis Ababa', 'places to visit in Ethiopia',
    'Tripadvisor Addis Ababa', 'Booking com Addis Ababa', 'Top10Hotels Ethiopia',
    // --- Cities ---
    'restaurants Bahir Dar', 'hotels Bahir Dar', 'hotels Hawassa', 'restaurants Hawassa',
    'hotels Gondar', 'hotels Lalibela', 'restaurants Dire Dawa', 'cafes Jimma',
    // --- Amharic search terms ---
    'ምርጥ ሬስቶራንት አዲስ አበባ', 'አዲስ አበባ ሆቴሎች', 'አቅራቢያዬ ያለ ፋርማሲ', 'አዲስ አበባ ካፌ',
    'የኢትዮጵያ ቢዝነስ ማውጫ', 'ቦሌ ሬስቶራንት'
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "HelloET - Find Better Restaurants, Top Hotels & Places Near Me in Ethiopia",
    description: "Ethiopia's premier local discovery directory. Find top 10 restaurants, verified hotels, 24/7 pharmacies, coffee houses, and supermarkets across Ethiopia.",
    url: siteUrl,
    type: 'website',
    locale: 'en_ET',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HelloET Ethiopia Local Business Discovery' }],
  },
}

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HelloET',
  alternateName: 'HelloET Ethiopia',
  url: siteUrl,
  description: "Ethiopia's #1 trusted local business discovery platform for restaurants, hotels, cafes, pharmacies, and supermarkets.",
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
  logo: `${siteUrl}/HELLOTLOGO.png`,
  description: 'Ethiopia\'s #1 trusted local business discovery platform connecting users with verified local businesses across Ethiopia.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ET',
    addressLocality: 'Addis Ababa',
    addressRegion: 'Addis Ababa'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+251940192676',
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

const jsonLdTopCategories = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Popular Local Discovery Categories in Ethiopia',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Top 10 Best Restaurants in Addis Ababa',
      url: `${siteUrl}/city/addis-ababa/restaurants`
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Top 10 Best Hotels in Addis Ababa',
      url: `${siteUrl}/city/addis-ababa/hotels`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Best Coffee Houses & Cafés in Addis Ababa',
      url: `${siteUrl}/city/addis-ababa/cafes`
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Nearest 24/7 Pharmacies in Addis Ababa',
      url: `${siteUrl}/city/addis-ababa/pharmacies`
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'Best Supermarkets & Grocery Stores in Addis Ababa',
      url: `${siteUrl}/city/addis-ababa/supermarkets`
    }
  ]
}

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I find a better or top-rated restaurant in Addis Ababa or another city?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HelloET provides a verified leaderboard of the best restaurants in Addis Ababa and across Ethiopia. You can search by cuisine (traditional Ethiopian Injera, Kitfo, international, Italian), browse customer ratings, check opening hours, view food photos, and call the restaurant directly.'
      }
    },
    {
      '@type': 'Question',
      name: 'How do I find the nearest hotel, pharmacy, or supermarket near me in Ethiopia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'On HelloET, use our city and neighborhood filters (Bole, Kazanchis, Piassa, Sarbet, Yeka) or search "pharmacy", "hotel", or "supermarket". HelloET provides exact GPS coordinates, Google Maps directions, and direct telephone numbers for immediate contact.'
      }
    },
    {
      '@type': 'Question',
      name: 'Why is HelloET better than Booking.com or TripAdvisor for Ethiopia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unlike foreign platforms like Booking.com or TripAdvisor that charge hotels high commissions and often display outdated contact info, HelloET gives customers direct telephone numbers to call Ethiopian business owners directly with 0% middleman fees and local currency pricing.'
      }
    },
    {
      '@type': 'Question',
      name: 'Where can I find authentic Ethiopian traditional coffee houses (Bunna Bet) in Addis Ababa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HelloET lists iconic Ethiopian coffee spots like Tomoca Coffee, Kaldi\'s, and traditional local Bunna Bet ceremonies in Piassa, Bole, Kazanchis, and Sarbet with photos and customer reviews.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is HelloET available as a mobile app (PWA / APK)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! HelloET is a full Progressive Web App (PWA) and Android APK. You can install it directly to your phone from https://helloet.devvoltz.com/ or download the APK for offline business discovery.'
      }
    }
  ]
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTopCategories) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
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
