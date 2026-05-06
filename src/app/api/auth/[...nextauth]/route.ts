import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic'

// Ensure this runs on Node.js runtime (not edge)
export const runtime = 'nodejs'

// Disable static generation for this route
export const dynamicParams = true

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
