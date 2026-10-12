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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { type, name, cityId } = body
    const id = BigInt(params.id)

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()

    if (type === 'city') {
      const updated = await prisma.city.update({
        where: { id },
        data: { name: trimmedName }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id.toString(),
          name: updated.name
        }
      })
    } else if (type === 'subcity' || type === 'place') {
      const updateData: any = { name: trimmedName }
      if (cityId) {
        updateData.cityId = BigInt(cityId)
      }

      const updated = await prisma.subcity.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id.toString(),
          name: updated.name,
          cityId: updated.cityId.toString()
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid type specified. Use "city" or "subcity"' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin places PATCH error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A location with this name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Failed to update place' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'city'
    const id = BigInt(params.id)

    if (type === 'city') {
      // Check if city has businesses
      const businessCount = await prisma.business.count({
        where: { cityId: id }
      })

      if (businessCount > 0) {
        return NextResponse.json({
          error: `Cannot delete this city because ${businessCount} business(es) are currently located in it.`
        }, { status: 400 })
      }

      // Delete subcities under this city first (cascade)
      await prisma.subcity.deleteMany({
        where: { cityId: id }
      })

      await prisma.city.delete({
        where: { id }
      })

      return NextResponse.json({ success: true, message: 'City deleted successfully' })
    } else if (type === 'subcity' || type === 'place') {
      // Check if subcity has businesses
      const businessCount = await prisma.business.count({
        where: { subcityId: id }
      })

      if (businessCount > 0) {
        return NextResponse.json({
          error: `Cannot delete this place because ${businessCount} business(es) are assigned to it.`
        }, { status: 400 })
      }

      await prisma.subcity.delete({
        where: { id }
      })

      return NextResponse.json({ success: true, message: 'Place deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Invalid type specified. Use "city" or "subcity"' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin places DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete place' }, { status: 500 })
  }
}
