'use client'

import Link from 'next/link'
import { 
  Utensils, 
  Bed, 
  Coffee, 
  Pill, 
  ShoppingCart, 
  Camera, 
  MapPin, 
  Wrench,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'

export default function CategoryGrid() {
  const categories = [
    {
      icon: Utensils,
      title: 'Restaurants',
      description: 'Find the best dining experiences',
      count: '2,847',
      color: 'from-[#006747] to-[#008B5F]',
      bgColor: 'bg-[#D1EFE4]',
      href: '/businesses?category=restaurant'
    },
    {
      icon: Bed,
      title: 'Hotels',
      description: 'Comfortable stays for every budget',
      count: '1,523',
      color: 'from-[#5B7C99] to-[#7BA3C4]',
      bgColor: 'bg-blue-100',
      href: '/businesses?category=hotel'
    },
    {
      icon: Coffee,
      title: 'Cafés',
      description: 'Perfect spots for coffee and work',
      count: '892',
      color: 'from-[#8B6914] to-[#B8860B]',
      bgColor: 'bg-amber-100',
      href: '/businesses?category=cafe'
    },
    {
      icon: Pill,
      title: 'Pharmacies',
      description: 'Health and wellness essentials',
      count: '456',
      color: 'from-[#C41E3A] to-[#E3425F]',
      bgColor: 'bg-red-100',
      href: '/businesses?category=pharmacy'
    },
    {
      icon: ShoppingCart,
      title: 'Supermarkets',
      description: 'Groceries and daily necessities',
      count: '678',
      color: 'from-[#2E7D32] to-[#4CAF50]',
      bgColor: 'bg-green-100',
      href: '/businesses?category=supermarket'
    },
    {
      icon: Camera,
      title: 'Tourist Attractions',
      description: 'Explore Ethiopia\'s treasures',
      count: '234',
      color: 'from-[#7B1FA2] to-[#9C27B0]',
      bgColor: 'bg-purple-100',
      href: '/businesses?category=tourist-attraction'
    },
    {
      icon: MapPin,
      title: 'Local Services',
      description: 'Professional services near you',
      count: '1,123',
      color: 'from-[#E65100] to-[#FF6F00]',
      bgColor: 'bg-orange-100',
      href: '/businesses?category=local-service'
    },
    {
      icon: Wrench,
      title: 'Repair Services',
      description: 'Fix and maintenance solutions',
      count: '567',
      color: 'from-[#455A64] to-[#607D8B]',
      bgColor: 'bg-gray-200',
      href: '/businesses?category=repair-service'
    }
  ]

  return (
    <div className="py-20 px-4 bg-gradient-to-b from-white via-[#D1EFE4]/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#006747]/10 border border-[#006747]/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#006747]" />
            <span className="text-sm font-medium text-[#006747]">Discover More</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
            Explore <span className="text-[#006747]">Categories</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover businesses across different categories and find exactly what you\'re looking for
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#006747] via-[#EEF578] to-[#006747] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '2px' }}>
                <div className="w-full h-full bg-white rounded-2xl" />
              </div>
              
              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon with Gradient Background */}
                <div className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <category.icon className="w-8 h-8 text-[#006747]" />
                </div>
                
                {/* Title with Arrow */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl text-neutral-800 group-hover:text-[#006747] transition-colors duration-300">
                    {category.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-[#006747] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                
                {/* Description */}
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                  {category.description}
                </p>
                
                {/* Count Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#D1EFE4] to-[#EEF578]/50 rounded-full text-xs font-semibold text-[#006747] border border-[#006747]/10">
                    {category.count} businesses
                  </span>
                </div>
              </div>
              
              {/* Hover Gradient Overlay */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            </Link>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-12">
          <Link 
            href="/businesses"
            className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <span>View All Categories</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </div>
  )
}
