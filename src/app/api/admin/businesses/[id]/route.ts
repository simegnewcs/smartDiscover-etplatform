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

  const businessId = parseInt(params.id)
  const body = await request.json()
  const { verified } = body

  try {
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: { verified },
      select: { id: true, name: true, verified: true }
    })
    return NextResponse.json({ success: true, data: { ...updated, id: updated.id.toString() } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

  const businessId = parseInt(params.id)
  if (isNaN(businessId)) {
    return NextResponse.json({ success: false, error: 'Invalid business ID' }, { status: 400 })
  }

  try {
    // Cascade-delete all child records in a transaction to satisfy foreign key constraints
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { businessId } }),
      prisma.businessImage.deleteMany({ where: { businessId } }),
      prisma.businessHour.deleteMany({ where: { businessId } }),
      prisma.savedBusiness.deleteMany({ where: { businessId } }),
      prisma.subscription.deleteMany({ where: { businessId } }),
      prisma.business.delete({ where: { id: businessId } }),
    ])

    return NextResponse.json({ success: true, message: 'Business deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete business' },
      { status: 500 }
    )
  }
}
