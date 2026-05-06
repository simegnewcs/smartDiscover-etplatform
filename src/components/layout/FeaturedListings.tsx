import { Star, MapPin, Clock, Phone } from 'lucide-react'

export default function FeaturedListings() {
  const featuredBusinesses = [
    {
      id: 1,
      name: 'Kuriftu Resort & Spa',
      category: 'Hotel',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
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
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
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
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
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
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=400',
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
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
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
      image: 'https://images.unsplash.com/photo-1572004476178-6132bae9b5de?w=400',
      location: 'Addis Ababa, Arada',
      rating: 4.9,
      reviews: 523,
      isOpen: true,
      phone: '+251 111 119 266',
      description: 'Home to Lucy and Ethiopian historical artifacts'
    }
  ]

  return (
    <div className="py-16 px-4 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Featured Businesses
          </h2>
          <p className="text-lg text-neutral-600">
            Discover top-rated places in your area
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBusinesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-neutral-700">
                  {business.category}
                </div>
                {business.isOpen && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Open Now
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-lg text-neutral-800 mb-2 group-hover:text-[#00523A] transition-colors">
                  {business.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-neutral-700">
                    {business.rating}
                  </span>
                  <span className="text-sm text-neutral-500">
                    ({business.reviews} reviews)
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-neutral-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{business.location}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-neutral-600 mb-3">
                  <Phone className="w-4 h-4" />
                  <span>{business.phone}</span>
                </div>
                
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {business.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-[#006747] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#00523A] transition-colors">
            View All Businesses
          </button>
        </div>
      </div>
    </div>
  )
}
