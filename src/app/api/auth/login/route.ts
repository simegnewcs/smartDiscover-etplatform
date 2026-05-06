import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // Find user by email
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          ownedBusinesses: {
            take: 1, // Just to check if they have businesses
          }
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      )
    }

    console.log('User found:', user ? 'Yes' : 'No')

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found. Please register first.' },
        { status: 404 }
      )
    }

    // For demo purposes, accept demo accounts with specific password
    // In production, you'd use proper password hashing with bcrypt
    const isDemoAccount = email === 'business@helloet.com' || email === 'user@helloet.com'
    const isPasswordValid = isDemoAccount ? password === 'demo123' : password === user.passwordHash

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Remove sensitive data and convert BigInt to string
    const { passwordHash, ownedBusinesses, ...userWithoutPassword } = user
    const userForResponse = {
      ...userWithoutPassword,
      id: user.id.toString(), // Convert BigInt to string
      hasBusinesses: ownedBusinesses && ownedBusinesses.length > 0
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userForResponse
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
