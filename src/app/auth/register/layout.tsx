import type { Metadata } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || 'https://helloet.devvoltz.com'

export const metadata: Metadata = {
  title: 'Register - Create Your HelloET Account | List Your Ethiopian Business',
  description: 'Join HelloET - Ethiopia\'s #1 business discovery platform. Register as a business owner to list your restaurant, hotel, café, pharmacy or any local business, or sign up as a user to discover and review businesses across Ethiopia.',
  keywords: [
    'HelloET register', 'HelloET sign up', 'list business Ethiopia',
    'add business Addis Ababa', 'register Ethiopian business', 'business listing Ethiopia',
    'create business profile Ethiopia', 'HelloET business owner', 'join HelloET Ethiopia',
    'free business listing Ethiopia', 'Ethiopian business registration',
    'restaurant listing Ethiopia', 'hotel listing Ethiopia', 'cafe listing Ethiopia'
  ],
  alternates: { canonical: `${siteUrl}/auth/register` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Register on HelloET - List Your Ethiopian Business',
    description: 'Create your free HelloET account. List your Ethiopian business or sign up to discover and review local businesses.',
    url: `${siteUrl}/auth/register`,
    type: 'website',
    siteName: 'HelloET',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
