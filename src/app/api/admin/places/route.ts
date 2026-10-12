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
    const cities = await prisma.city.findMany({
      include: {
        subcities: {
          include: {
            _count: {
              select: { businesses: true }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { businesses: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    const data = cities.map(city => ({
      id: city.id.toString(),
      name: city.name,
      createdAt: city.createdAt,
      businessCount: city._count?.businesses || 0,
      subcities: city.subcities.map(sub => ({
        id: sub.id.toString(),
        name: sub.name,
        cityId: sub.cityId.toString(),
        createdAt: sub.createdAt,
        businessCount: sub._count?.businesses || 0
      }))
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin places GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { type, name, cityId } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()

    if (type === 'city') {
      const existing = await prisma.city.findUnique({
        where: { name: trimmedName }
      })

      if (existing) {
        return NextResponse.json({ error: `City "${trimmedName}" already exists` }, { status: 400 })
      }

      const created = await prisma.city.create({
        data: { name: trimmedName }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: created.id.toString(),
          name: created.name,
          businessCount: 0,
          subcities: []
        }
      })
    } else if (type === 'subcity' || type === 'place') {
      if (!cityId) {
        return NextResponse.json({ error: 'City is required for a place/subcity' }, { status: 400 })
      }

      const parsedCityId = BigInt(cityId)

      const existing = await prisma.subcity.findUnique({
        where: {
          name_cityId: {
            name: trimmedName,
            cityId: parsedCityId
          }
        }
      })

      if (existing) {
        return NextResponse.json({ error: `Place "${trimmedName}" already exists in this city` }, { status: 400 })
      }

      const created = await prisma.subcity.create({
        data: {
          name: trimmedName,
          cityId: parsedCityId
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: created.id.toString(),
          name: created.name,
          cityId: created.cityId.toString(),
          businessCount: 0
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid type specified. Use "city" or "subcity"' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin places POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create place' }, { status: 500 })
  }
}
