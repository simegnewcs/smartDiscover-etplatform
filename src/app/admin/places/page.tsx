'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  MapPin, 
  Trash2, 
  Edit2, 
  Plus, 
  Loader2, 
  X, 
  Building2, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Navigation,
  Globe2,
  ChevronRight
} from 'lucide-react'

interface Subcity {
  id: string
  name: string
  cityId: string
  businessCount?: number
}

interface City {
  id: string
  name: string
  createdAt?: string
  businessCount: number
  subcities: Subcity[]
}

export default function AdminPlacesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // City Modal state
  const [showCityModal, setShowCityModal] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [cityNameInput, setCityNameInput] = useState('')
  const [savingCity, setSavingCity] = useState(false)

  // Place/Subcity Modal state
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [editingPlace, setEditingPlace] = useState<Subcity | null>(null)
  const [placeNameInput, setPlaceNameInput] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [savingPlace, setSavingPlace] = useState(false)

  // Feedback
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/places')
      const data = await res.json()
      if (data.success) {
        setCities(data.data)
      } else {
        setError(data.error || 'Failed to load places')
      }
    } catch (err) {
      console.error('Failed to load places:', err)
      setError('Error connecting to the server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaces()
  }, [])

  // Clear toast after 4s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Computed counts
  const totalSubcities = useMemo(() => {
    return cities.reduce((acc, c) => acc + (c.subcities?.length || 0), 0)
  }, [cities])

  const totalBusinesses = useMemo(() => {
    return cities.reduce((acc, c) => acc + (c.businessCount || 0), 0)
  }, [cities])

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return cities

    return cities.filter(city => {
      const cityMatches = city.name.toLowerCase().includes(q)
      const subcityMatches = city.subcities?.some(s => s.name.toLowerCase().includes(q))
      return cityMatches || subcityMatches
    })
  }, [cities, searchQuery])

  // --- City Handlers ---
  const handleOpenNewCity = () => {
    setEditingCity(null)
    setCityNameInput('')
    setError('')
    setShowCityModal(true)
  }

  const handleOpenEditCity = (city: City) => {
    setEditingCity(city)
    setCityNameInput(city.name)
    setError('')
    setShowCityModal(true)
  }

  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityNameInput.trim()) {
      setError('City name is required')
      return
    }

    setSavingCity(true)
    setError('')
    try {
      const url = editingCity ? `/api/admin/places/${editingCity.id}` : '/api/admin/places'
      const method = editingCity ? 'PATCH' : 'POST'
      const body = {
        type: 'city',
        name: cityNameInput.trim()
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(editingCity ? `City "${cityNameInput}" updated!` : `City "${cityNameInput}" created!`)
        setShowCityModal(false)
        await fetchPlaces()
      } else {
        setError(data.error || 'Failed to save city')
      }
    } catch (err) {
      setError('Server error saving city')
    } finally {
      setSavingCity(false)
    }
  }

  const handleDeleteCity = async (city: City) => {
    if (!confirm(`Are you sure you want to delete "${city.name}" and all places under it? This cannot be undone.`)) {
      return
    }

    setDeletingId(`city-${city.id}`)
    setError('')
    try {
      const res = await fetch(`/api/admin/places/${city.id}?type=city`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(`City "${city.name}" removed`)
        setCities(prev => prev.filter(c => c.id !== city.id))
      } else {
        setError(data.error || 'Failed to delete city')
      }
    } catch (err) {
      setError('Server error deleting city')
    } finally {
      setDeletingId(null)
    }
  }

  // --- Place / Subcity Handlers ---
  const handleOpenNewPlace = (defaultCityId?: string) => {
    setEditingPlace(null)
    setPlaceNameInput('')
    setSelectedCityId(defaultCityId || (cities[0]?.id || ''))
    setError('')
    setShowPlaceModal(true)
  }

  const handleOpenEditPlace = (place: Subcity) => {
    setEditingPlace(place)
    setPlaceNameInput(place.name)
    setSelectedCityId(place.cityId)
    setError('')
    setShowPlaceModal(true)
  }

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!placeNameInput.trim()) {
      setError('Place/Subcity name is required')
      return
    }
    if (!selectedCityId) {
      setError('Please select a City')
      return
    }

    setSavingPlace(true)
    setError('')
    try {
      const url = editingPlace ? `/api/admin/places/${editingPlace.id}` : '/api/admin/places'
      const method = editingPlace ? 'PATCH' : 'POST'
      const body = {
        type: 'subcity',
        name: placeNameInput.trim(),
        cityId: selectedCityId
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        setSuccess(editingPlace ? `Place "${placeNameInput}" updated!` : `Place "${placeNameInput}" added!`)
        setShowPlaceModal(false)
        await fetchPlaces()
      } else {
        setError(data.error || 'Failed to save place')
      }
    } catch (err) {
      setError('Server error saving place')
    } finally {
      setSavingPlace(false)
    }
  }

  const handleDeletePlace = async (place: Subcity, cityName: string) => {
    if (!confirm(`Delete place "${place.name}" from ${cityName}?`)) return

    setDeletingId(`place-${place.id}`)
    setError('')
    try {
      const res = await fetch(`/api/admin/places/${place.id}?type=subcity`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(`Place "${place.name}" removed`)
        setCities(prev => prev.map(c => {
          if (c.id === place.cityId) {
            return {
              ...c,
              subcities: c.subcities.filter(s => s.id !== place.id)
            }
          }
          return c
        }))
      } else {
        setError(data.error || 'Failed to delete place')
      }
    } catch (err) {
      setError('Server error deleting place')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-[#16A34A]" /> Directory Places & Cities
          </h1>
          <p className="text-sm font-medium text-[#64748B] mt-0.5">
            Manage Ethiopian cities, subcities, and local zones available across HelloET business listings.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenNewCity}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-2xl font-bold transition-all shadow-sm text-xs"
          >
            <Plus className="w-4 h-4 text-[#16A34A]" /> Add City
          </button>
          <button
            onClick={() => handleOpenNewPlace()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs"
          >
            <Plus className="w-4 h-4" /> Add Place / Subcity
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Stats Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#16A34A] border border-green-100">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Cities</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{cities.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Places / Subcities</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{totalSubcities}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Listed Businesses</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{totalBusinesses}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city name (e.g. Addis Ababa) or place/subcity (e.g. Bole, Piassa)..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm text-neutral-800 transition-all"
          />
        </div>
      </div>

      {/* Cities & Places Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-2xl border border-neutral-200 p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
          <span className="text-xs font-semibold text-neutral-500">Loading directory places...</span>
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
          <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No places found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? `No cities or subcities matching "${searchQuery}"` : 'Get started by adding your first Ethiopian city and places.'}
          </p>
          <button
            onClick={handleOpenNewCity}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-xl font-bold text-xs hover:bg-[#15803D] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add City
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden transition-all hover:border-neutral-300"
            >
              {/* City Card Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100/70 border border-green-200 text-[#16A34A] flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-black text-neutral-900 tracking-tight">{city.name}</h2>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-200/70 text-neutral-700">
                        {city.subcities?.length || 0} Places
                      </span>
                      {city.businessCount > 0 && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-green-200">
                          {city.businessCount} {city.businessCount === 1 ? 'Business' : 'Businesses'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">Ethiopia Regional Directory Location</p>
                  </div>
                </div>

                {/* City Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenNewPlace(city.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#15803D] border border-green-200 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Place
                  </button>
                  <button
                    onClick={() => handleOpenEditCity(city)}
                    className="p-2 text-neutral-500 hover:text-[#16A34A] hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-200"
                    title="Edit City Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCity(city)}
                    disabled={deletingId === `city-${city.id}`}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-neutral-200 disabled:opacity-50"
                    title="Delete City"
                  >
                    {deletingId === `city-${city.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subcities / Places Grid */}
              <div className="p-5 sm:p-6">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Subcities, Woredas & Places in {city.name}:
                </p>

                {(!city.subcities || city.subcities.length === 0) ? (
                  <div className="py-6 px-4 bg-neutral-50 rounded-xl text-center border border-dashed border-neutral-200">
                    <p className="text-xs text-neutral-500">No subcities or places registered for {city.name} yet.</p>
                    <button
                      onClick={() => handleOpenNewPlace(city.id)}
                      className="mt-2 text-xs font-bold text-[#16A34A] hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add first place to {city.name}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {city.subcities.map((subcity) => (
                      <div
                        key={subcity.id}
                        className="group flex items-center gap-2 px-3 py-2 bg-neutral-50 hover:bg-green-50/70 border border-neutral-200 hover:border-green-300 rounded-xl transition-all shadow-xs"
                      >
                        <span className="text-xs font-semibold text-neutral-800 group-hover:text-neutral-900">
                          {subcity.name}
                        </span>
                        {subcity.businessCount && subcity.businessCount > 0 ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-neutral-600 border border-neutral-200">
                            {subcity.businessCount}
                          </span>
                        ) : null}

                        {/* Hover Actions */}
                        <div className="flex items-center gap-1 ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPlace(subcity)}
                            className="p-1 text-neutral-400 hover:text-[#16A34A] hover:bg-white rounded transition-colors"
                            title="Edit place name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlace(subcity, city.name)}
                            disabled={deletingId === `place-${subcity.id}`}
                            className="p-1 text-neutral-400 hover:text-red-500 hover:bg-white rounded transition-colors disabled:opacity-50"
                            title="Delete place"
                          >
                            {deletingId === `place-${subcity.id}` ? (
                              <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CITY MODAL --- */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#16A34A]" />
                {editingCity ? 'Edit City' : 'Add New Ethiopian City'}
              </h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCity} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cityNameInput}
                  onChange={(e) => setCityNameInput(e.target.value)}
                  placeholder="e.g. Addis Ababa, Bahir Dar, Hawassa, Mekelle"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm font-medium"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCity}
                  className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#16A34A]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingCity && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCity ? 'Save Changes' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PLACE / SUBCITY MODAL --- */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-800 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#16A34A]" />
                {editingPlace ? 'Edit Place / Subcity' : 'Add Place / Subcity'}
              </h3>
              <button
                onClick={() => setShowPlaceModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Belongs to City <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm font-medium cursor-pointer"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Place / Subcity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={placeNameInput}
                  onChange={(e) => setPlaceNameInput(e.target.value)}
                  placeholder="e.g. Bole, Piassa, Kazanchis, Mekanisa, CMC"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-sm font-medium"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlace}
                  className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#16A34A]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {savingPlace && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingPlace ? 'Save Changes' : 'Add Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
