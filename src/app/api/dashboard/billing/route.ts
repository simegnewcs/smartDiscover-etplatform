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

    // Get businesses with subscriptions
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    const subscriptions = businesses
      .filter(b => b.subscription)
      .map(b => ({
        id: b.subscription!.id.toString(),
        businessId: b.id.toString(),
        businessName: b.name,
        plan: b.subscription!.plan,
        status: b.subscription!.status,
        startDate: b.subscription!.startDate.toISOString(),
        endDate: b.subscription!.endDate.toISOString()
      }))

    const businessesWithoutSub = businesses
      .filter(b => !b.subscription)
      .map(b => ({
        id: b.id.toString(),
        name: b.name
      }))

    // Summary
    const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE')
    const currentPlan = activeSubs.length > 0
      ? activeSubs.sort((a, b) => {
          const planOrder = { ENTERPRISE: 4, PREMIUM: 3, BASIC: 2, FREE: 1 }
          return (planOrder[b.plan as keyof typeof planOrder] || 0) - (planOrder[a.plan as keyof typeof planOrder] || 0)
        })[0].plan
      : 'FREE'

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        businessesWithoutSub,
        summary: {
          totalBusinesses: businesses.length,
          activeSubscriptions: activeSubs.length,
          currentPlan
        }
      }
    })

  } catch (error) {
    console.error('Error fetching billing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}
