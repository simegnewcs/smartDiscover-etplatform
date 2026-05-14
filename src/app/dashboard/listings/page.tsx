'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Star, 
  Phone, 
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  MapPin,
  Building2,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react'

interface Business {
  id: string
  slug: string
  name: string
  description?: string
  category: string
  location: string
  address?: string
  phone?: string
  email?: string
  website?: string
  verified: boolean
  image?: string
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export default function BusinessListings() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const handleDelete = async () => {
    if (!selectedBusiness) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/dashboard/businesses/${selectedBusiness.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      
      if (data.success) {
        setBusinesses(prev => prev.filter(b => b.id !== selectedBusiness.id))
        setSelectedBusiness(null)
      } else {
        alert(data.error || 'Failed to delete business')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('Error deleting business')
    } finally {
      setIsDeleting(false)
    }
  }

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/dashboard/businesses')
      const data = await response.json()
      
      if (data.success) {
        setBusinesses(data.data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'verified' && business.verified) ||
                         (filterStatus === 'unverified' && !business.verified)
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Business Listings</h1>
          <p className="text-neutral-600 mt-1">Manage your business listings and their information</p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Business</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Listings</p>
              <p className="text-2xl font-bold text-neutral-800">{businesses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Verified</p>
              <p className="text-2xl font-bold text-neutral-800">{businesses.filter(b => b.verified).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Avg Rating</p>
              <p className="text-2xl font-bold text-neutral-800">
                {businesses.length > 0 
                  ? (businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Reviews</p>
              <p className="text-2xl font-bold text-neutral-800">
                {businesses.reduce((sum, b) => sum + b.reviewCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Listings</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business List */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {filteredBusinesses.length > 0 ? (
          <div className="divide-y divide-neutral-200">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Business Image */}
                    <div className="w-20 h-20 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      {business.image ? (
                        <img
                          src={business.image}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-800 truncate">
                          {business.name}
                        </h3>
                        {business.verified ? (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            <span>✓</span>
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                            <span>⏳</span>
                            <span>Pending Verification</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                          {business.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{business.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{business.rating.toFixed(1)}</span>
                          <span className="text-neutral-500">({business.reviewCount})</span>
                        </div>
                      </div>
                      
                      {business.description && (
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                          {business.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-neutral-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {new Date(business.createdAt).toLocaleDateString()}</span>
                        </div>
                        {business.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/business/${business.slug}`}
                      target="_blank"
                      className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Public Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/listings/${business.id}/edit`}
                      className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Listing"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setSelectedBusiness(business)}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No businesses found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first business listing'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Business</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 text-center mb-2">
              Delete Business
            </h3>
            <p className="text-neutral-600 text-center mb-6">
              Are you sure you want to delete <strong>{selectedBusiness.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedBusiness(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
