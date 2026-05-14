'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Trash2, Edit2, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { reviews: number; ownedBusinesses: number }
}

const roleColors: Record<string, string> = {
  USER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  BUSINESS_OWNER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ADMIN: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setTotal(data.data.total)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers() }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleRoleSave = async () => {
    if (!editingUser || !newRole) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u))
        setEditingUser(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) setUsers(prev => prev.filter(u => u.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-[#EEF578]" /> Users
        </h1>
        <p className="text-neutral-400 mt-1">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#EEF578]/50 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 text-sm"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="BUSINESS_OWNER">Business Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium hidden md:table-cell">Reviews</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium hidden md:table-cell">Businesses</th>
                  <th className="text-left px-5 py-3 text-neutral-400 font-medium hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3 text-neutral-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-neutral-300">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-neutral-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded border font-medium ${roleColors[user.role] || roleColors.USER}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-300 hidden md:table-cell">{user._count.reviews}</td>
                    <td className="px-5 py-3.5 text-neutral-300 hidden md:table-cell">{user._count.ownedBusinesses}</td>
                    <td className="px-5 py-3.5 text-neutral-500 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingUser(user); setNewRole(user.role) }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
                          title="Edit role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
                          title="Delete user"
                        >
                          {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Change Role</h3>
              <button onClick={() => setEditingUser(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-neutral-400 mb-4">{editingUser.name} · {editingUser.email}</p>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#EEF578]/50 mb-4"
            >
              <option value="USER">USER</option>
              <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleRoleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-[#EEF578] text-neutral-900 hover:bg-[#d8dc5e] font-medium transition-colors text-sm disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
