'use client'

import { useEffect, useState } from 'react'
import { Tags, Trash2, Edit2, Plus, Loader2, X, Building2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  businessCount: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openEdit = (cat: Category) => {
    setEditingCat(cat)
    setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '' })
    setShowForm(true)
    setError('')
  }

  const openNew = () => {
    setEditingCat(null)
    setFormData({ name: '', description: '', icon: '' })
    setShowForm(true)
    setError('')
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const url = editingCat ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories'
      const method = editingCat ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        await fetchCategories()
        setShowForm(false)
      } else {
        setError(data.error || 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This will fail if businesses are using it.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) setCategories(prev => prev.filter(c => c.id !== id))
      else alert(data.error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="w-6 h-6 text-[#16A34A]" /> Categories
          </h1>
          <p className="text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm text-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 hover:border-[#16A34A] hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {cat.icon ? (
                      <span className="text-xl">{cat.icon}</span>
                    ) : (
                      <Tags className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{cat.name}</div>
                    {cat.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</div>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#16A34A] transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-500">
                <Building2 className="w-4 h-4" />
                <span>{cat.businessCount} businesses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-sm border border-gray-300 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all text-sm"
                  placeholder="e.g. Restaurants"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all text-sm"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Icon (emoji or text)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all text-sm"
                  placeholder="e.g. ðŸ½ï¸ or utensils"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white hover:bg-green-700 font-medium transition-all shadow-sm text-sm disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingCat ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

