import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Building2, Users, Star, Globe, CheckCircle, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About HelloET - Ethiopia\'s #1 Business Discovery Platform',
  description: 'Learn about HelloET — Ethiopia\'s trusted local business directory. Built by Devvoltz Technology PLC to connect people with the best restaurants, hotels, cafés and services across Ethiopia.',
  keywords: [
    'about HelloET', 'HelloET Ethiopia', 'Devvoltz Technology PLC',
    'Ethiopia business directory about', 'HelloET team', 'HelloET contact',
    'Ethiopian business platform', 'devvoltztech', 'HelloET mission'
  ],
  alternates: { canonical: 'https://helloet.devvoltz.com/about' },
}

const stats = [
  { icon: Building2, value: '1,000+', label: 'Businesses Listed' },
  { icon: MapPin, value: '80+', label: 'Cities Covered' },
  { icon: Users, value: '10,000+', label: 'Monthly Users' },
  { icon: Star, value: '4.8', label: 'Average Rating' },
]

const categories = [
  'Restaurants', 'Hotels', 'Cafes', 'Pharmacies',
  'Supermarkets', 'Tourist Attractions', 'Healthcare',
  'Education', 'Local Services', 'Entertainment'
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#006747] to-[#004D35] py-20 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#EEF578]" />
            <span className="text-sm font-medium">Ethiopia&apos;s #1 Business Directory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About HelloET</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            We connect people across Ethiopia with the best local businesses — from the finest restaurants
            in Addis Ababa to historic hotels in Gondar and cozy cafés in Bahir Dar.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#F5FBF8] py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <div className="w-12 h-12 bg-[#D1EFE4] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-[#006747]" />
              </div>
              <p className="text-3xl font-bold text-[#006747]">{value}</p>
              <p className="text-sm text-neutral-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">Our Mission</h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            HelloET was built to make it easy for anyone — locals and tourists alike — to discover
            trusted businesses across Ethiopia. Whether you&apos;re looking for a great place to eat,
            a comfortable hotel, a nearby pharmacy or a hidden tourist gem, HelloET is your guide.
          </p>
          <p className="text-neutral-600 leading-relaxed mb-6">
            We empower Ethiopian business owners to grow their reach digitally by listing their
            businesses, receiving real reviews and connecting with customers across the country.
          </p>
          <ul className="space-y-3">
            {[
              'Verified business listings you can trust',
              'Real reviews from real customers',
              'Coverage across 80+ Ethiopian cities',
              'All categories — restaurants to healthcare',
            ].map((point) => (
              <li key={point} className="flex items-center gap-3 text-neutral-700">
                <CheckCircle className="w-5 h-5 text-[#006747] flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#D1EFE4] to-[#F5FBF8] rounded-3xl p-8">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">Categories We Cover</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/businesses?category=${encodeURIComponent(cat)}`}
                className="bg-white text-[#006747] border border-[#006747]/20 hover:bg-[#006747] hover:text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Developer */}
      <div className="bg-[#003D2B] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-[#006747] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-[#EEF578]" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Developed by Devvoltz Technology PLC</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            HelloET is proudly built and maintained by Devvoltz Technology PLC — an Ethiopian software company
            dedicated to creating impactful digital solutions for businesses and communities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <a
              href="tel:0940192676"
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-[#006747] border border-white/20 rounded-xl px-4 py-4 transition-colors group"
            >
              <Phone className="w-5 h-5 text-[#EEF578]" />
              <div className="text-left">
                <p className="text-white/50 text-xs">Phone</p>
                <p className="text-white font-semibold">0940192676</p>
              </div>
            </a>
            <a
              href="mailto:devvoltztech@gmail.com"
              className="flex items-center justify-center gap-3 bg-white/10 hover:bg-[#006747] border border-white/20 rounded-xl px-4 py-4 transition-colors group"
            >
              <Mail className="w-5 h-5 text-[#EEF578]" />
              <div className="text-left">
                <p className="text-white/50 text-xs">Email</p>
                <p className="text-white font-semibold text-sm">devvoltztech@gmail.com</p>
              </div>
            </a>
            <div className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-4">
              <MapPin className="w-5 h-5 text-[#EEF578]" />
              <div className="text-left">
                <p className="text-white/50 text-xs">Location</p>
                <p className="text-white font-semibold">Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">Ready to Explore Ethiopia?</h2>
          <p className="text-neutral-600 mb-8">
            Discover thousands of businesses across Ethiopia or list your own business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/businesses"
              className="bg-[#006747] hover:bg-[#00523A] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Businesses
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-[#006747] text-[#006747] hover:bg-[#006747] hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
