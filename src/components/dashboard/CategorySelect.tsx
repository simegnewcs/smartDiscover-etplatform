'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  X,
  Check,
  Tags,
  Building2,
  Utensils,
  Coffee,
  ShoppingCart,
  Pill,
  Sparkles,
  Camera,
  Film,
  GraduationCap,
  Wrench,
  Loader2,
  Layers
} from 'lucide-react'

export interface CategoryItem {
  id: string
  name: string
  description?: string
  icon?: string
  businessCount?: number
}

// Fallback categories if network is unavailable
const defaultFallbackCategories: CategoryItem[] = [
  { id: '1', name: 'Restaurants', description: 'Dining and food establishments', icon: 'restaurant' },
  { id: '2', name: 'Hotels', description: 'Accommodation and lodging', icon: 'hotel' },
  { id: '3', name: 'Cafes', description: 'Coffee shops and tea houses', icon: 'coffee' },
  { id: '4', name: 'Pharmacies', description: 'Drug stores and healthcare supplies', icon: 'pill' },
  { id: '5', name: 'Supermarkets', description: 'Grocery and retail stores', icon: 'shopping-cart' },
  { id: '6', name: 'Tourist Attractions', description: 'Historical and cultural sites', icon: 'landmark' },
  { id: '7', name: 'Local Services', description: 'Various local professional services', icon: 'wrench' },
  { id: '8', name: 'Education', description: 'Schools, colleges, and training centers', icon: 'graduation-cap' },
  { id: '9', name: 'Healthcare', description: 'Hospitals, clinics, and medical centers', icon: 'heartbeat' },
  { id: '10', name: 'Entertainment', description: 'Cinemas, recreation, and venues', icon: 'film' },
  { id: '11', name: 'Other', description: 'Other specialized businesses', icon: 'building' }
]

// Render category icon intelligently
export function CategoryIcon({ icon, name, className = 'w-4 h-4' }: { icon?: string; name: string; className?: string }) {
  // If icon is an emoji or custom symbol
  if (icon && (Array.from(icon).some((char) => (char.codePointAt(0) || 0) > 255) || (icon.length <= 4 && !/^[a-zA-Z-]+$/.test(icon)))) {
    return <span className="text-base leading-none select-none" role="img" aria-label={name}>{icon}</span>
  }

  const key = (icon || name || '').toLowerCase()

  if (key.includes('restaurant') || key.includes('food') || key.includes('dining')) {
    return <Utensils className={className} />
  }
  if (key.includes('cafe') || key.includes('coffee') || key.includes('tea')) {
    return <Coffee className={className} />
  }
  if (key.includes('hotel') || key.includes('motel') || key.includes('lodging') || key.includes('resort')) {
    return <Building2 className={className} />
  }
  if (key.includes('pharmacy') || key.includes('pill') || key.includes('drug') || key.includes('health') || key.includes('clinic')) {
    return <Pill className={className} />
  }
  if (key.includes('supermarket') || key.includes('grocery') || key.includes('shop') || key.includes('store') || key.includes('market')) {
    return <ShoppingCart className={className} />
  }
  if (key.includes('tourist') || key.includes('attraction') || key.includes('landmark')) {
    return <Camera className={className} />
  }
  if (key.includes('film') || key.includes('cinema') || key.includes('entertainment') || key.includes('music')) {
    return <Film className={className} />
  }
  if (key.includes('education') || key.includes('school') || key.includes('university') || key.includes('training')) {
    return <GraduationCap className={className} />
  }
  if (key.includes('service') || key.includes('wrench') || key.includes('repair')) {
    return <Wrench className={className} />
  }

  return <Tags className={className} />
}

interface CategorySelectProps {
  value: string
  onChange: (categoryName: string) => void
  error?: string
  disabled?: boolean
}

export default function CategorySelect({ value, onChange, error, disabled = false }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories from /api/categories (matches /admin/categories)
  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              setCategories(json.data)
              return
            }
          }
        }
        // Fallback to default categories if API returns empty/error
        if (isMounted) {
          setCategories(defaultFallbackCategories)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        if (isMounted) {
          setCategories(defaultFallbackCategories)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [])

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setSearchTerm('')
    }
  }, [isOpen])

  // Handle outside click & Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories
    const q = searchTerm.toLowerCase().trim()
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    )
  }, [categories, searchTerm])

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.name === value)
  }, [categories, value])

  const handleSelect = (categoryName: string) => {
    onChange(categoryName)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full px-4 py-3.5 bg-neutral-50 border rounded-xl flex items-center justify-between text-left transition-all ${
          isOpen
            ? 'bg-white border-[#16A34A] ring-2 ring-[#16A34A]/20 shadow-sm'
            : error
            ? 'border-red-300 hover:border-red-400 bg-red-50/20'
            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            value ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-neutral-200/60 text-neutral-400'
          }`}>
            {value ? (
              <CategoryIcon icon={selectedCategory?.icon} name={value} className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <Tags className="w-4 h-4 text-neutral-400" />
            )}
          </div>
          <div className="truncate">
            {value ? (
              <span className="font-bold text-neutral-800 text-sm block truncate">{value}</span>
            ) : (
              <span className="text-neutral-400 text-sm font-medium">Select the main category</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => { if (e.key === 'Enter') handleClear(e as any) }}
              className="p-1 hover:text-neutral-600 hover:bg-neutral-200/50 rounded-md transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#16A34A]' : 'text-neutral-400'}`}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden ring-1 ring-black/5"
          >
            {/* Top Search Bar */}
            <div className="p-3 bg-neutral-50/90 border-b border-neutral-100 sticky top-0 z-10 backdrop-blur-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories (e.g. Cafe, Hotel, Restaurant)..."
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Items List */}
            <div className="max-h-72 overflow-y-auto overscroll-contain p-2 space-y-1">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-neutral-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#16A34A]" />
                  <span className="text-xs font-semibold">Loading available categories...</span>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-neutral-700">No categories found</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    No results for &ldquo;{searchTerm}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-xs font-bold text-[#16A34A] hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = value.toLowerCase() === category.name.toLowerCase()
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelect(category.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                        isSelected
                          ? 'bg-[#F0FDF4] text-[#16A34A] font-bold border border-[#DCFCE7]'
                          : 'hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#16A34A] text-white shadow-sm'
                              : 'bg-neutral-100 group-hover:bg-[#DCFCE7] text-neutral-600 group-hover:text-[#16A34A]'
                          }`}
                        >
                          <CategoryIcon
                            icon={category.icon}
                            name={category.name}
                            className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm truncate leading-tight ${isSelected ? 'font-extrabold text-[#16A34A]' : 'font-semibold text-neutral-800'}`}>
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-xs text-neutral-400 truncate mt-0.5 font-normal">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {category.businessCount !== undefined && category.businessCount > 0 && (
                          <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
                            {category.businessCount} {category.businessCount === 1 ? 'biz' : 'bizs'}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center text-white shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="px-3.5 py-2 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#16A34A]" />
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
              </span>
              <span className="text-neutral-400">HelloET Directory</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
