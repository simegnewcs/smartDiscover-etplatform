import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test if we can import prisma
    const { prisma } = await import('@/lib/prisma')
    console.log('Prisma imported successfully')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('Database connection successful. User count:', userCount)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      userCount: userCount
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
