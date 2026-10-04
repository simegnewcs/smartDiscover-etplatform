'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  X, 
  Home, 
  Building2, 
  Search, 
  User, 
  LogIn, 
  Plus, 
  Star, 
  Phone, 
  MapPin,
  Utensils,
  Bed,
  Coffee,
  Pill,
  ShoppingCart,
  Camera,
  Wrench,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface UniversalSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  businessCount: number
}

// Map category names to icons
const iconMap: Record<string, any> = {
  'Restaurants': Utensils,
  'Hotels': Bed,
  'Cafes': Coffee,
  'Pharmacies': Pill,
  'Supermarkets': ShoppingCart,
  'Tourist Attractions': Camera,
  'Local Services': Wrench,
  'Education': Star,
  'Healthcare': Star,
  'Entertainment': Star,
  'default': Building2
}

export default function UniversalSidebar({ isOpen, onClose }: UniversalSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-[#16A34A] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 md:w-96 lg:w-80`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border border-white/20 bg-white">
                <Image src="/HELLOTLOGO.png" alt="HelloET Logo" fill className="object-cover" priority />
              </div>
              <span className="text-xl font-bold text-white">HelloET</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-green-100 hover:text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Main Navigation */}
            <div className="space-y-1 mb-6">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-white/20 text-white border-l-2 border-white"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link
                href="/businesses"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">All Businesses</span>
              </Link>
              
              <Link
                href="/search"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
                <span className="font-medium">Search</span>
              </Link>
            </div>

            {/* Categories Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-3 px-3">
                Categories
              </h3>
              <div className="space-y-1">
                {loading ? (
                  <div className="px-3 py-2 text-green-200">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="px-3 py-2 text-green-200">No categories found</div>
                ) : (
                  categories.map((category) => {
                    const Icon = iconMap[category.name.split(' - ')[0]] || iconMap['default']
                    const isExpanded = expandedCategories.includes(category.name)
                    
                    return (
                      <Link
                        key={category.id}
                        href={`/businesses?category=${encodeURIComponent(category.name)}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-green-200" />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <span className="text-xs text-green-200 bg-white/10 px-2 py-1 rounded-full">
                          {category.businessCount}
                        </span>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>

            {/* Popular Locations */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-3 px-3">
                Popular Locations
              </h3>
              <div className="space-y-1">
                {['Addis Ababa', 'Bole', 'Piassa', 'Airport', 'Mekanisa'].map((location) => (
                  <Link
                    key={location}
                    href={`/search?location=${encodeURIComponent(location)}`}
                    onClick={onClose}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <MapPin className="w-5 h-5 text-green-200" />
                    <span className="font-medium">{location}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Section */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-3 px-3">
                Account
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onClose()
                    // Open login modal or navigate to login
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </button>
                
                <button
                  onClick={() => {
                    onClose()
                    // Open register modal or navigate to register
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Register</span>
                </button>
                
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </div>
            </div>

            {/* Add Business CTA */}
            <div className="mt-6 px-3">
              <Link
                href="/auth/register"
                onClick={onClose}
                className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-green-50 text-[#16A34A] px-4 py-3 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span className="font-bold">Add Your Business</span>
              </Link>
            </div>

            {/* Support */}
            <div className="mt-auto pt-6 border-t border-white/20">
              <Link
                href="/help"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10 hover:text-white transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Help & Support</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
