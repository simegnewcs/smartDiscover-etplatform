import type { Metadata } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: 'Login - Sign In to HelloET | Ethiopia Business Directory',
  description: 'Sign in to your HelloET account to manage your business listings, write reviews, and discover local businesses across Ethiopia.',
  keywords: [
    'HelloET login', 'HelloET sign in', 'Ethiopia business directory login',
    'business owner login Ethiopia', 'HelloET account', 'Ethiopian business platform login'
  ],
  alternates: { canonical: `${siteUrl}/auth/login` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Login to HelloET - Ethiopia\'s Business Discovery Platform',
    description: 'Sign in to manage your business listings or discover local businesses in Ethiopia.',
    url: `${siteUrl}/auth/login`,
    type: 'website',
    siteName: 'HelloET',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
