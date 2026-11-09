'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  ShieldCheck,
  CreditCard,
  ArrowRight
} from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
  category: 'general' | 'business' | 'pricing' | 'app'
}

const faqData: FaqItem[] = [
  {
    category: 'general',
    question: 'How do I find a better or top-rated restaurant in Addis Ababa or another city?',
    answer: 'HelloET provides a verified leaderboard of the best restaurants in Addis Ababa and across Ethiopia. You can search by cuisine (traditional Ethiopian Injera, Kitfo, international, Italian, burgers), browse authentic customer ratings, check opening hours, view food photos, and call the restaurant directly without middleman fees.'
  },
  {
    category: 'general',
    question: 'How do I find the nearest hotel, pharmacy, or supermarket near me in Ethiopia?',
    answer: 'On HelloET, use our city and neighborhood filters (Bole, Kazanchis, Piassa, Sarbet, Yeka, CMC) or search keywords like "pharmacy", "hotel", or "supermarket". HelloET provides exact GPS coordinates, Google Maps directions, and verified direct telephone numbers for immediate contact.'
  },
  {
    category: 'pricing',
    question: 'Why is HelloET better than Booking.com or TripAdvisor for Ethiopia?',
    answer: 'Unlike foreign platforms that charge hotels high commissions (15% to 25%) and often display outdated contact info, HelloET gives customers direct telephone numbers to call Ethiopian business owners directly with 0% middleman fees and local currency (ETB) pricing.'
  },
  {
    category: 'general',
    question: 'Where can I find authentic Ethiopian traditional coffee houses (Bunna Bet)?',
    answer: 'HelloET lists iconic Ethiopian coffee spots like Tomoca Coffee, Kaldi\'s, and traditional local Bunna Bet ceremonies across Piassa, Bole, Kazanchis, and Sarbet, complete with photos, customer reviews, and neighborhood directions.'
  },
  {
    category: 'business',
    question: 'How do I list or claim my business on HelloET?',
    answer: 'Listing your business is fast and free! Click "Add Business" or visit our registration page, fill in your business name, category, city/subcity, phone number, and opening hours. If your business is already listed, you can click "Claim Business" on your listing page to verify ownership and take control of your profile.'
  },
  {
    category: 'pricing',
    question: 'What are the pricing packages for business owners?',
    answer: 'HelloET offers a Forever Free tier (ETB 0/mo) for standard listings, Basic (ETB 499/mo) with priority search and analytics, Premium (ETB 999/mo) with unlimited photos, the official Green Verified Badge, and top leaderboard rankings, and Enterprise (ETB 2,499/mo) for multi-branch brands. You can review all details on our /pricing page.'
  },
  {
    category: 'business',
    question: 'What is the Official Green Verified Badge and how do I get it?',
    answer: 'The Green Verified Badge signals authenticity and builds high trust with potential customers. It is awarded after our moderation team verifies your business details, physical location, and contact information. Verified businesses appear higher in search rankings and receive up to 3x more phone inquiries.'
  },
  {
    category: 'app',
    question: 'Is HelloET available as a mobile app (PWA / APK)?',
    answer: 'Yes! HelloET is a Progressive Web App (PWA) and Android APK. You can install it straight to your phone\'s home screen with one tap from the browser for lightning-fast, data-saving business discovery across Ethiopia.'
  }
]

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section 
      id="faq" 
      className="scroll-mt-24 py-20 sm:py-24 px-4 bg-gradient-to-b from-white via-neutral-50/50 to-white border-t border-neutral-100 relative overflow-hidden"
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#DCFCE7] border border-[#16A34A]/20 px-4 py-1.5 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-[#16A34A]" />
            <span className="text-xs sm:text-sm font-bold text-[#16A34A] tracking-wide uppercase">
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Got Questions About <span className="text-[#16A34A]">HelloET</span>?
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about searching, discovering, and listing verified businesses across Ethiopia.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="max-w-2xl mx-auto mb-10 space-y-4">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. restaurant, pharmacy, booking, pricing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'general', label: 'Local Discovery' },
              { id: 'business', label: 'For Business Owners' },
              { id: 'pricing', label: 'Zero Commissions & Pricing' },
              { id: 'app', label: 'Mobile App / PWA' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#16A34A] text-white shadow-md'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-4 mb-14">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200">
              <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 font-semibold mb-1">No matching questions found</p>
              <p className="text-xs text-neutral-400">Try searching for different keywords or reset your filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
                className="mt-4 px-4 py-2 bg-[#DCFCE7] text-[#16A34A] font-bold text-xs rounded-xl hover:bg-[#bbf7d0] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'border-[#16A34A]/40 shadow-md ring-1 ring-[#16A34A]/20' 
                      : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#DCFCE7] text-[#16A34A] rotate-180' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>

        {/* Bottom Help & Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 mb-1 text-base">Have More Questions?</h3>
              <p className="text-xs sm:text-sm text-neutral-600 mb-3">
                Our Addis Ababa team is available to help you list your business or find local services.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:0940192676"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 0940192676</span>
                </a>
                <span className="text-neutral-300">•</span>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-neutral-700 hover:text-[#16A34A]"
                >
                  <span>Contact Page</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-neutral-100 pt-6 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 mb-1 text-base">Explore HelloET Packages</h3>
              <p className="text-xs sm:text-sm text-neutral-600 mb-3">
                Want to supercharge your business visibility with verified badges and top search placement?
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#036246] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <span>View Packages & Pricing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

