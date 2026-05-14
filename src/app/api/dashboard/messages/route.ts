import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const isBusinessOwner = session.user.role === 'BUSINESS_OWNER'

    // Get businesses owned by user (for business owners)
    let businesses: any[] = []
    if (isBusinessOwner) {
      businesses = await prisma.business.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true, slug: true }
      })
    }

    // Messages feature is not yet in the database schema
    // Return empty state with business context for future implementation
    return NextResponse.json({
      success: true,
      data: {
        messages: [],
        businesses: businesses.map(b => ({
          id: b.id.toString(),
          name: b.name,
          slug: b.slug
        })),
        stats: {
          totalMessages: 0,
          unreadMessages: 0,
          repliedMessages: 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
