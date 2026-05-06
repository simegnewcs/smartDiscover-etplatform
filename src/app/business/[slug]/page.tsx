import { Metadata } from 'next'
import BusinessDetail from '@/components/business/BusinessDetail'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business/${params.slug}`)
    const data = await response.json()
    
    if (!data.success) {
      return {
        title: 'Business Not Found - HelloET',
        description: 'The business you are looking for could not be found.'
      }
    }

    const business = data.data
    const title = `${business.name} - ${business.category.name} in ${business.city.name} | HelloET`
    const description = business.description 
      ? `${business.description.substring(0, 160)}...`
      : `Find ${business.name}, a ${business.category.name} in ${business.city.name}, Ethiopia. Get contact info, reviews, and more.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: business.images?.[0] ? [business.images[0].imageUrl] : [],
        type: 'website',
        locale: 'en_ET',
        siteName: 'HelloET'
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: business.images?.[0] ? [business.images[0].imageUrl] : []
      },
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/business/${params.slug}`
      }
    }
  } catch (error) {
    return {
      title: 'Business - HelloET',
      description: 'Discover local businesses in Ethiopia'
    }
  }
}

export default async function BusinessPage({ params }: PageProps) {
  return <BusinessDetail slug={params.slug} />
}
