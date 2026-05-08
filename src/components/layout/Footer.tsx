'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Send, Building2, Utensils, Bed, Coffee, Pill, ShoppingCart, Camera, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-[#003D2B] text-white">
      {/* Subscribe Banner */}
      <div className="bg-[#006747] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Stay Updated with HelloET</h3>
            <p className="text-white/70 text-sm mt-1">Get the latest businesses, deals and updates from across Ethiopia</p>
          </div>
          {subscribed ? (
            <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-white font-medium">
              ✅ Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 md:w-72 px-4 py-3 rounded-xl text-neutral-800 outline-none text-sm font-medium bg-white"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#EEF578] hover:bg-yellow-300 text-[#003D2B] px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#006747] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">HelloET</h2>
                <p className="text-white/50 text-xs">Ethiopia Business Directory</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Ethiopia's #1 trusted local business discovery platform. Find restaurants, hotels, cafés and services across Ethiopia.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-[#006747] rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-[#006747] rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-[#006747] rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 hover:bg-[#006747] rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Browse Categories</h3>
            <ul className="space-y-2 text-sm">
              {[
                { icon: Utensils, label: 'Restaurants', href: '/businesses?category=Restaurants' },
                { icon: Bed, label: 'Hotels', href: '/businesses?category=Hotels' },
                { icon: Coffee, label: 'Cafes', href: '/businesses?category=Cafes' },
                { icon: Pill, label: 'Pharmacies', href: '/businesses?category=Pharmacies' },
                { icon: ShoppingCart, label: 'Supermarkets', href: '/businesses?category=Supermarkets' },
                { icon: Camera, label: 'Tourist Attractions', href: '/businesses?category=Tourist+Attractions' },
                { icon: Building2, label: 'All Businesses', href: '/businesses' },
              ].map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link href={href} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5 text-[#EEF578]" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'All Businesses', href: '/businesses' },
                { label: 'Register Your Business', href: '/auth/register' },
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm uppercase tracking-wider pt-4">Top Cities</h3>
            <ul className="space-y-2 text-sm">
              {['Addis Ababa', 'Bahir Dar', 'Hawassa', 'Gondar', 'Dire Dawa', 'Mekelle'].map((city) => (
                <li key={city}>
                  <Link href={`/businesses?city=${encodeURIComponent(city)}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                    <MapPin className="w-3 h-3 text-[#EEF578]" />
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:0940192676" className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-white/10 group-hover:bg-[#006747] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                    <Phone className="w-4 h-4 text-[#EEF578]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Phone</p>
                    <p className="text-white/80 font-medium">0940192676</p>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:devvoltztech@gmail.com" className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-white/10 group-hover:bg-[#006747] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                    <Mail className="w-4 h-4 text-[#EEF578]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <p className="text-white/80 font-medium">devvoltztech@gmail.com</p>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#EEF578]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Location</p>
                  <p className="text-white/80 font-medium">Addis Ababa, Ethiopia</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} HelloET. All rights reserved.</p>
          <p className="text-white/50 font-medium">
            Developed by{' '}
            <a href="mailto:devvoltztech@gmail.com" className="text-[#EEF578] hover:text-yellow-300 transition-colors">
              Devvoltz Technology PLC
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
