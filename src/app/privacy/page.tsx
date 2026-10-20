import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Lock, Cookie, Eye, CheckCircle2, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: 'Privacy Policy | HelloET Ethiopia Business Directory',
  description: 'Read the HelloET Privacy Policy. Learn how we collect, use, and protect your information, and our policies on cookies, third-party advertising, and Google AdSense.',
  keywords: [
    'HelloET privacy policy', 'privacy policy Ethiopia', 'HelloET data protection',
    'Google AdSense privacy policy', 'cookies policy HelloET', 'Devvoltz Technology PLC privacy'
  ],
  alternates: {
    canonical: `${siteUrl}/privacy`
  }
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 20, 2026'

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-brand-dark via-brand-green to-primary-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-brand-yellow mb-4">
              <ShieldCheck className="w-4 h-4" />
              Legal & Transparency
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              At HelloET (operated by Devvoltz Technology PLC), we are committed to protecting your personal data, ensuring transparency, and honoring your privacy choices.
            </p>
            <p className="mt-4 text-xs font-medium text-white/60">
              Last Updated: <span className="text-white">{lastUpdated}</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-10 text-neutral-700 leading-relaxed text-sm sm:text-base">

          {/* Section 1: Introduction */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Introduction</h2>
            </div>
            <p>
              This Privacy Policy explains how <strong>HelloET</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), a digital business discovery and directory service operated by <strong>Devvoltz Technology PLC</strong>, collects, stores, uses, and shares your personal information when you visit or interact with our website located at <a href={siteUrl} className="text-brand-green font-medium hover:underline">{siteUrl}</a>, our mobile web applications, progressive web app (PWA), and associated online services.
            </p>
            <p>
              By accessing or using HelloET, you acknowledge that you have read, understood, and agreed to the practices outlined in this Privacy Policy. If you do not agree with any term of this policy, please refrain from using our platform.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Information We Collect</h2>
            </div>
            <p>We collect information in three ways: information you provide directly, information collected automatically, and information from third parties.</p>
            
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" /> Information You Provide
                </h3>
                <ul className="text-xs sm:text-sm text-neutral-600 space-y-1.5 list-disc list-inside">
                  <li>Account details (Full name, email address, password hash)</li>
                  <li>Business listings (Business name, phone, address, coordinates, hours, category)</li>
                  <li>Customer reviews, ratings, and feedback</li>
                  <li>Direct communications through our contact inquiries</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" /> Automatically Collected Data
                </h3>
                <ul className="text-xs sm:text-sm text-neutral-600 space-y-1.5 list-disc list-inside">
                  <li>Log data (IP address, browser type, operating system)</li>
                  <li>Device identifiers and screen resolution</li>
                  <li>Pages visited, time spent, search queries, and referring URLs</li>
                  <li>Geographic location data (city or approximate regional level)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Google AdSense and Third-Party Advertising (CRITICAL COMPLIANCE) */}
          <section className="space-y-4 p-6 sm:p-8 rounded-3xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-950 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-600" />
                Google AdSense &amp; Third-Party Advertising
              </h2>
            </div>
            
            <p className="text-neutral-800 font-medium">
              We work with third-party vendors and ad networks, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website.
            </p>

            <div className="space-y-3 text-neutral-700 text-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                <p>
                  <strong>Cookies &amp; Web Beacons:</strong> Third-party vendors, including Google, use cookies (such as the DoubleClick DART cookie) to serve ads based on a user&apos;s prior visits to HelloET and other websites across the Internet.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                <p>
                  <strong>Personalized Advertising:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve targeted ads to you based on your visit to our sites and/or other sites on the Internet.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                <p>
                  <strong>Opting Out of Personalized Ads:</strong> You may opt out of personalized advertising by visiting Google&apos;s Ads Settings at{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green font-semibold underline hover:text-brand-dark"
                  >
                    https://www.google.com/settings/ads
                  </a>
                  . Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green font-semibold underline hover:text-brand-dark"
                  >
                    www.aboutads.info
                  </a>
                  {' '}or the Network Advertising Initiative opt-out page at{' '}
                  <a
                    href="https://optout.networkadvertising.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green font-semibold underline hover:text-brand-dark"
                  >
                    https://optout.networkadvertising.org/
                  </a>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Cookies & Tracking Technologies */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Cookies &amp; Local Storage</h2>
            </div>
            <p>
              Cookies are small data files placed on your computer or mobile device. HelloET uses both session cookies (which expire once you close your browser) and persistent cookies (which stay on your device until deleted) to:
            </p>
            <ul className="space-y-2 list-disc list-inside text-neutral-600">
              <li>Keep you signed into your account securely (authentication session tokens)</li>
              <li>Store your preferences, such as bookmarked businesses and recent searches</li>
              <li>Analyze web traffic and measure platform performance through analytics</li>
              <li>Display relevant advertisements and measure ad conversion effectiveness</li>
            </ul>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of HelloET (such as logging into your dashboard or submitting reviews) may not function properly.
            </p>
          </section>

          {/* Section 5: How We Use Your Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">How We Use Your Information</h2>
            </div>
            <p>We use the information collected for legitimate business purposes including:</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                'Providing, operating, and maintaining the HelloET platform',
                'Verifying and publishing local business directory profiles',
                'Facilitating user reviews and community ratings',
                'Communicating account updates, security alerts, and newsletters',
                'Detecting, preventing, and combating spam, fraud, or abuse',
                'Complying with applicable Ethiopian and international laws',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                  <span className="text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Data Sharing & Disclosures */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                6
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Information Sharing &amp; Disclosure</h2>
            </div>
            <p>
              We do <strong>not</strong> sell, trade, or rent your personal identifiable information to third parties. We may disclose your information under the following limited circumstances:
            </p>
            <ul className="space-y-2 list-disc list-inside text-neutral-600">
              <li><strong>Public Listings:</strong> Business details you submit to HelloET (such as business phone, address, photos, and hours) are intended for public visibility and search engine indexing.</li>
              <li><strong>Trusted Service Providers:</strong> Third-party cloud hosting, email delivery, and map providers that help us run the platform under strict confidentiality agreements.</li>
              <li><strong>Legal Compliance:</strong> When required by law, court order, or governmental authorities in the Federal Democratic Republic of Ethiopia.</li>
            </ul>
          </section>

          {/* Section 7: Security & Data Retention */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                7
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Security &amp; Data Retention</h2>
            </div>
            <p>
              We implement industry-standard administrative, physical, and technical security safeguards (including password hashing with bcrypt, SSL/TLS data encryption in transit, and firewalls) to protect your personal information against unauthorized access, loss, or disclosure.
            </p>
            <p>
              We retain personal data as long as your account remains active or as needed to provide our services, resolve disputes, and enforce legal agreements.
            </p>
          </section>

          {/* Section 8: Children's Privacy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                8
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Children&apos;s Privacy</h2>
            </div>
            <p>
              HelloET is intended for general audiences and is not directed at children under the age of 13. We do not knowingly collect personal identifiable information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately so we can promptly delete such data.
            </p>
          </section>

          {/* Section 9: Your Data Rights */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                9
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Your Privacy Rights</h2>
            </div>
            <p>
              Depending on your location, you have rights regarding your personal information, including the right to access, correct, update, or request deletion of your account and personal data. You may exercise these rights at any time by contacting us directly at <a href="mailto:devvoltztech@gmail.com" className="text-brand-green font-medium hover:underline">devvoltztech@gmail.com</a>.
            </p>
          </section>

          {/* Section 10: Contact Us */}
          <section className="space-y-4 p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
              <Mail className="w-5 h-5 text-brand-yellow" />
              Contact Our Privacy Officer
            </h2>
            <p className="text-white/80 text-sm">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-xs uppercase font-medium">Company</p>
                <p className="font-semibold text-white mt-1">Devvoltz Technology PLC</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-xs uppercase font-medium">Email</p>
                <a href="mailto:devvoltztech@gmail.com" className="font-semibold text-brand-yellow hover:underline mt-1 block">
                  devvoltztech@gmail.com
                </a>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-xs uppercase font-medium">Location</p>
                <p className="font-semibold text-white mt-1">Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}
