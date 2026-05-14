'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  History,
  Star,
  Bookmark,
  Loader2,
  ArrowLeft,
  Clock,
  ExternalLink,
  Calendar
} from 'lucide-react'

interface Activity {
  id: string
  type: 'review' | 'saved'
  title: string
  description: string
  rating?: number
  businessSlug: string
  businessName: string
  createdAt: string
}

export default function ActivityPage() {
  const { status } = useSession()
  const [activities, setActivities] = useState<Activity[]>([])
  const [grouped, setGrouped] = useState<Record<string, Activity[]>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'review' | 'saved'>('all')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchActivity()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity')
      const data = await res.json()
      if (data.success) {
        setActivities(data.data.activities)
        setGrouped(data.data.grouped)
      }
    } catch (err) {
      console.error('Error fetching activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredGrouped = () => {
    if (filter === 'all') return grouped
    const result: Record<string, Activity[]> = {}
    Object.entries(grouped).forEach(([date, items]) => {
      const filtered = items.filter(i => i.type === filter)
      if (filtered.length > 0) result[date] = filtered
    })
    return result
  }

  const totalFiltered = filter === 'all' 
    ? activities.length 
    : activities.filter(a => a.type === filter).length

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-[#006747]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Sign in to see your activity</h2>
          <p className="text-neutral-600 mb-6">Track your reviews, saves, and more</p>
          <Link
            href="/auth/login?callbackUrl=/activity"
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

  const displayGrouped = filteredGrouped()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
              <History className="w-6 h-6 text-[#006747]" />
              Recent Activity
            </h1>
            <p className="text-neutral-600 mt-1">{activities.length} total activities</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: activities.length },
            { key: 'review', label: 'Reviews', count: activities.filter(a => a.type === 'review').length },
            { key: 'saved', label: 'Saved', count: activities.filter(a => a.type === 'saved').length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-[#006747] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="w-20 h-20 bg-[#D1EFE4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-[#006747]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-2">No activity yet</h3>
            <p className="text-neutral-600 mb-6">Start exploring businesses and writing reviews</p>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 bg-[#006747] hover:bg-[#00523A] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Businesses
            </Link>
          </div>
        )}

        {/* No filter results */}
        {activities.length > 0 && totalFiltered === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No {filter} activities found</p>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="space-y-8">
          {Object.entries(displayGrouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{date}</h3>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              <div className="space-y-3">
                {items.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'review' ? 'bg-yellow-50' : 'bg-[#D1EFE4]'
                      }`}>
                        {activity.type === 'review' ? (
                          <Star className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Bookmark className="w-5 h-5 text-[#006747]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-neutral-800">{activity.title}</h4>
                          <span className="text-xs text-neutral-400 flex-shrink-0">
                            {new Date(activity.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>

                        {activity.type === 'review' && activity.rating && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= activity.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                        )}

                        <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>

                        <Link
                          href={`/business/${activity.businessSlug}`}
                          className="inline-flex items-center gap-1 text-sm text-[#006747] hover:underline mt-2"
                        >
                          View Business <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
