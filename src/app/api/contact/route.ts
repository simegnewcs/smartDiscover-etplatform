import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Please provide name, email, and message.' },
        { status: 400 }
      )
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // In production, this can also forward via nodemailer to devvoltztech@gmail.com
    console.log(`[Contact Form Received] From: ${name} <${email}> | Subject: ${subject || 'General'} | Message: ${message}`)

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your inquiry has been received. Our team will get back to you within 24 hours.'
    })
  } catch (error) {
    console.error('[Contact API Error]:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry. Please try again or email us directly.' },
      { status: 500 }
    )
  }
}
