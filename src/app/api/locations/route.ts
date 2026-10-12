import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_LOCATIONS = [
  { 
    name: 'Addis Ababa', 
    subcities: ['Bole', 'Piassa', 'Mekanisa', 'Airport', 'Kazanchis', 'Piazza', 'CMC', 'Mekane Yesus', 'Arada', 'Kirkos', 'Lideta', 'Yeka', 'Kolfe Keranio', 'Nifas Silk-Lafto', 'Akaky Kaliti'] 
  },
  { 
    name: 'Bahir Dar', 
    subcities: ['Gish Abay', 'Belay Zeleke', 'Kebele 01', 'Kebele 02', 'Shimbit', 'Ginbot 20'] 
  },
  { 
    name: 'Hawassa', 
    subcities: ['Mekane Yesus', 'Tabor', 'Sabian', 'Harar', 'Hayek Dar', 'Misrak', 'Menhariya'] 
  },
  { 
    name: 'Mekelle', 
    subcities: ['Kahsay', 'Adi Haki', 'Hawelti', 'Enda Yesus', 'Ayder', 'Kedamay Weyane'] 
  },
  { 
    name: 'Gondar', 
    subcities: ['Azezo', 'Piazza', 'Kebele 01', 'Kebele 02', 'Maraki', 'Arada'] 
  },
  { 
    name: 'Dire Dawa', 
    subcities: ['Megala', 'Kebele 01', 'Kebele 02', 'Kebele 03', 'Gende Kore', 'Sabian'] 
  },
  { 
    name: 'Adama', 
    subcities: ['Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Bole', 'Boku'] 
  },
  { 
    name: 'Bishoftu', 
    subcities: ['Kebele 01', 'Kebele 02', 'Babogaya', 'Hora'] 
  },
  { 
    name: 'Jimma', 
    subcities: ['Mendera', 'Hermata', 'Boche Bore', 'Jiren'] 
  }
]

export async function GET() {
  try {
    let cities = await prisma.city.findMany({
      include: {
        subcities: {
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { businesses: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Auto-seed default cities & subcities if the table is empty
    if (cities.length === 0) {
      for (const loc of DEFAULT_LOCATIONS) {
        try {
          const createdCity = await prisma.city.create({
            data: { name: loc.name }
          })
          if (loc.subcities && loc.subcities.length > 0) {
            await prisma.subcity.createMany({
              data: loc.subcities.map(subName => ({
                name: subName,
                cityId: createdCity.id
              })),
              skipDuplicates: true
            })
          }
        } catch (e) {
          console.warn(`Initial seed skipped for ${loc.name}:`, e)
        }
      }

      cities = await prisma.city.findMany({
        include: {
          subcities: {
            orderBy: { name: 'asc' }
          },
          _count: {
            select: { businesses: true }
          }
        },
        orderBy: { name: 'asc' }
      })
    }

    const formatted = cities.map(city => ({
      id: city.id.toString(),
      name: city.name,
      businessCount: city._count?.businesses || 0,
      subcities: city.subcities.map(sub => ({
        id: sub.id.toString(),
        name: sub.name,
        cityId: sub.cityId.toString()
      }))
    }))

    return NextResponse.json({
      success: true,
      data: formatted
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch locations',
        data: DEFAULT_LOCATIONS.map((loc, i) => ({
          id: String(i + 1),
          name: loc.name,
          businessCount: 0,
          subcities: loc.subcities.map((s, si) => ({
            id: `${i + 1}-${si + 1}`,
            name: s,
            cityId: String(i + 1)
          }))
        }))
      },
      { status: 500 }
    )
  }
}
