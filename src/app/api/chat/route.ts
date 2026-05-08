import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

async function getBusinessContext(userMessage: string): Promise<string> {
  try {
    const keywords = userMessage.toLowerCase().split(' ').filter(w => w.length > 2)

    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: keywords[0] || '' } },
          { description: { contains: keywords[0] || '' } },
          { category: { name: { contains: keywords[0] || '' } } },
          { city: { name: { contains: keywords[0] || '' } } },
        ]
      },
      include: {
        category: true,
        city: true,
        subcity: true,
      },
      take: 8,
      orderBy: { verified: 'desc' }
    })

    const categories = await prisma.category.findMany({ take: 20 })
    const cities = await prisma.city.findMany({ take: 20 })

    const businessList = businesses.map(b =>
      `- ${b.name} (${b.category.name}, ${b.city.name}${b.subcity ? `, ${b.subcity.name}` : ''}${b.phone ? `, Phone: ${b.phone}` : ''}${b.verified ? ', ✓ Verified' : ''}) — URL: https://helloet.devvoltz.com/business/${b.slug}`
    ).join('\n')

    return `
HELLOET PLATFORM DATA:
Categories available: ${categories.map(c => c.name).join(', ')}
Cities covered: ${cities.map(c => c.name).join(', ')}

Relevant businesses found:
${businessList || 'No specific businesses matched, but many are available at https://helloet.devvoltz.com/businesses'}
`
  } catch {
    return 'HelloET covers restaurants, hotels, cafes, pharmacies, supermarkets, tourist attractions, healthcare, education, local services and entertainment across Ethiopia.'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const context = await getBusinessContext(message)

    const systemPrompt = `You are HelloET Assistant — a friendly, helpful AI for HelloET, Ethiopia's #1 local business discovery platform at helloet.devvoltz.com.

Your job:
- Help users find restaurants, hotels, cafes, pharmacies, supermarkets, tourist attractions and any business in Ethiopia
- Answer questions about businesses, locations, categories and services listed on HelloET
- Give direct links like https://helloet.devvoltz.com/businesses?category=Restaurants for categories
- Be concise, warm and helpful
- Always respond in the same language the user uses (English or Amharic)
- If you don't know a specific business detail, direct users to browse at https://helloet.devvoltz.com/businesses

HelloET is developed by Devvoltz Technology PLC (devvoltztech@gmail.com, 0940192676)

LIVE DATA FROM HELLOET DATABASE:
${context}`

    const contents = [
      ...(history || []).map((msg: { role: string; text: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ]

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
