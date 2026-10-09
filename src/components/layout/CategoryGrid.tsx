import './category-card.css'
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
  ChevronRight
} from 'lucide-react'

export default function CategoryGrid() {
  const categories = [
    {
      icon: Utensils,
      title: 'Restaurants',
      description: 'Find the best dining experiences',
      count: '2,847',
      href: '/businesses?category=restaurant'
    },
    {
      icon: Bed,
      title: 'Hotels',
      description: 'Comfortable stays for every budget',
      count: '1,523',
      href: '/businesses?category=hotel'
    },
    {
      icon: Coffee,
      title: 'Cafés',
      description: 'Perfect spots for coffee and work',
      count: '892',
      href: '/businesses?category=cafe'
    },
    {
      icon: Pill,
      title: 'Pharmacies',
      description: 'Health and wellness essentials',
      count: '456',
      href: '/businesses?category=pharmacy'
    },
    {
      icon: ShoppingCart,
      title: 'Supermarkets',
      description: 'Groceries and daily necessities',
      count: '678',
      href: '/businesses?category=supermarket'
    },
    {
      icon: Camera,
      title: 'Tourist Attractions',
      description: 'Explore Ethiopia\'s treasures',
      count: '234',
      href: '/businesses?category=tourist-attraction'
    },
    {
      icon: MapPin,
      title: 'Local Services',
      description: 'Professional services near you',
      count: '1,123',
      href: '/businesses?category=local-service'
    },
    {
      icon: Wrench,
      title: 'Repair Services',
      description: 'Fix and maintenance solutions',
      count: '567',
      href: '/businesses?category=repair-service'
    }
  ]

  return (
    <div className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-neutral-800 mb-2">
              Explore Categories
            </h2>
            <p className="text-neutral-500">
              Discover businesses across different categories and find exactly what you're looking for
            </p>
          </div>
          <Link 
            href="/businesses"
            className="hidden md:inline-flex items-center gap-1 text-[#16A34A] hover:text-[#036246] font-medium mt-4 md:mt-0"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="parent mx-auto"
            >
              <div className="card">
                <div className="logo">
                  <span className="circle circle1"></span>
                  <span className="circle circle2"></span>
                  <span className="circle circle3"></span>
                  <span className="circle circle4"></span>
                  <span className="circle circle5">
                    <category.icon className="svg text-white" />
                  </span>
                </div>
                <div className="glass"></div>
                <div className="content">
                  <span className="title">{category.title}</span>
                  <span className="text">{category.description}</span>
                </div>
                <div className="bottom">
                  <div className="social-buttons-container">
                    <button className="social-button">
                      <category.icon className="svg" />
                    </button>
                    <button className="social-button">
                      <category.icon className="svg" />
                    </button>
                    <button className="social-button">
                      <category.icon className="svg" />
                    </button>
                  </div>
                  <div className="view-more">
                    <span className="view-more-button">View ({category.count})</span>
                    <svg className="svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Mobile View All */}
        <div className="text-center mt-8 md:hidden">
          <Link 
            href="/businesses"
            className="inline-flex items-center gap-1 text-[#16A34A] font-medium"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
