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
    const activities: any[] = []

    // Get user reviews as activity
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        business: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    reviews.forEach((r: any) => {
      activities.push({
        id: `review-${r.id.toString()}`,
        type: 'review',
        title: `Reviewed ${r.business.name}`,
        description: r.comment ? r.comment.substring(0, 120) + (r.comment.length > 120 ? '...' : '') : `Rated ${r.rating} stars`,
        rating: r.rating,
        businessSlug: r.business.slug,
        businessName: r.business.name,
        createdAt: r.createdAt.toISOString()
      })
    })

    // Get saved businesses as activity
    try {
      const saved: any[] = await prisma.$queryRawUnsafe(`
        SELECT sb.id, sb.created_at, b.id as business_id, b.name, b.slug
        FROM saved_businesses sb
        JOIN businesses b ON sb.business_id = b.id
        WHERE sb.user_id = ?
        ORDER BY sb.created_at DESC
        LIMIT 50
      `, userId)

      saved.forEach((s: any) => {
        activities.push({
          id: `saved-${s.id.toString()}`,
          type: 'saved',
          title: `Saved ${s.name}`,
          description: `Added ${s.name} to your saved places`,
          businessSlug: s.slug,
          businessName: s.name,
          createdAt: s.created_at instanceof Date ? s.created_at.toISOString() : new Date(s.created_at).toISOString()
        })
      })
    } catch (e) {
      // Table may not exist
    }

    // Sort all activities by date
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Group by date
    const grouped: Record<string, any[]> = {}
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(activity)
    })

    return NextResponse.json({
      success: true,
      data: {
        activities,
        grouped,
        total: activities.length
      }
    })

  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
