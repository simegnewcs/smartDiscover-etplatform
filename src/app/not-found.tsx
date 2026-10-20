import Link from 'next/link'
import { Search, Compass, Home, Building2, MapPin, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-neutral-200">
        
        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-green mb-6">
          <Compass className="w-4 h-4 animate-spin-slow" />
          Page Not Found (404)
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          Looking for a Place in Ethiopia?
        </h1>
        <p className="mt-4 text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          The page you are looking for may have moved or no longer exists. Don&apos;t worry &mdash; thousands of verified restaurants, hotels, cafes, and services are waiting on HelloET.
        </p>

        {/* Quick Search Action */}
        <div className="mt-8 max-w-md mx-auto">
          <form action="/businesses" method="GET" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search by business name, city, or service..."
              className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-neutral-300 text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green shadow-sm"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-2 w-9 h-9 bg-brand-green hover:bg-brand-dark text-white rounded-xl flex items-center justify-center transition-colors shadow"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Links Grid */}
        <div className="mt-10 pt-8 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <Link
            href="/"
            className="p-4 rounded-2xl bg-neutral-50 hover:bg-green-50/60 border border-neutral-100 hover:border-brand-green/30 transition-all group"
          >
            <Home className="w-5 h-5 text-brand-green mb-2" />
            <h2 className="font-bold text-sm text-neutral-900 group-hover:text-brand-green">HelloET Home</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Explore our homepage</p>
          </Link>

          <Link
            href="/businesses"
            className="p-4 rounded-2xl bg-neutral-50 hover:bg-green-50/60 border border-neutral-100 hover:border-brand-green/30 transition-all group"
          >
            <Building2 className="w-5 h-5 text-brand-green mb-2" />
            <h2 className="font-bold text-sm text-neutral-900 group-hover:text-brand-green">All Businesses</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Filter by category &amp; rating</p>
          </Link>

          <Link
            href="/contact"
            className="p-4 rounded-2xl bg-neutral-50 hover:bg-green-50/60 border border-neutral-100 hover:border-brand-green/30 transition-all group"
          >
            <MapPin className="w-5 h-5 text-brand-green mb-2" />
            <h2 className="font-bold text-sm text-neutral-900 group-hover:text-brand-green">Need Help?</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Contact our support team</p>
          </Link>
        </div>

      </div>
    </div>
  )
}
