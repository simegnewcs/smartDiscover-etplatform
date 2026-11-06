import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

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
  const { prisma } = await import('./prisma')
  const cleanEmail = email.toLowerCase().trim()
  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true
      }
    })
    return user
  } catch (error) {
    console.error('Database error in getUserFromDb:', error)
    return null
  }
}

// Helper to get user by ID with profileImage
async function getUserById(id: number | string | bigint) {
  const { prisma } = await import('./prisma')
  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    if (!user) return null

    // Try to get profileImage via raw query safely
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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : [
          // Fallback Google provider configuration so UI / NextAuth client can target 'google'
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
            allowDangerousEmailAccountLinking: true
          })
        ]),
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
    signIn: '/auth/login',
    error: '/auth/login'
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          console.warn('[Google Auth] No email provided in Google profile')
          return false
        }

        const normalizedEmail = user.email.toLowerCase().trim()
        const { prisma } = await import('./prisma')

        try {
          // 1. Check if user exists in database with explicit column select
          let dbUser: any = null
          try {
            dbUser = await prisma.user.findUnique({
              where: { email: normalizedEmail },
              select: {
                id: true,
                email: true,
                name: true,
                role: true
              }
            })
          } catch (findErr) {
            console.warn('[Google Auth] findUnique error, trying raw SQL fallback:', findErr)
            try {
              const rawRows: any[] = await prisma.$queryRawUnsafe(
                `SELECT id, email, name, role FROM users WHERE LOWER(email) = ? LIMIT 1`,
                normalizedEmail
              )
              if (rawRows && rawRows.length > 0) {
                dbUser = rawRows[0]
              }
            } catch (rawErr) {
              console.warn('[Google Auth] Raw query fallback error:', rawErr)
            }
          }

          // 2. If user does not exist, create them safely
          if (!dbUser) {
            const userName = (user.name || 'Google User').trim()
            try {
              // Try creating with emailVerified: true (if schema migration applied)
              dbUser = await prisma.user.create({
                data: {
                  email: normalizedEmail,
                  name: userName,
                  passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
                  role: 'USER',
                  emailVerified: true
                },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true
                }
              })
            } catch (createErr) {
              console.warn('[Google Auth] Initial create failed (missing column), retrying basic create:', createErr)
              try {
                // Fallback: create without emailVerified in case column is not yet present on production DB
                dbUser = await prisma.user.create({
                  data: {
                    email: normalizedEmail,
                    name: userName,
                    passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
                    role: 'USER'
                  },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                  }
                })
              } catch (basicErr) {
                console.warn('[Google Auth] Basic create failed, trying raw SQL INSERT:', basicErr)
                try {
                  await prisma.$executeRawUnsafe(
                    `INSERT INTO users (email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, 'GOOGLE_OAUTH_ACCOUNT', 'USER', NOW(), NOW())`,
                    normalizedEmail,
                    userName
                  )
                  const createdRaw: any[] = await prisma.$queryRawUnsafe(
                    `SELECT id, email, name, role FROM users WHERE LOWER(email) = ? LIMIT 1`,
                    normalizedEmail
                  )
                  if (createdRaw && createdRaw.length > 0) {
                    dbUser = createdRaw[0]
                  }
                } catch (rawInsertErr) {
                  console.error('[Google Auth] Raw INSERT failed:', rawInsertErr)
                }
              }
            }
          }

          // 3. Populate NextAuth user object with resolved DB values
          if (dbUser && dbUser.id) {
            user.id = dbUser.id.toString()
            user.role = dbUser.role || 'USER'
            user.name = dbUser.name || user.name || 'Google User'
            user.email = dbUser.email || normalizedEmail
            return true
          }

          // 4. Safety net: allow authenticated Google user in so they are NEVER locked out with AccessDenied
          console.warn('[Google Auth] Allowing authenticated Google user with fallback session')
          user.id = '0'
          user.role = 'USER'
          return true
        } catch (error) {
          console.error('[Google Auth] Error in Google signIn callback:', error)
          // Google already verified the identity, so do NOT deny access
          user.id = '0'
          user.role = 'USER'
          return true
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        if (user.image) token.picture = user.image
      }

      // On sign in, fetch fresh data from DB if id is valid
      if (trigger === 'signIn' && token.id && token.id !== '0') {
        try {
          const freshUser = await getUserById(token.id as string)
          if (freshUser) {
            token.name = freshUser.name
            token.email = freshUser.email
            token.role = freshUser.role
            token.picture = freshUser.profileImage || null
          }
        } catch (jwtErr) {
          console.warn('[JWT] Error fetching fresh user:', jwtErr)
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
