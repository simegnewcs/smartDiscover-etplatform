'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  User,
  Lock,
  Mail,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Calendar,
  Camera,
  Trash2,
  ImagePlus
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [role, setRole] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/dashboard/settings')
      const data = await res.json()

      if (data.success) {
        setName(data.data.name)
        setEmail(data.data.email)
        setProfileImage(data.data.profileImage || null)
        setRole(data.data.role)
        setCreatedAt(data.data.createdAt)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadRes.json()

      if (uploadData.success) {
        setProfileImage(uploadData.fileUrl)
        // Save immediately
        const saveRes = await fetch('/api/dashboard/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: uploadData.fileUrl })
        })
        const saveData = await saveRes.json()
        if (saveData.success) {
          setSuccess('Profile photo updated')
          await updateSession({ image: uploadData.fileUrl })
          setTimeout(() => setSuccess(''), 3000)
        }
      } else {
        setError(uploadData.message || 'Failed to upload image')
      }
    } catch (err) {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = async () => {
    setUploadingImage(true)
    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: null })
      })
      const data = await res.json()
      if (data.success) {
        setProfileImage(null)
        setSuccess('Profile photo removed')
        await updateSession({ image: null })
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to remove photo')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('Profile updated successfully')
        await updateSession({ name, email })
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordSaving(true)

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (data.success) {
        setPasswordSuccess('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setPasswordError('Something went wrong')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#006747]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#006747]" />
          Profile Photo
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#D1EFE4]"
              />
            ) : (
              <div className="w-24 h-24 bg-[#006747] rounded-full flex items-center justify-center border-4 border-[#D1EFE4]">
                <span className="text-white font-bold text-2xl">
                  {name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </span>
              </div>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 px-4 py-2 bg-[#006747] hover:bg-[#00523A] text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <ImagePlus className="w-4 h-4" />
                {profileImage ? 'Change Photo' : 'Upload Photo'}
              </button>
              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">JPG, PNG or WebP. Max 5MB.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Account Overview */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 bg-[#006747] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">{name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
                <Shield className="w-3.5 h-3.5" />
                {role === 'BUSINESS_OWNER' ? 'Business Owner' : role === 'ADMIN' ? 'Admin' : 'User'}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#006747]" />
          Profile Information
        </h3>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#006747]" />
          Change Password
        </h3>

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                placeholder="At least 6 characters"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Details */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-neutral-500">Account Type</span>
            <p className="font-medium text-neutral-800 mt-0.5">
              {role === 'BUSINESS_OWNER' ? 'Business Owner' : role === 'ADMIN' ? 'Administrator' : 'Regular User'}
            </p>
          </div>
          <div>
            <span className="text-neutral-500">Member Since</span>
            <p className="font-medium text-neutral-800 mt-0.5">
              {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div>
            <span className="text-neutral-500">Email</span>
            <p className="font-medium text-neutral-800 mt-0.5">{email}</p>
          </div>
          <div>
            <span className="text-neutral-500">User ID</span>
            <p className="font-medium text-neutral-800 mt-0.5">{session?.user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
