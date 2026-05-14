'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  MessageSquare,
  Inbox,
  Send,
  Loader2,
  Search,
  Building2,
  Mail,
  Clock
} from 'lucide-react'

interface MessageStats {
  totalMessages: number
  unreadMessages: number
  repliedMessages: number
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const isBusinessOwner = session?.user?.role === 'BUSINESS_OWNER'

  const [messages, setMessages] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 0,
    unreadMessages: 0,
    repliedMessages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/dashboard/messages')
      const data = await res.json()

      if (data.success) {
        setMessages(data.data.messages)
        setBusinesses(data.data.businesses)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Messages</h1>
        <p className="text-neutral-600 mt-1">
          {isBusinessOwner ? 'Customer inquiries for your businesses' : 'Your messages'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Inbox className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{stats.totalMessages}</div>
          <div className="text-sm text-neutral-600">Total Messages</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{stats.unreadMessages}</div>
          <div className="text-sm text-neutral-600">Unread</div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-800">{stats.repliedMessages}</div>
          <div className="text-sm text-neutral-600">Replied</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]"
          />
        </div>
      </div>

      {/* Messages List / Empty State */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {messages.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {messages.map((message: any) => (
              <div key={message.id} className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#D1EFE4] rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#006747]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-neutral-800">{message.senderName}</h4>
                      <span className="text-xs text-neutral-400">{new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No messages yet</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">
              {isBusinessOwner
                ? 'When customers send inquiries about your businesses, they will appear here.'
                : 'Your conversation history will appear here.'}
            </p>
            <div className="mt-6 p-4 bg-[#D1EFE4]/50 rounded-xl max-w-md mx-auto">
              <div className="flex items-center gap-3 text-sm text-[#006747]">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span>The messaging feature is coming soon! You'll be able to communicate directly with {isBusinessOwner ? 'customers' : 'businesses'}.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Business Context for Business Owners */}
      {isBusinessOwner && businesses.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#006747]" />
            Your Businesses
          </h3>
          <p className="text-sm text-neutral-500 mb-4">Messages will be organized by business when available</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {businesses.map((biz: any) => (
              <div key={biz.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <div className="w-8 h-8 bg-[#D1EFE4] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-[#006747]" />
                </div>
                <span className="text-sm font-medium text-neutral-700 truncate">{biz.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
