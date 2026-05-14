import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const rating = searchParams.get('rating')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  try {
    const where: any = {}
    if (search) {
      where.OR = [
        { comment: { contains: search } },
        { business: { name: { contains: search } } },
        { user: { name: { contains: search } } }
      ]
    }
    if (rating) where.rating = parseInt(rating)

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          business: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map(r => ({
          id: r.id.toString(),
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: { ...r.user, id: r.user.id.toString() },
          business: { ...r.business, id: r.business.id.toString() }
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
