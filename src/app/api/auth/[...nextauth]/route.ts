import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Ensure we export the handler properly for Next.js 14 App Router
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
