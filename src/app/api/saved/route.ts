import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List saved businesses
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

    // Try using the model first, fall back to raw SQL
    let savedBusinesses: any[] = []
    try {
      const saved = await prisma.$queryRawUnsafe(`
        SELECT 
          sb.id as saved_id,
          sb.created_at as saved_at,
          b.id as business_id,
          b.slug,
          b.name,
          b.description,
          b.address,
          b.phone,
          b.verified,
          c.name as category_name,
          ct.name as city_name,
          (SELECT image_url FROM business_images WHERE business_id = b.id ORDER BY sort_order ASC LIMIT 1) as image_url,
          (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = b.id) as avg_rating,
          (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) as review_count
        FROM saved_businesses sb
        JOIN businesses b ON sb.business_id = b.id
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN cities ct ON b.city_id = ct.id
        WHERE sb.user_id = ?
        ORDER BY sb.created_at DESC
      `, userId)

      savedBusinesses = (saved as any[]).map((item: any) => ({
        savedId: item.saved_id.toString(),
        savedAt: item.saved_at,
        business: {
          id: item.business_id.toString(),
          slug: item.slug,
          name: item.name,
          description: item.description,
          address: item.address,
          phone: item.phone,
          verified: item.verified === 1 || item.verified === true,
          category: item.category_name,
          city: item.city_name,
          imageUrl: item.image_url || null,
          avgRating: Number(item.avg_rating) || 0,
          reviewCount: Number(item.review_count) || 0
        }
      }))
    } catch (e) {
      // Table doesn't exist yet
      console.error('Saved businesses query error:', e)
    }

    return NextResponse.json({
      success: true,
      data: {
        savedBusinesses,
        total: savedBusinesses.length
      }
    })

  } catch (error) {
    console.error('Error fetching saved businesses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved businesses' },
      { status: 500 }
    )
  }
}

// POST - Save or unsave a business (toggle)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const bizId = parseInt(businessId)

    // Check if already saved
    let isSaved = false
    try {
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM saved_businesses WHERE user_id = ? AND business_id = ?`,
        userId, bizId
      )
      isSaved = existing.length > 0

      if (isSaved) {
        // Unsave
        await prisma.$executeRawUnsafe(
          `DELETE FROM saved_businesses WHERE user_id = ? AND business_id = ?`,
          userId, bizId
        )
        return NextResponse.json({
          success: true,
          saved: false,
          message: 'Business removed from saved'
        })
      } else {
        // Save
        await prisma.$executeRawUnsafe(
          `INSERT INTO saved_businesses (user_id, business_id, created_at) VALUES (?, ?, NOW())`,
          userId, bizId
        )
        return NextResponse.json({
          success: true,
          saved: true,
          message: 'Business saved'
        })
      }
    } catch (e: any) {
      // Table doesn't exist
      if (e.message?.includes('doesn\'t exist') || e.code === 'P2010') {
        return NextResponse.json(
          { success: false, error: 'Saved businesses feature not available yet. Please run database migration.' },
          { status: 503 }
        )
      }
      throw e
    }

  } catch (error) {
    console.error('Error saving business:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save business' },
      { status: 500 }
    )
  }
}
