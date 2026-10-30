import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle GET request (e.g. from clicking the link in the email)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token && !email) {
      return NextResponse.json(
        { success: false, message: 'Missing token or email' },
        { status: 400 }
      )
    }

    let user = null
    if (token) {
      user = await prisma.user.findFirst({
        where: { verificationToken: token }
      })
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification link.' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email has already been verified. You can log in.'
      })
    }

    if (token && user.verificationToken !== token) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token.' },
        { status: 400 }
      )
    }

    if (user.verificationExpiresAt && new Date() > user.verificationExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          expired: true,
          message: 'This verification link has expired. Please request a new verification email.'
        },
        { status: 400 }
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationCode: null,
        verificationExpiresAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in to HelloET.'
    })
  } catch (error) {
    console.error('Error verifying email (GET):', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error while verifying email.' },
      { status: 500 }
    )
  }
}

// Handle POST request (e.g. manual 6-digit code or token entry on the page)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code, token } = body

    if (!email && !token) {
      return NextResponse.json(
        { success: false, message: 'Please provide email or verification token.' },
        { status: 400 }
      )
    }

    let user = null
    if (token) {
      user = await prisma.user.findFirst({
        where: { verificationToken: token }
      })
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with this information.' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. You can log in.'
      })
    }

    // Verify via code if provided
    if (code) {
      const trimmedCode = code.toString().trim()
      if (user.verificationCode !== trimmedCode) {
        return NextResponse.json(
          { success: false, message: 'Invalid 6-digit verification code. Please check your email.' },
          { status: 400 }
        )
      }
    } else if (token) {
      if (user.verificationToken !== token) {
        return NextResponse.json(
          { success: false, message: 'Invalid verification token.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Verification code or token is required.' },
        { status: 400 }
      )
    }

    if (user.verificationExpiresAt && new Date() > user.verificationExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          expired: true,
          message: 'The verification code has expired. Please request a new one.'
        },
        { status: 400 }
      )
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationCode: null,
        verificationExpiresAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.'
    })
  } catch (error) {
    console.error('Error verifying email (POST):', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error while verifying email.' },
      { status: 500 }
    )
  }
}
