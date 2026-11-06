import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

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

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

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
        where: { email: trimmedEmail }
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

    // Generate secure token and 6-digit verification code
    const verificationToken = randomBytes(32).toString('hex')
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user in database
    let user
    try {
      user = await prisma.user.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          passwordHash: password,
          role: userRole,
          emailVerified: false,
          verificationToken,
          verificationCode,
          verificationExpiresAt,
        }
      })
    } catch (createError) {
      console.warn('Initial user create failed (possibly missing columns), retrying fallback:', createError)
      try {
        user = await prisma.user.create({
          data: {
            name: trimmedName,
            email: trimmedEmail,
            passwordHash: password,
            role: userRole
          }
        })
      } catch (fallbackError) {
        console.error('Error creating user account:', fallbackError)
        return NextResponse.json(
          { success: false, message: 'Failed to create user account' },
          { status: 500 }
        )
      }
    }

    // Send verification email via DevVoltz Technology
    try {
      await sendVerificationEmail({
        toEmail: trimmedEmail,
        recipientName: trimmedName,
        verificationToken,
        verificationCode,
      })
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
    }

    // Return response
    return NextResponse.json({
      success: true,
      requireVerification: true,
      email: trimmedEmail,
      message: 'Account created! Please check your email to verify your account.',
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: false,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

