'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Building2,
  Star
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { reviews: number; ownedBusinesses: number }
}

const roleColors: Record<string, string> = {
  USER: 'bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]/20',
  BUSINESS_OWNER: 'bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/20',
  ADMIN: 'bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20'
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

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchUsers()
    }, 400)
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
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, role: newRole } : u))
        )
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
      if (data.success) setUsers((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#16A34A]" /> Platform Users
        </h1>
        <p className="text-sm font-medium text-[#64748B] mt-0.5">
          {total} registered accounts across HelloET
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white shadow-sm border border-[#E2E8F0] focus:border-[#16A34A]/40 focus:ring-4 focus:ring-[#16A34A]/10 rounded-2xl text-[#0F172A] placeholder-[#94A3B8] text-xs font-semibold outline-none transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 bg-white shadow-sm border border-[#E2E8F0] focus:border-[#16A34A]/40 focus:ring-4 focus:ring-[#16A34A]/10 rounded-2xl text-[#0F172A] text-xs font-bold outline-none cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="USER">Regular Users</option>
          <option value="BUSINESS_OWNER">Business Owners</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
            <span className="text-xs font-semibold text-[#64748B]">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8]">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Reviews</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Businesses</th>
                  <th className="px-6 py-4 font-semibold hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8FAFC]/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] rounded-2xl flex items-center justify-center flex-shrink-0 font-extrabold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#0F172A] text-xs">{user.name}</div>
                          <div className="text-[11px] font-medium text-[#64748B]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[11px] px-2.5 py-1 rounded-xl font-bold ${
                          roleColors[user.role] || roleColors.USER
                        }`}
                      >
                        {user.role === 'BUSINESS_OWNER' ? 'BUSINESS OWNER' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-extrabold text-[#0F172A] hidden md:table-cell">
                      {user._count.reviews}
                    </td>
                    <td className="px-6 py-4 text-xs font-extrabold text-[#0F172A] hidden md:table-cell">
                      {user._count.ownedBusinesses}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-medium text-[#64748B] hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setNewRole(user.role)
                          }}
                          className="p-2 rounded-xl text-[#64748B] hover:bg-[#F0FDF4] hover:text-[#16A34A] transition-colors"
                          title="Edit user role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-2 rounded-xl text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                          title="Delete user"
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F8FAFC] text-xs font-semibold text-[#64748B]">
            <span>
              Page {page} of {totalPages} ({total} Total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white shadow-2xl border border-[#E2E8F0] rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#0F172A] text-base">Change User Role</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-medium text-[#64748B] mb-4">
              {editingUser.name} · {editingUser.email}
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[#0F172A] text-xs font-bold outline-none focus:border-[#16A34A]/40 mb-5"
            >
              <option value="USER">USER</option>
              <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] font-bold transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition-all text-xs disabled:opacity-60 shadow-md shadow-[#16A34A]/20"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
