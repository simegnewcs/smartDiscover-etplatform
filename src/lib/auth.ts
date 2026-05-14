import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string
    role: string
    image?: string | null
  }
  interface Session {
    user: User & { email: string; name: string; image?: string | null }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    picture?: string | null
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

// Helper to get user by ID with profileImage
async function getUserById(id: number) {
  const { prisma } = await import('./prisma')
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    if (!user) return null

    // Try to get profileImage via raw query
    let profileImage: string | null = null
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT profile_image FROM users WHERE id = ?`, id
      )
      if (result.length > 0) {
        profileImage = result[0].profile_image || null
      }
    } catch (e) {
      // Column doesn't exist yet
    }

    return { ...user, profileImage }
  } catch (error) {
    console.error('Database error in getUserById:', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
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
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // On sign in, fetch fresh data from DB
      if (trigger === 'signIn' && token.id) {
        const freshUser = await getUserById(parseInt(token.id as string))
        if (freshUser) {
          token.name = freshUser.name
          token.email = freshUser.email
          token.role = freshUser.role
          token.picture = freshUser.profileImage || null
        }
      }

      // When updateSession() is called with data, apply it directly
      if (trigger === 'update' && updateData) {
        if (updateData.name !== undefined) token.name = updateData.name
        if (updateData.email !== undefined) token.email = updateData.email
        if (updateData.image !== undefined) token.picture = updateData.image
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture || null
      }
      return session
    }
  }
}
