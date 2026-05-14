'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Bell,
  Star,
  CheckCircle2,
  Info,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Filter
} from 'lucide-react'

interface Notification {
  id: string
  type: 'review' | 'review_confirm' | 'system'
  title: string
  message: string
  rating?: number
  businessSlug?: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { status } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const getIcon = (type: string) => {
    switch (type) {
      case 'review': return <Star className="w-5 h-5 text-yellow-500" />
      case 'review_confirm': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'system': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Bell className="w-5 h-5 text-neutral-400" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'review': return 'bg-yellow-50'
      case 'review_confirm': return 'bg-green-50'
      case 'system': return 'bg-blue-50'
      default: return 'bg-neutral-50'
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-[#006747]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Sign in to see notifications</h2>
          <p className="text-neutral-600 mb-6">Stay updated on reviews and activity</p>
          <Link
            href="/auth/login?callbackUrl=/notifications"
            className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#006747]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#006747]" />
                Notifications
                {unreadCount > 0 && (
                  <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-neutral-600 mt-1">{notifications.length} notifications</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#006747] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#006747] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-[#006747]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No notifications yet</h3>
            <p className="text-neutral-600 mb-6">You'll receive notifications for reviews and activity</p>
          </div>
        )}

        {/* No filter match */}
        {notifications.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <Filter className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No unread notifications</p>
          </div>
        )}

        {/* Notification List */}
        {filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow ${
                  !notification.read ? 'border-[#006747]/30 bg-[#D1EFE4]/10' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-medium ${!notification.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-[#006747] rounded-full ml-2 align-middle" />
                          )}
                        </h4>
                      </div>
                      <span className="text-xs text-neutral-400 flex-shrink-0 mt-0.5">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>

                    {notification.type === 'review' && notification.rating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= notification.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>

                    {notification.businessSlug && (
                      <Link
                        href={`/business/${notification.businessSlug}`}
                        className="inline-flex items-center gap-1 text-sm text-[#006747] hover:underline mt-2"
                      >
                        View Business <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
