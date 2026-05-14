'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Loader2,
  Building2,
  CheckCircle2,
  Crown,
  Zap,
  Star,
  ArrowRight,
  Calendar,
  AlertCircle
} from 'lucide-react'

interface Subscription {
  id: string
  businessId: string
  businessName: string
  plan: string
  status: string
  startDate: string
  endDate: string
}

interface BillingSummary {
  totalBusinesses: number
  activeSubscriptions: number
  currentPlan: string
}

const planDetails: Record<string, { name: string; price: string; features: string[]; icon: any; color: string }> = {
  FREE: {
    name: 'Free',
    price: 'ETB 0/mo',
    features: ['Basic listing', '5 photos', 'Customer reviews', 'Business hours'],
    icon: Building2,
    color: 'bg-neutral-100 text-neutral-600'
  },
  BASIC: {
    name: 'Basic',
    price: 'ETB 499/mo',
    features: ['Everything in Free', '20 photos', 'Featured in search', 'Business analytics', 'Priority support'],
    icon: Zap,
    color: 'bg-blue-100 text-blue-600'
  },
  PREMIUM: {
    name: 'Premium',
    price: 'ETB 999/mo',
    features: ['Everything in Basic', 'Unlimited photos', 'Top search placement', 'Advanced analytics', 'Verified badge', 'Direct messaging'],
    icon: Star,
    color: 'bg-purple-100 text-purple-600'
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'ETB 2,499/mo',
    features: ['Everything in Premium', 'Multiple locations', 'API access', 'Dedicated account manager', 'Custom branding', 'Promotional campaigns'],
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-700'
  }
}

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [businessesWithoutSub, setBusinessesWithoutSub] = useState<any[]>([])
  const [summary, setSummary] = useState<BillingSummary>({
    totalBusinesses: 0,
    activeSubscriptions: 0,
    currentPlan: 'FREE'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBilling()
  }, [])

  const fetchBilling = async () => {
    try {
      const res = await fetch('/api/dashboard/billing')
      const data = await res.json()

      if (data.success) {
        setSubscriptions(data.data.subscriptions)
        setBusinessesWithoutSub(data.data.businessesWithoutSub)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error fetching billing:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Cancelled</span>
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full">Expired</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#006747]" />
      </div>
    )
  }

  const currentPlanInfo = planDetails[summary.currentPlan] || planDetails.FREE

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Billing & Plans</h1>
        <p className="text-neutral-600 mt-1">Manage your subscriptions and billing</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-r from-[#006747] to-[#00523A] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm">Current Plan</p>
            <h2 className="text-3xl font-bold mt-1">{currentPlanInfo.name}</h2>
            <p className="text-white/80 mt-1">{currentPlanInfo.price}</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
            <currentPlanInfo.icon className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-white/60">Businesses</span>
              <span className="ml-2 font-semibold">{summary.totalBusinesses}</span>
            </div>
            <div>
              <span className="text-white/60">Active Subs</span>
              <span className="ml-2 font-semibold">{summary.activeSubscriptions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#006747]" />
            Active Subscriptions
          </h3>
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const plan = planDetails[sub.plan] || planDetails.FREE
              const PlanIcon = plan.icon
              return (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${plan.color} rounded-lg flex items-center justify-center`}>
                      <PlanIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-800">{sub.businessName}</h4>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>{plan.name} Plan</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires {new Date(sub.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Businesses Without Subscription */}
      {businessesWithoutSub.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-neutral-800">Businesses on Free Plan</h3>
          </div>
          <p className="text-sm text-neutral-500 mb-4">These businesses can be upgraded for better visibility and features</p>
          <div className="space-y-3">
            {businessesWithoutSub.map((biz: any) => (
              <div key={biz.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-200 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-neutral-400" />
                  </div>
                  <span className="font-medium text-neutral-700">{biz.name}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-neutral-200 text-neutral-600 rounded-full">Free</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(planDetails).map(([key, plan]) => {
            const PlanIcon = plan.icon
            const isCurrent = key === summary.currentPlan
            return (
              <div
                key={key}
                className={`bg-white rounded-xl border-2 p-6 transition-all ${
                  isCurrent ? 'border-[#006747] shadow-lg' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {isCurrent && (
                  <span className="inline-block text-xs font-semibold bg-[#D1EFE4] text-[#006747] px-2 py-1 rounded-full mb-3">
                    Current Plan
                  </span>
                )}
                <div className={`w-10 h-10 ${plan.color} rounded-lg flex items-center justify-center mb-3`}>
                  <PlanIcon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-neutral-800">{plan.name}</h4>
                <p className="text-[#006747] font-semibold mt-1">{plan.price}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button className="w-full mt-4 px-4 py-2 border-2 border-[#006747] text-[#006747] font-medium rounded-lg hover:bg-[#006747] hover:text-white transition-colors flex items-center justify-center gap-1">
                    Upgrade <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
