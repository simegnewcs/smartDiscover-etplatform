import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { path = '/', eventType = 'PAGE_VIEW', businessId, referrer } = body

    const bId = businessId ? BigInt(businessId) : BigInt(0)

    try {
      await prisma.analyticsEvent.create({
        data: {
          businessId: bId,
          eventType: eventType || 'PAGE_VIEW',
          metadata: {
            path,
            referrer: referrer || null,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (dbErr) {
      console.warn('Analytics event write skipped:', dbErr)
    }

    return NextResponse.json({ success: true, recorded: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 200 })
  }
}
