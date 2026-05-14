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

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { businesses: true } } },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({
      success: true,
      data: categories.map(c => ({ ...c, id: c.id.toString(), businessCount: c._count.businesses }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, description, icon } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  try {
    const category = await prisma.category.create({
      data: { name, description, icon }
    })
    return NextResponse.json({ success: true, data: { ...category, id: category.id.toString() } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
