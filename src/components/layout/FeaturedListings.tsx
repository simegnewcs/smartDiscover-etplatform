import { Star, MapPin, Phone } from 'lucide-react'

export default function FeaturedListings() {
  const featuredBusinesses = [
    {
      id: 1,
      name: 'Kuriftu Resort & Spa',
      category: 'Hotel',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      location: 'Addis Ababa, Bole',
      rating: 4.8,
      reviews: 324,
      isOpen: true,
      phone: '+251 116 670 000',
      description: 'Luxury resort with spa and conference facilities'
    },
    {
      id: 2,
      name: 'Tomoca Coffee',
      category: 'Café',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
      location: 'Addis Ababa, Piassa',
      rating: 4.6,
      reviews: 189,
      isOpen: true,
      phone: '+251 111 565 775',
      description: 'Traditional Ethiopian coffee since 1953'
    },
    {
      id: 3,
      name: 'Yod Abyssinia',
      category: 'Restaurant',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      location: 'Addis Ababa, Bole',
      rating: 4.7,
      reviews: 456,
      isOpen: true,
      phone: '+251 116 617 034',
      description: 'Authentic Ethiopian cuisine and cultural show'
    },
    {
      id: 4,
      name: 'Aster Pharmacy',
      category: 'Pharmacy',
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=600&q=80',
      location: 'Addis Ababa, Mekanisa',
      rating: 4.5,
      reviews: 98,
      isOpen: true,
      phone: '+251 113 770 919',
      description: 'Full-service pharmacy with medical supplies'
    },
    {
      id: 5,
      name: 'Shoa Supermarket',
      category: 'Supermarket',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
      location: 'Addis Ababa, Bole',
      rating: 4.4,
      reviews: 267,
      isOpen: true,
      phone: '+251 116 630 025',
      description: 'Groceries, fresh produce, and household items'
    },
    {
      id: 6,
      name: 'National Museum of Ethiopia',
      category: 'Tourist Attraction',
      image: 'https://images.unsplash.com/photo-1572004476178-6132bae9b5de?w=600&q=80',
      location: 'Addis Ababa, Arada',
      rating: 4.9,
      reviews: 523,
      isOpen: true,
      phone: '+251 111 119 266',
      description: 'Home to Lucy and Ethiopian historical artifacts'
    }
  ]

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
          <a href="/businesses" className="hidden md:inline-flex text-[#047857] hover:text-[#036246] font-medium mt-4 md:mt-0">
            View All Top Businesses &rarr;
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBusinesses.map((business) => (
            <div
              key={business.id}
              className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative h-60 overflow-hidden bg-neutral-100">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-neutral-700 shadow-sm">
                    {business.category}
                  </div>
                </div>
                {business.isOpen && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                    Open
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-neutral-800 group-hover:text-[#047857] transition-colors line-clamp-1">
                    {business.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-sm text-neutral-800">{business.rating}</span>
                  </div>
                </div>
                
                <p className="text-neutral-500 text-sm mb-4 line-clamp-2 flex-1">
                  {business.description}
                </p>
                
                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium">{business.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium">{business.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile View All */}
        <div className="text-center mt-8 md:hidden">
          <a href="/businesses" className="inline-flex text-[#047857] font-medium">
            View All Top Businesses &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}

