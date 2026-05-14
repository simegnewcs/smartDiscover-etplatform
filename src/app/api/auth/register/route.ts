import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, email, password, role = 'USER' } = body

    console.log('Registration attempt for email:', email, 'role:', role)

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Password must be at least 8 characters
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 409 }
        )
      }
    } catch (dbError) {
      console.error('Database error during user check:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database connection error' },
        { status: 500 }
      )
    }

    // Validate role
    const userRole = role === 'BUSINESS_OWNER' || role === 'ADMIN' ? role : 'USER'
    console.log('User role will be:', userRole)

    // Create user (using plain text password for demo - in production use bcrypt)
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: password, // In production, hash this with bcrypt
          role: userRole,
        }
      })
    } catch (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Remove sensitive data and convert BigInt to string
    const { passwordHash, ...userWithoutPassword } = user
    const userForResponse = {
      ...userWithoutPassword,
      id: user.id.toString() // Convert BigInt to string
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userForResponse
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
