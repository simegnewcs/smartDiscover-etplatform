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

  useEffect(() => {
    fetchCategories()
  }, [])

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
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
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
      if (data.success) setCategories((prev) => prev.filter((c) => c.id !== id))
      else alert(data.error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Tags className="w-6 h-6 text-[#16A34A]" /> Directory Categories
          </h1>
          <p className="text-sm font-medium text-[#64748B] mt-0.5">
            {categories.length} business sectors configured on HelloET
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-2xl font-bold transition-all shadow-md shadow-[#16A34A]/20 text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-56 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
          <span className="text-xs font-semibold text-[#64748B]">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] rounded-3xl p-6 hover:shadow-md hover:border-[#16A34A]/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl flex items-center justify-center text-xl flex-shrink-0 text-[#16A34A]">
                    {cat.icon ? cat.icon : <Tags className="w-5 h-5 text-[#16A34A]" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-[#0F172A] text-sm">{cat.name}</div>
                    {cat.description && (
                      <div className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
                        {cat.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-xl text-[#64748B] hover:bg-[#F0FDF4] hover:text-[#16A34A] transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-2 rounded-xl text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                    title="Delete category"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F8FAFC] flex items-center gap-2 text-xs font-bold text-[#64748B]">
                <Building2 className="w-4 h-4 text-[#16A34A]" />
                <span>{cat.businessCount} registered businesses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white shadow-2xl border border-[#E2E8F0] rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-[#0F172A] text-base">
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#16A34A]/50 focus:bg-white rounded-2xl text-[#0F172A] placeholder-[#94A3B8] text-xs font-semibold outline-none transition-all"
                  placeholder="e.g. Restaurants & Traditional Food"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#16A34A]/50 focus:bg-white rounded-2xl text-[#0F172A] placeholder-[#94A3B8] text-xs font-semibold outline-none transition-all"
                  placeholder="Short description of this sector"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Icon (Emoji or text)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#16A34A]/50 focus:bg-white rounded-2xl text-[#0F172A] placeholder-[#94A3B8] text-xs font-semibold outline-none transition-all"
                  placeholder="e.g. 🍽️, 🏨, ☕"
                />
              </div>
              {error && <p className="text-xs font-bold text-[#DC2626]">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] font-bold transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition-all text-xs disabled:opacity-60 shadow-md shadow-[#16A34A]/20"
              >
                {saving ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
