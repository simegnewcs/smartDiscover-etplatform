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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-[#EEF578]" /> Categories
          </h1>
          <p className="text-neutral-400 mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#EEF578] text-neutral-900 rounded-lg font-medium hover:bg-[#d8dc5e] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                    {cat.icon ? (
                      <span className="text-xl">{cat.icon}</span>
                    ) : (
                      <Tags className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{cat.name}</div>
                    {cat.description && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{cat.description}</div>}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
                  >
                    {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm text-neutral-400">
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
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 text-sm"
                  placeholder="e.g. Restaurants"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 text-sm"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Icon (emoji or text)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 text-sm"
                  placeholder="e.g. 🍽️ or utensils"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-[#EEF578] text-neutral-900 hover:bg-[#d8dc5e] font-medium transition-colors text-sm disabled:opacity-60"
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
