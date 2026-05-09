import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string
    role: string
  }
  interface Session {
    user: User
  }
  interface JWT {
    id?: string
    role?: string
  }
}

// Helper function to safely get user from database
async function getUserFromDb(email: string) {
  // Dynamic import to avoid build-time Prisma initialization
  const { prisma } = await import('./prisma')
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return user
  } catch (error) {
    console.error('Database error in authorize:', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if DATABASE_URL is set (build-time check)
        if (!process.env.DATABASE_URL) {
          console.error('DATABASE_URL not set')
          return null
        }

        const user = await getUserFromDb(credentials.email)

        if (!user || user.passwordHash !== credentials.password) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'USER'
      }
      if (account?.provider === 'google') {
        token.role = 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || 'USER'
      }
      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        return !!(profile?.email)
      }
      return true
    }
  }
}
