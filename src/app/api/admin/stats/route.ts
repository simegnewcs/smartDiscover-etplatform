import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [totalUsers, totalBusinesses, totalReviews, pendingVerification] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.review.count(),
      prisma.business.count({ where: { verified: false } })
    ])

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })

    const recentBusinesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalBusinesses,
        totalReviews,
        pendingVerification,
        usersByRole: usersByRole.reduce((acc: any, r) => {
          acc[r.role] = r._count.role
          return acc
        }, {}),
        recentUsers: recentUsers.map(u => ({ ...u, id: u.id.toString() })),
        recentBusinesses: recentBusinesses.map(b => ({
          id: b.id.toString(),
          name: b.name,
          slug: b.slug,
          verified: b.verified,
          category: b.category?.name,
          city: b.city?.name,
          createdAt: b.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
