'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import './featured-card.css'

interface Business {
  id: string | number
  slug: string
  name: string
  category: string
  image?: string
  location: string
  rating: number
  reviewCount?: number
  isOpen?: boolean
  phone?: string
  description?: string
}

export default function FeaturedListings() {
  const fallbackBusinesses: Business[] = [
    {
      id: 1,
      slug: 'kuriftu-resort',
      name: 'Kuriftu Resort & Spa',
      category: 'Hotel',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      location: 'Addis Ababa, Bole',
      rating: 4.8,
      isOpen: true,
      phone: '+251 116 670 000',
      description: 'Luxury resort with spa and conference facilities'
    },
    {
      id: 2,
      slug: 'tomoca-coffee',
      name: 'Tomoca Coffee',
      category: 'Café',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
      location: 'Addis Ababa, Piassa',
      rating: 4.6,
      isOpen: true,
      phone: '+251 111 565 775',
      description: 'Traditional Ethiopian coffee since 1953'
    },
    {
      id: 3,
      slug: 'yod-abyssinia',
      name: 'Yod Abyssinia',
      category: 'Restaurant',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      location: 'Addis Ababa, Bole',
      rating: 4.7,
      isOpen: true,
      phone: '+251 116 617 034',
      description: 'Authentic Ethiopian cuisine and cultural show'
    },
    {
      id: 4,
      slug: 'aster-pharmacy',
      name: 'Aster Pharmacy',
      category: 'Pharmacy',
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=600&q=80',
      location: 'Addis Ababa, Mekanisa',
      rating: 4.5,
      isOpen: true,
      phone: '+251 113 770 919',
      description: 'Full-service pharmacy with medical supplies'
    },
    {
      id: 5,
      slug: 'shoa-supermarket',
      name: 'Shoa Supermarket',
      category: 'Supermarket',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
      location: 'Addis Ababa, Bole',
      rating: 4.4,
      isOpen: true,
      phone: '+251 116 630 025',
      description: 'Groceries, fresh produce, and household items'
    },
    {
      id: 6,
      slug: 'national-museum',
      name: 'National Museum of Ethiopia',
      category: 'Tourist Attraction',
      image: 'https://images.unsplash.com/photo-1572004476178-6132bae9b5de?w=600&q=80',
      location: 'Addis Ababa, Arada',
      rating: 4.9,
      isOpen: true,
      phone: '+251 111 119 266',
      description: 'Home to Lucy and Ethiopian historical artifacts'
    }
  ]

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/search?limit=8')
        const data = await res.json()
        if (data.success && data.data.businesses.length > 0) {
          setBusinesses(data.data.businesses)
        } else {
          // If no verified businesses exist yet in the DB, show fallbacks
          setBusinesses(fallbackBusinesses)
        }
      } catch (error) {
        console.error('Error fetching featured businesses:', error)
        setBusinesses(fallbackBusinesses)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  if (loading) {
    return (
      <div className="py-24 px-4 bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A34A]"></div>
      </div>
    )
  }

  return (
    <div className="py-24 px-4 bg-neutral-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-neutral-800 mb-2">
              Featured Businesses
            </h2>
            <p className="text-neutral-500">
              Discover the most highly-rated places in your area.
            </p>
          </div>
          <Link href="/businesses" className="hidden md:inline-flex text-[#16A34A] hover:text-[#036246] font-medium mt-4 md:mt-0">
            View All Top Businesses &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="featured-card">
              <img
                src={business.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'}
                alt={business.name}
                className="image"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80'
                }}
              />
              <div className="content">
                <Link href={`/business/${business.slug}`}>
                  <span className="title">{business.name}</span>
                </Link>
                <p className="desc">{business.description || 'Discover this amazing local business on HelloET.'}</p>
                <Link className="action" href={`/business/${business.slug}`}>
                  Find out more
                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile View All */}
        <div className="text-center mt-8 md:hidden">
          <Link href="/businesses" className="inline-flex text-[#16A34A] font-medium">
            View All Top Businesses &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

