import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Fetching categories from database...')
    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            businesses: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`Found ${categories.length} categories`)

    // Safely serialize categories with BigInt conversion
    const serializedCategories = categories.map(category => {
      try {
        return {
          id: category.id.toString(),
          name: category.name,
          description: category.description,
          icon: category.icon || 'building',
          businessCount: category._count?.businesses || 0
        }
      } catch (mapError) {
        console.error('Error mapping category:', category, mapError)
        return null
      }
    }).filter(Boolean) // Remove any null entries

    return NextResponse.json({
      success: true,
      data: serializedCategories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
