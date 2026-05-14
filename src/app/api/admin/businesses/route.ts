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
  const verified = searchParams.get('verified')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  try {
    const where: any = {}
    if (search) where.name = { contains: search }
    if (verified === 'true') where.verified = true
    if (verified === 'false') where.verified = false

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          category: { select: { name: true } },
          city: { select: { name: true } },
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { reviews: true } }
        },
        orderBy: [{ verified: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.business.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        businesses: businesses.map(b => ({
          id: b.id.toString(),
          name: b.name,
          slug: b.slug,
          verified: b.verified,
          category: b.category?.name,
          city: b.city?.name,
          phone: b.phone,
          email: b.email,
          createdAt: b.createdAt,
          reviewCount: b._count.reviews,
          owner: b.owner ? { ...b.owner, id: b.owner.id.toString() } : null
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}
