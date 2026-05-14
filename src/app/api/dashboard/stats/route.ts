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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const userRole = session.user.role
    const isBusinessOwner = userRole === 'BUSINESS_OWNER'

    let stats = {
      businessCount: 0,
      reviewCount: 0,
      messageCount: 0,
      notificationCount: 0,
      savedPlacesCount: 0,
      recentActivityCount: 0
    }

    if (isBusinessOwner) {
      // Count businesses owned by user
      const businessCount = await prisma.business.count({
        where: { ownerId: userId }
      })

      // Count reviews for all user's businesses
      const businessIds = await prisma.business.findMany({
        where: { ownerId: userId },
        select: { id: true }
      })
      
      const reviewCount = businessIds.length > 0 
        ? await prisma.review.count({
            where: {
              businessId: {
                in: businessIds.map(b => b.id)
              }
            }
          })
        : 0

      // TODO: Add message count when messaging feature is implemented
      const messageCount = 0

      let savedPlacesCount = 0
      try {
        const savedResult: any[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM saved_businesses WHERE user_id = ?`, userId
        )
        savedPlacesCount = Number(savedResult[0]?.count) || 0
      } catch (e) { /* table may not exist */ }

      // Notification count: recent reviews on user's businesses (last 7 days)
      let notificationCount = 0
      if (businessIds.length > 0) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        notificationCount = await prisma.review.count({
          where: {
            businessId: { in: businessIds.map(b => b.id) },
            createdAt: { gte: sevenDaysAgo }
          }
        })
      }

      // Activity count: reviews + saves
      let recentActivityCount = reviewCount + savedPlacesCount

      stats = {
        businessCount,
        reviewCount,
        messageCount,
        notificationCount,
        savedPlacesCount,
        recentActivityCount
      }
    } else {
      // Regular user stats
      const reviewCount = await prisma.review.count({
        where: { userId }
      })

      let savedPlacesCount = 0
      try {
        const savedResult: any[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM saved_businesses WHERE user_id = ?`, userId
        )
        savedPlacesCount = Number(savedResult[0]?.count) || 0
      } catch (e) { /* table may not exist */ }

      // Notification count: recent review confirmations (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const notificationCount = await prisma.review.count({
        where: {
          userId,
          createdAt: { gte: sevenDaysAgo }
        }
      })

      // Activity count: reviews + saves
      const recentActivityCount = reviewCount + savedPlacesCount

      stats = {
        businessCount: 0,
        reviewCount,
        messageCount: 0,
        notificationCount,
        savedPlacesCount,
        recentActivityCount
      }
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
