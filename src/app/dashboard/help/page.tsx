'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  Building2,
  CreditCard,
  Shield,
  Settings,
  BookOpen,
  Mail,
  ExternalLink,
  Bookmark,
  Users,
  TrendingUp
} from 'lucide-react'

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click "Sign In" in the top navigation, then select "Register" to create a new account. You can register as a regular user or a business owner. Fill in your name, email, and password to get started.'
  },
  {
    category: 'Getting Started',
    question: 'What is the difference between a User and Business Owner account?',
    answer: 'A regular User account lets you browse businesses, write reviews, save favorites, and track your activity. A Business Owner account includes all user features plus the ability to list and manage your businesses, view analytics, and respond to reviews.'
  },
  {
    category: 'Reviews',
    question: 'How do I write a review?',
    answer: 'Visit any business page and scroll down to the review section. Select a star rating (1-5) and optionally write a comment. You must be signed in to submit a review. Your review will appear immediately on the business page.'
  },
  {
    category: 'Reviews',
    question: 'Can I edit or delete my review?',
    answer: 'Currently, reviews cannot be edited after submission. If you need to modify a review, please contact our support team and we will assist you.'
  },
  {
    category: 'Reviews',
    question: 'How are business ratings calculated?',
    answer: 'Business ratings are calculated as the average of all user review ratings. Each review contributes equally to the overall score, which is displayed as a value between 1.0 and 5.0 stars.'
  },
  {
    category: 'Saved Places',
    question: 'How do I save a business?',
    answer: 'Click the save/bookmark button on any business card or business detail page. Saved businesses appear in your "Saved Places" section accessible from the sidebar. You can remove saved businesses at any time.'
  },
  {
    category: 'Business Owners',
    question: 'How do I list my business?',
    answer: 'From your dashboard, click "Add Business" in the sidebar. Fill in your business details including name, category, location, contact information, operating hours, and upload photos. Your business will be listed after submission.'
  },
  {
    category: 'Business Owners',
    question: 'How do I view my business analytics?',
    answer: 'Navigate to "Analytics" in your dashboard sidebar. You will see overview stats, review trends over time, rating distribution, and performance metrics for each of your businesses.'
  },
  {
    category: 'Business Owners',
    question: 'What subscription plans are available?',
    answer: 'We offer Free, Basic, Premium, and Enterprise plans. The Free plan includes basic listing with limited features. Paid plans unlock priority placement, analytics, messaging, and more. Visit the Billing section in your dashboard for details.'
  },
  {
    category: 'Account & Settings',
    question: 'How do I update my profile?',
    answer: 'Go to Settings in your dashboard sidebar. You can update your name, email address, profile photo, and password. Changes are saved immediately and reflected across the platform.'
  },
  {
    category: 'Account & Settings',
    question: 'How do I change my password?',
    answer: 'In Settings, scroll down to the "Change Password" section. Enter your current password, then your new password twice to confirm. Passwords must be at least 6 characters long.'
  },
  {
    category: 'Account & Settings',
    question: 'How do I upload a profile photo?',
    answer: 'Go to Settings and click "Upload Photo" in the Profile Photo section. Supported formats are JPG, PNG, and WebP up to 5MB. Your photo will appear in the navigation bar and sidebar.'
  }
]

const categories = [
  { name: 'Getting Started', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { name: 'Reviews', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Saved Places', icon: Bookmark, color: 'bg-green-50 text-green-600' },
  { name: 'Business Owners', icon: Building2, color: 'bg-purple-50 text-purple-600' },
  { name: 'Account & Settings', icon: Settings, color: 'bg-neutral-100 text-neutral-600' }
]

const quickLinks = [
  { name: 'Browse Businesses', href: '/businesses', icon: Search, desc: 'Find businesses near you' },
  { name: 'My Reviews', href: '/my-reviews', icon: Star, desc: 'View your reviews' },
  { name: 'Saved Places', href: '/saved', icon: Bookmark, desc: 'Your saved businesses' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, desc: 'Update your profile' }
]

export default function HelpPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const isBusinessOwner = session?.user?.role === 'BUSINESS_OWNER'

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || faq.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#006747] to-[#00523A] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Help & Support</h1>
        </div>
        <p className="text-white/80 mb-6">Find answers to common questions or get in touch with our team</p>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null) }}
            className="w-full pl-12 pr-4 py-3 bg-white text-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-neutral-400"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                href={link.href}
                className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-[#D1EFE4] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#006747] transition-colors">
                  <Icon className="w-5 h-5 text-[#006747] group-hover:text-white transition-colors" />
                </div>
                <div className="font-medium text-neutral-800 text-sm">{link.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{link.desc}</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">Browse by Topic</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveCategory(null); setSearchQuery('') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-[#006747] text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.name}
                onClick={() => { setActiveCategory(cat.name); setSearchQuery('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.name
                    ? 'bg-[#006747] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">
          Frequently Asked Questions
          {(searchQuery || activeCategory) && (
            <span className="text-sm font-normal text-neutral-500 ml-2">
              ({filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {filteredFaqs.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No results found for your search</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory(null) }}
              className="text-sm text-[#006747] hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="space-y-2">
          {filteredFaqs.map((faq, index) => {
            const globalIndex = faqs.indexOf(faq)
            const isExpanded = expandedFaq === globalIndex
            const catInfo = categories.find(c => c.name === faq.category)

            return (
              <div
                key={globalIndex}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(globalIndex)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {catInfo && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color} flex-shrink-0`}>
                        {faq.category}
                      </span>
                    )}
                    <span className="font-medium text-neutral-800">{faq.question}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0 ml-2" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#006747]" />
          Still need help?
        </h2>
        <p className="text-neutral-600 mb-4">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="mailto:support@helloet.com"
            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg hover:bg-[#D1EFE4] transition-colors group"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-[#006747]" />
            </div>
            <div>
              <div className="font-medium text-neutral-800">Email Support</div>
              <div className="text-sm text-neutral-500">support@helloet.com</div>
            </div>
          </a>
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-[#006747]" />
            </div>
            <div>
              <div className="font-medium text-neutral-800">Live Chat</div>
              <div className="text-sm text-neutral-500">Coming soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">About HelloET</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[#006747] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-neutral-800">Community Driven</div>
              <div className="text-neutral-500 mt-0.5">Real reviews from real people help you find the best businesses</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#006747] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-neutral-800">Verified Businesses</div>
              <div className="text-neutral-500 mt-0.5">Verified badges indicate businesses that have confirmed their details</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#006747] mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-neutral-800">Business Growth</div>
              <div className="text-neutral-500 mt-0.5">Tools and analytics to help business owners grow their presence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
