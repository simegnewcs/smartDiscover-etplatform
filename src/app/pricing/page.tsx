'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  CheckCircle2, 
  Zap, 
  Star, 
  Crown, 
  Building2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  CreditCard,
  HelpCircle,
  TrendingUp,
  MapPin,
  Eye,
  MessageSquare
} from 'lucide-react'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      tagline: 'Essential presence for new businesses and local kiosks.',
      monthlyPrice: '0',
      yearlyPrice: '0',
      priceUnit: 'Forever Free',
      popular: false,
      color: 'border-neutral-200',
      accentColor: 'text-neutral-700',
      badgeBg: 'bg-neutral-100 text-neutral-700',
      icon: Building2,
      ctaText: 'Get Started Free',
      ctaHref: '/auth/register?plan=FREE',
      ctaStyle: 'bg-neutral-900 hover:bg-neutral-800 text-white',
      features: [
        'Standard business directory listing',
        'Up to 5 photo gallery slots',
        'Customer ratings & verified reviews',
        'Business hours & holiday schedules',
        'Direct customer phone number display',
        'GPS location & Google Maps navigation',
        'Indexed across 80+ Ethiopian cities',
      ],
      notIncluded: [
        'Featured search placement',
        'Official verified badge',
        'Analytics & customer insights',
        'Direct customer messaging',
        'Multiple branch management',
      ]
    },
    {
      id: 'BASIC',
      name: 'Basic',
      tagline: 'Ideal for local cafes, shops, and service providers growing their reach.',
      monthlyPrice: '499',
      yearlyPrice: '399',
      annualBilled: 'Billed ETB 4,790 / year',
      priceUnit: 'ETB / month',
      popular: false,
      color: 'border-blue-200 hover:border-blue-400',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
      icon: Zap,
      ctaText: 'Choose Basic',
      ctaHref: '/auth/register?plan=BASIC',
      ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
      features: [
        'Everything in Free',
        'Up to 20 photo gallery slots',
        'Priority placement in category searches',
        'Business performance analytics (views, calls)',
        'Click-to-direction navigation tracking',
        'Social media links (Telegram, TikTok, etc.)',
        'Priority email & phone support',
      ],
      notIncluded: [
        'Top-of-city spotlight banner',
        'Official green verified badge',
        'Direct customer messaging',
        'Multi-branch management',
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      tagline: 'For top restaurants, boutique hotels, and popular establishments.',
      monthlyPrice: '999',
      yearlyPrice: '799',
      annualBilled: 'Billed ETB 9,590 / year',
      priceUnit: 'ETB / month',
      popular: true,
      color: 'border-[#16A34A] shadow-xl ring-2 ring-[#16A34A]/20',
      accentColor: 'text-[#16A34A]',
      badgeBg: 'bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/30',
      icon: Star,
      ctaText: 'Upgrade to Premium',
      ctaHref: '/auth/register?plan=PREMIUM',
      ctaStyle: 'bg-[#16A34A] hover:bg-[#036246] text-white shadow-green-200 shadow-lg',
      features: [
        'Everything in Basic',
        'Unlimited photos & full digital menu upload',
        'Top placement in category & city leaderboards',
        'Official Green Verified Badge (Builds Trust)',
        'Advanced customer engagement analytics',
        'Direct customer messaging & inquiry alerts',
        'Featured on HelloET homepage recommendations',
        '0% commission on bookings and orders',
      ],
      notIncluded: [
        'Multi-branch centralized management',
      ]
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      tagline: 'For chains, banks, hospital networks, and multi-branch brands.',
      monthlyPrice: '2,499',
      yearlyPrice: '1,999',
      annualBilled: 'Billed ETB 23,990 / year',
      priceUnit: 'ETB / month',
      popular: false,
      color: 'border-purple-200 hover:border-purple-400',
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border border-purple-200',
      icon: Crown,
      ctaText: 'Get Enterprise',
      ctaHref: '/contact?plan=ENTERPRISE',
      ctaStyle: 'bg-neutral-900 hover:bg-neutral-800 text-white',
      features: [
        'Everything in Premium',
        'Multi-location & branch management under 1 account',
        'Dedicated account manager (Devvoltz Team)',
        'Custom marketing & banner promotion campaigns',
        'API access for inventory, menu, or booking sync',
        'Custom brand badges & verified spotlight',
        'Quarterly performance review & SEO audits',
        '24/7 dedicated VIP telephone support',
      ],
      notIncluded: []
    }
  ]

  const faqs = [
    {
      q: 'Can I start with the Free plan?',
      a: 'Yes, absolutely! The Free plan is forever free and allows you to list your business, add your contact info, upload up to 5 photos, and start collecting verified reviews from customers across Ethiopia.'
    },
    {
      q: 'Does HelloET take commissions on bookings or phone orders?',
      a: 'No! Unlike international platforms like Booking.com or TripAdvisor that charge 15% to 25% commissions, HelloET charges 0% middleman commission. Customers call your business directly, and you keep 100% of your earnings.'
    },
    {
      q: 'What payment methods do you accept in Ethiopia?',
      a: 'We accept Telebirr, CBE Birr, Awash Bank, Commercial Bank of Ethiopia (CBE) direct transfers, and standard bank deposits. Invoices and receipts are provided in Ethiopian Birr (ETB).'
    },
    {
      q: 'How does the Official Verified Badge work?',
      a: 'The Green Verified Badge confirms that your business identity, location, and phone number have been validated by our team. Verified listings receive significantly higher customer trust, more phone calls, and priority ranking.'
    },
    {
      q: 'Can I upgrade, downgrade, or cancel at any time?',
      a: 'Yes. You can manage your subscription anytime through your Business Dashboard under the Billing section. Changes take effect seamlessly without disrupting your live listing.'
    },
    {
      q: 'What if I manage multiple branches across Addis Ababa or other cities?',
      a: 'Our Enterprise package is tailor-made for multi-location businesses, hotel chains, supermarket branches, and healthcare networks. It allows you to manage all branches under one unified dashboard.'
    }
  ]

  return (
    <div className="min-h-screen bg-white text-neutral-800">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] via-[#004D35] to-[#00281C] text-white pt-20 pb-28 px-4">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#FBBF24]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">
              Ethiopia&apos;s #1 Local Discovery Directory
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6"
          >
            Predictable, Fair Pricing in <span className="text-[#FBBF24]">Ethiopian Birr</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Showcase your business to thousands of daily customers looking for restaurants, hotels, cafes, and services across Ethiopia with <strong className="text-white">0% commission</strong>.
          </motion.p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white/15 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#16A34A] shadow-md scale-100'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-[#16A34A] shadow-md scale-100'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-[#FBBF24] text-neutral-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, idx) => {
            const IconComponent = plan.icon
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl border ${
                  plan.color
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#16A34A] to-[#047857] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Header info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.badgeBg}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${plan.badgeBg}`}>
                      {plan.name}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-neutral-500 min-h-[36px] mb-5 leading-relaxed">{plan.tagline}</p>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-neutral-100">
                    <div className="flex items-baseline gap-1">
                      {price === '0' ? (
                        <span className="text-4xl font-extrabold text-neutral-900">ETB 0</span>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-neutral-400 uppercase">ETB</span>
                          <span className="text-4xl font-extrabold text-neutral-900">{price}</span>
                          <span className="text-xs font-semibold text-neutral-500">/mo</span>
                        </>
                      )}
                    </div>
                    {billingCycle === 'yearly' && plan.annualBilled && (
                      <p className="text-[11px] font-semibold text-[#16A34A] mt-1.5">{plan.annualBilled}</p>
                    )}
                    {price === '0' && (
                      <p className="text-[11px] font-semibold text-neutral-400 mt-1.5">No credit card or payment required</p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8 text-xs sm:text-sm">
                    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Included Features</p>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}

                    {plan.notIncluded.length > 0 && (
                      <div className="pt-2 space-y-2 opacity-50">
                        {plan.notIncluded.map((feat) => (
                          <div key={feat} className="flex items-start gap-2.5 text-neutral-400 line-through">
                            <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">✕</span>
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm ${plan.ctaStyle}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Trust & Local Advantage Strip */}
      <section className="bg-neutral-50 border-y border-neutral-200/80 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-3">
              Why Ethiopian Business Owners Choose HelloET
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              Built specifically for Ethiopia&apos;s local commerce dynamics and payment systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-green-50 text-[#16A34A] rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 mb-2">0% Middleman Commission</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Foreign platforms charge up to 25% on every booking. HelloET provides direct telephone numbers so customers call and deal with you directly with zero commission.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 mb-2">Local Ethiopian Payments</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Pay in Ethiopian Birr (ETB) with zero forex restrictions. We support Telebirr, CBE Birr, Awash Bank, Commercial Bank of Ethiopia, and bank wire.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 mb-2">Programmatic Search & Maps</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Rank on Google for high-intent search terms across 80+ Ethiopian cities and subcities in both English and Amharic with accurate GPS navigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full">
            Detailed Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-3 mb-3">
            Compare HelloET Packages Side-by-Side
          </h2>
          <p className="text-neutral-600 text-sm">
            Everything you need to make the right choice for your business growth.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-neutral-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700">
                <th className="p-4 sm:p-5 font-bold text-sm">Features</th>
                <th className="p-4 sm:p-5 font-bold text-sm text-center">Free</th>
                <th className="p-4 sm:p-5 font-bold text-sm text-center">Basic</th>
                <th className="p-4 sm:p-5 font-bold text-sm text-center bg-[#DCFCE7]/40 text-[#16A34A]">
                  Premium
                </th>
                <th className="p-4 sm:p-5 font-bold text-sm text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
              <tr>
                <td className="p-4 font-semibold text-neutral-800">Monthly Price (ETB)</td>
                <td className="p-4 text-center font-bold text-neutral-600">ETB 0</td>
                <td className="p-4 text-center font-bold text-neutral-600">ETB 499</td>
                <td className="p-4 text-center font-bold text-[#16A34A] bg-[#DCFCE7]/20">ETB 999</td>
                <td className="p-4 text-center font-bold text-neutral-600">ETB 2,499</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Photo Gallery Uploads</td>
                <td className="p-4 text-center text-neutral-600">5 Photos</td>
                <td className="p-4 text-center text-neutral-600">20 Photos</td>
                <td className="p-4 text-center font-semibold text-[#16A34A] bg-[#DCFCE7]/20">Unlimited</td>
                <td className="p-4 text-center font-semibold text-neutral-800">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Direct Customer Phone & Directions</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold bg-[#DCFCE7]/20">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Customer Ratings & Verified Reviews</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold bg-[#DCFCE7]/20">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Search Result Priority</td>
                <td className="p-4 text-center text-neutral-400">Standard</td>
                <td className="p-4 text-center font-medium text-neutral-700">Featured</td>
                <td className="p-4 text-center font-bold text-[#16A34A] bg-[#DCFCE7]/20">Top Placement</td>
                <td className="p-4 text-center font-bold text-purple-700">Spotlight Banner</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Official Green Verified Badge</td>
                <td className="p-4 text-center text-neutral-300">—</td>
                <td className="p-4 text-center text-neutral-300">—</td>
                <td className="p-4 text-center text-[#16A34A] font-bold bg-[#DCFCE7]/20">✓</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Performance Analytics & Insights</td>
                <td className="p-4 text-center text-neutral-300">—</td>
                <td className="p-4 text-center text-neutral-600">Standard</td>
                <td className="p-4 text-center font-bold text-[#16A34A] bg-[#DCFCE7]/20">Advanced Realtime</td>
                <td className="p-4 text-center font-bold text-neutral-800">Advanced + API</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Multi-Location / Branch Management</td>
                <td className="p-4 text-center text-neutral-300">—</td>
                <td className="p-4 text-center text-neutral-300">—</td>
                <td className="p-4 text-center text-neutral-300 bg-[#DCFCE7]/20">—</td>
                <td className="p-4 text-center text-[#16A34A] font-bold">✓ Multi-Branch</td>
              </tr>
              <tr>
                <td className="p-4 text-neutral-700">Customer Support</td>
                <td className="p-4 text-center text-neutral-500">Community</td>
                <td className="p-4 text-center text-neutral-700">Priority Email</td>
                <td className="p-4 text-center font-medium text-[#16A34A] bg-[#DCFCE7]/20">Priority Phone & Email</td>
                <td className="p-4 text-center font-bold text-neutral-800">24/7 VIP Dedicated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-neutral-50 py-20 px-4 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#DCFCE7] text-[#16A34A] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Got Questions? We Have Answers.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 text-left font-bold text-neutral-800 flex justify-between items-center hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-[#16A34A]' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Assistance CTA Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#003D2B] via-[#045D3B] to-[#16A34A] text-white">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] bg-white/10 px-3 py-1 rounded-full">
              Need Help Choosing?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-2">
              Speak Directly with Our Team
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              Devvoltz Technology PLC offers personalized business onboarding, bulk listings, and custom promotional packages across Addis Ababa and all regional capitals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a
              href="tel:0940192676"
              className="flex items-center justify-center gap-2 bg-[#FBBF24] hover:bg-yellow-400 text-neutral-900 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call 0940192676</span>
            </a>
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3.5 rounded-2xl transition-all text-sm"
            >
              <span>List Free Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

