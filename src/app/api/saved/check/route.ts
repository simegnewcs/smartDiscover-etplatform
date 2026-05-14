import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Check if a business is saved
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: true, saved: false })
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ success: true, saved: false })
    }

    try {
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM saved_businesses WHERE user_id = ? AND business_id = ?`,
        userId, parseInt(businessId)
      )
      return NextResponse.json({ success: true, saved: existing.length > 0 })
    } catch (e) {
      // Table doesn't exist yet
      return NextResponse.json({ success: true, saved: false })
    }

  } catch (error) {
    return NextResponse.json({ success: true, saved: false })
  }
}
