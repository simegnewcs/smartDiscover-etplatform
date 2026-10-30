import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    })

    if (!user) {
      // Don't reveal account existence for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a new verification link has been sent.'
      })
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'This email is already verified. You can log in.'
      })
    }

    // Generate new token & code
    const verificationToken = randomBytes(32).toString('hex')
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationCode,
        verificationExpiresAt,
      }
    })

    // Send email via DevVoltz Technology
    await sendVerificationEmail({
      toEmail: user.email,
      recipientName: user.name,
      verificationToken,
      verificationCode,
    })

    return NextResponse.json({
      success: true,
      message: 'A new verification email has been sent from DevVoltz Technology. Please check your inbox.'
    })
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to resend verification email.' },
      { status: 500 }
    )
  }
}
