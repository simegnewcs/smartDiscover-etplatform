'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Clock, 
  ArrowLeft,
  Loader2
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (data.success) {
        setStatus({ type: 'success', message: data.message })
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message.' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again or email us directly.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-brand-green text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Page Header Banner */}
        <div className="bg-gradient-to-br from-brand-dark via-brand-green to-primary-900 rounded-3xl p-8 sm:p-12 text-white shadow-sm relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-brand-yellow mb-4">
              <Sparkles className="w-4 h-4" />
              We Are Here To Help
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Get in Touch with HelloET
            </h1>
            <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed">
              Have questions about listing your business, advertising on HelloET, user reviews, or partnering with Devvoltz Technology PLC? Our team in Addis Ababa is ready to assist you.
            </p>
          </div>
        </div>

        {/* Two Column Layout: Contact Info & Interactive Form */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Direct Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contact Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-green" />
                Contact Information
              </h2>
              
              <ul className="space-y-4 text-sm">
                <li>
                  <a
                    href="tel:0940192676"
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-neutral-50 hover:bg-green-50/70 border border-neutral-100 hover:border-brand-green/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-green/10 group-hover:bg-brand-green text-brand-green group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Direct Phone</p>
                      <p className="text-neutral-900 font-bold mt-0.5">0940192676</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Mon - Sat, 8:30 AM - 6:00 PM EAT</p>
                    </div>
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:devvoltztech@gmail.com"
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-neutral-50 hover:bg-green-50/70 border border-neutral-100 hover:border-brand-green/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-green/10 group-hover:bg-brand-green text-brand-green group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Support &amp; Inquiries</p>
                      <p className="text-neutral-900 font-bold mt-0.5 break-all">devvoltztech@gmail.com</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Response within 24 hours</p>
                    </div>
                  </a>
                </li>

                <li className="flex items-start gap-4 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 font-medium">Headquarters</p>
                    <p className="text-neutral-900 font-bold mt-0.5">Devvoltz Technology PLC</p>
                    <p className="text-xs text-neutral-600 mt-0.5">Addis Ababa, Ethiopia</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Support Links Card */}
            <div className="bg-gradient-to-br from-[#003D2B] to-[#004D35] text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-white">Looking for something else?</h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Check our documentation, category directories, or get answers to frequent questions:
              </p>
              <div className="flex flex-col gap-2.5 pt-2 text-xs sm:text-sm font-medium">
                <Link
                  href="/help"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between"
                >
                  <span>How HelloET Works</span>
                  <span className="text-brand-yellow font-bold">&rarr;</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between"
                >
                  <span>List Your Ethiopian Business</span>
                  <span className="text-brand-yellow font-bold">&rarr;</span>
                </Link>
                <Link
                  href="/privacy"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-between"
                >
                  <span>Privacy Policy &amp; Cookie Disclosures</span>
                  <span className="text-brand-yellow font-bold">&rarr;</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Send Us a Message</h2>
              <p className="text-neutral-500 text-sm mt-1">
                Fill in the form below and our team will get back to you as soon as possible.
              </p>
            </div>

            {status && (
              <div
                className={`p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-neutral-50/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Subject / Topic
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-neutral-50/50"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Business Listing Support">Business Listing Support / Claiming</option>
                  <option value="Advertising & Sponsorship">Advertising &amp; Sponsorship</option>
                  <option value="Report an Issue / Bug">Report an Issue or Incorrect Info</option>
                  <option value="Partnership Proposal">Partnership Proposal with Devvoltz</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help your business or answer your questions? Please provide as much detail as possible..."
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-neutral-50/50 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-green hover:bg-brand-dark text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}
