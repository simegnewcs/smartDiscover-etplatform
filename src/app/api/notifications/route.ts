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
    const userRole = session.user.role
    const notifications: any[] = []

    if (userRole === 'BUSINESS_OWNER') {
      // Get recent reviews on user's businesses as notifications
      const businesses = await prisma.business.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true, slug: true }
      })

      if (businesses.length > 0) {
        const bizIds = businesses.map(b => b.id)
        const reviews = await prisma.review.findMany({
          where: {
            businessId: { in: bizIds }
          },
          include: {
            user: { select: { name: true } },
            business: { select: { name: true, slug: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 30
        })

        reviews.forEach((r: any) => {
          const isRecent = Date.now() - new Date(r.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
          notifications.push({
            id: `review-${r.id.toString()}`,
            type: 'review',
            title: `New review on ${r.business.name}`,
            message: `${r.user.name} rated ${r.rating} star${r.rating !== 1 ? 's' : ''}${r.comment ? ': "' + r.comment.substring(0, 80) + (r.comment.length > 80 ? '...' : '') + '"' : ''}`,
            rating: r.rating,
            businessSlug: r.business.slug,
            read: !isRecent,
            createdAt: r.createdAt.toISOString()
          })
        })
      }

      // Welcome notification
      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        select: { createdAt: true }
      })
      if (user) {
        notifications.push({
          id: 'welcome',
          type: 'system',
          title: 'Welcome to HelloET!',
          message: 'You joined as a Business Owner. Add your businesses to get started.',
          read: true,
          createdAt: user.createdAt.toISOString()
        })
      }
    } else {
      // Regular user notifications
      // Reviews they've written getting "liked" - simulated from their own activity
      const reviews = await prisma.review.findMany({
        where: { userId },
        include: {
          business: { select: { name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      reviews.forEach((r: any) => {
        const isRecent = Date.now() - new Date(r.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
        notifications.push({
          id: `review-confirm-${r.id.toString()}`,
          type: 'review_confirm',
          title: 'Review published',
          message: `Your review on ${r.business.name} (${r.rating} stars) has been published`,
          rating: r.rating,
          businessSlug: r.business.slug,
          read: !isRecent,
          createdAt: r.createdAt.toISOString()
        })
      })

      // Welcome notification
      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        select: { createdAt: true }
      })
      if (user) {
        notifications.push({
          id: 'welcome',
          type: 'system',
          title: 'Welcome to HelloET!',
          message: 'Explore businesses, write reviews, and save your favorites.',
          read: true,
          createdAt: user.createdAt.toISOString()
        })
      }
    }

    // Sort by date
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total: notifications.length,
        unreadCount
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
