import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, CheckCircle2, AlertCircle, ArrowLeft, Mail, Scale } from 'lucide-react'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: 'Terms of Use & Service | HelloET Ethiopia Business Directory',
  description: 'Read the HelloET Terms of Use. Review platform rules, business listing policies, review submission guidelines, and disclaimers for HelloET Ethiopia.',
  keywords: [
    'HelloET terms of service', 'terms of use Ethiopia', 'HelloET listing guidelines',
    'business directory terms Ethiopia', 'Devvoltz Technology PLC terms'
  ],
  alternates: {
    canonical: `${siteUrl}/terms`
  }
}

export default function TermsOfServicePage() {
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
              <Scale className="w-4 h-4" />
              Platform Rules &amp; Agreement
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Terms of Use &amp; Service
            </h1>
            <p className="mt-3 text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              Please read these Terms of Use carefully before using HelloET. By accessing or using our platform, you agree to be bound by these terms.
            </p>
            <p className="mt-4 text-xs font-medium text-white/60">
              Last Updated: <span className="text-white">{lastUpdated}</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-10 text-neutral-700 leading-relaxed text-sm sm:text-base">

          {/* Section 1: Agreement to Terms */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Agreement to Terms</h2>
            </div>
            <p>
              These Terms of Use (&ldquo;Terms&rdquo;) constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&ldquo;User&rdquo;, &ldquo;you&rdquo;), and <strong>Devvoltz Technology PLC</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), concerning your access to and use of the <strong>HelloET</strong> platform (<a href={siteUrl} className="text-brand-green font-medium hover:underline">{siteUrl}</a>) and any associated mobile, PWA, or digital applications.
            </p>
            <p>
              By accessing HelloET, registering an account, claiming a business, or browsing listings, you agree to comply with and be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          {/* Section 2: Platform Purpose & Directory Services */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Platform Services</h2>
            </div>
            <p>
              HelloET is an online local discovery platform and business directory connecting consumers, tourists, and residents in Ethiopia with verified local businesses, including restaurants, hotels, cafés, pharmacies, supermarkets, tourist attractions, and professional services.
            </p>
            <p>
              While we strive to provide accurate, up-to-date business hours, contact numbers, and locations, HelloET does not guarantee the continuous availability, pricing, or quality of products/services offered by independent third-party merchants listed on the platform.
            </p>
          </section>

          {/* Section 3: User Accounts & Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">User Accounts &amp; Registration</h2>
            </div>
            <p>
              To claim a business listing, submit reviews, or access the dashboard, you may need to register an account. When registering:
            </p>
            <ul className="space-y-2 list-disc list-inside text-neutral-600">
              <li>You must provide accurate, complete, and current information.</li>
              <li>You are responsible for safeguarding your login credentials.</li>
              <li>You must immediately notify us of any unauthorized use of your account.</li>
              <li>You may not use as a username the name of another person or entity without authorization.</li>
            </ul>
          </section>

          {/* Section 4: Business Listing & Verification Policies */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Business Listings &amp; Claims</h2>
            </div>
            <p>
              Business owners or authorized representatives may add listings or claim existing profiles on HelloET. By submitting or claiming a business:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm pt-1">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                <h3 className="font-semibold text-neutral-900">Authorized Representation</h3>
                <p className="text-neutral-600 text-xs">You warrant that you are the lawful owner or authorized agent of the business being registered.</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                <h3 className="font-semibold text-neutral-900">Information Accuracy</h3>
                <p className="text-neutral-600 text-xs">All contact info, operating hours, addresses, and images must reflect current, truthful business operations.</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                <h3 className="font-semibold text-neutral-900">Verification Right</h3>
                <p className="text-neutral-600 text-xs">HelloET reserves the right to request proof of business registration or trade license before granting verified badges.</p>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1.5">
                <h3 className="font-semibold text-neutral-900">Listing Moderation</h3>
                <p className="text-neutral-600 text-xs">We reserve the right to remove, edit, or suspend any listing that violates our policies or local regulations.</p>
              </div>
            </div>
          </section>

          {/* Section 5: Reviews and User-Generated Content */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Reviews &amp; Community Content</h2>
            </div>
            <p>
              Users may post reviews, ratings, and feedback on listed establishments. All user content must comply with our community standards:
            </p>
            <ul className="space-y-2 list-disc list-inside text-neutral-600">
              <li><strong>Authenticity:</strong> Reviews must be based on genuine, firsthand customer experiences.</li>
              <li><strong>No Conflict of Interest:</strong> Business owners or competitors may not write biased or artificial reviews for or against businesses.</li>
              <li><strong>Civil Discourse:</strong> Hate speech, harassment, profanity, defamation, or discriminatory comments are strictly prohibited.</li>
              <li><strong>License:</strong> By posting content on HelloET, you grant Devvoltz Technology PLC a non-exclusive, royalty-free, worldwide license to display and distribute that content across our directory.</li>
            </ul>
          </section>

          {/* Section 6: Prohibited Uses */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                6
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Prohibited Activities</h2>
            </div>
            <p>You agree not to use HelloET for any unlawful or unauthorized purposes, including:</p>
            <ul className="space-y-2 list-disc list-inside text-neutral-600">
              <li>Scraping, crawling, or extracting platform data via automated bots or scripts without express written consent.</li>
              <li>Circumventing or attempting to bypass security features or authentication controls.</li>
              <li>Interfering with, disrupting, or creating an undue burden on the platform servers or networks.</li>
              <li>Listing illicit, prohibited, or fraudulent businesses or services under Ethiopian law.</li>
            </ul>
          </section>

          {/* Section 7: Third-Party Advertising & Links */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                7
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Advertising &amp; External Links</h2>
            </div>
            <p>
              HelloET displays advertisements through third-party advertising partners, including <strong>Google AdSense</strong>. We do not endorse or assume responsibility for any products, services, or claims advertised through third-party ad networks or outbound links. Any interactions or transactions between you and advertisers are solely between you and the third party.
            </p>
          </section>

          {/* Section 8: Intellectual Property */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                8
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Intellectual Property Rights</h2>
            </div>
            <p>
              The HelloET brand name, logos, website layout, code, software, design, and graphics are the exclusive intellectual property of <strong>Devvoltz Technology PLC</strong> and are protected by applicable copyright, trademark, and intellectual property laws.
            </p>
          </section>

          {/* Section 9: Disclaimers & Limitation of Liability */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                9
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Disclaimers &amp; Limitation of Liability</h2>
            </div>
            <p className="uppercase text-xs font-semibold tracking-wide text-neutral-500">
              Provided &ldquo;As Is&rdquo; and &ldquo;As Available&rdquo;
            </p>
            <p>
              HelloET is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied. Devvoltz Technology PLC shall not be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your use of, or inability to use, the platform or any information provided by third-party businesses.
            </p>
          </section>

          {/* Section 10: Governing Law & Jurisdiction */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-brand-green flex items-center justify-center font-bold text-sm">
                10
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Governing Law</h2>
            </div>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Federal Democratic Republic of Ethiopia</strong>. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in Addis Ababa, Ethiopia.
            </p>
          </section>

          {/* Contact Box */}
          <section className="space-y-4 p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
              <Mail className="w-5 h-5 text-brand-yellow" />
              Questions About These Terms?
            </h2>
            <p className="text-white/80 text-sm">
              If you have any questions or need clarification regarding these Terms of Service, please contact our legal and support team:
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
