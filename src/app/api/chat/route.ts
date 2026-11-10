import { NextRequest, NextResponse } from 'next/server'
import {
  analyzeQuery,
  retrieveBusinessesAndContext,
  generateSmartFallbackReply,
  type AssistantBusinessCard,
} from '@/lib/assistant'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function buildQuickActions(
  intent: ReturnType<typeof analyzeQuery>,
  businesses: AssistantBusinessCard[]
): string[] {
  if (intent.language === 'am') {
    if (intent.intentType === 'pricing') {
      return ['ንግዴን እንዴት ልመዝግብ?', 'አዲስ አበባ ምርጥ ሬስቶራንቶች']
    }
    return ['አዲስ አበባ ምርጥ ሬስቶራንቶች', 'ቦሌ አቅራቢያ ካፌዎች', 'የዋጋ ፓኬጆች']
  }

  if (intent.intentType === 'pricing') {
    return ['How to list my business?', 'What is the Verified Badge?', 'Best restaurants in Addis Ababa']
  }
  if (intent.intentType === 'list_business') {
    return ['Show pricing packages', 'What is the Verified Badge?', 'Browse all businesses']
  }
  if (businesses.length > 0) {
    const first = businesses[0]
    return [
      `More ${first.category} in ${first.city}`,
      '24/7 Pharmacies in Addis Ababa',
      'Show pricing packages',
    ]
  }
  return [
    'Best restaurants in Addis Ababa',
    'Hotels in Bahir Dar',
    'Show pricing packages',
  ]
}

function buildSystemPrompt(
  context: Awaited<ReturnType<typeof retrieveBusinessesAndContext>>,
  currentPath?: string | null
): string {
  const businessLines = context.businesses
    .map((b) => {
      const loc = `${b.city}${b.subcity ? `, ${b.subcity}` : ''}`
      const rating = b.rating > 0 ? `Rating: ${b.rating}/5 (${b.reviewCount} reviews)` : 'New listing'
      const hours = b.todayHours ? `, Today: ${b.todayHours}` : ''
      const phone = b.phone ? `, Phone: ${b.phone}` : ''
      return `- **${b.name}** (${b.category} | ${loc}${b.address ? ` | ${b.address}` : ''}${phone} | ${rating}${hours}, Verified ✓) — Link: /business/${b.slug}`
    })
    .join('\n')

  const viewingLine = context.viewingBusiness
    ? `\nCURRENTLY VIEWED BUSINESS PAGE (${currentPath}):\n- **${context.viewingBusiness.name}** (${context.viewingBusiness.category}, ${context.viewingBusiness.city}${context.viewingBusiness.subcity ? `, ${context.viewingBusiness.subcity}` : ''}, Address: ${context.viewingBusiness.address || 'N/A'}, Phone: ${context.viewingBusiness.phone || 'N/A'}, Today's Hours: ${context.viewingBusiness.todayHours || 'N/A'}, Rating: ${context.viewingBusiness.rating}/5)`
    : currentPath
    ? `\nUSER CURRENT PAGE PATH: ${currentPath}`
    : ''

  return `You are HelloET Assistant — the helpful, smart AI concierge for HelloET (helloet.devvoltz.com), Ethiopia's #1 local business discovery directory built by Devvoltz Technology PLC.

CORE CAPABILITIES & KNOWLEDGE:
- Help users discover restaurants, hotels, traditional coffee houses (Bunna Bet), 24/7 pharmacies, supermarkets, healthcare, tourist attractions, and services across 80+ Ethiopian cities.
- Business packages (0% booking commission, payable via Telebirr, CBE Birr, CBE, Awash Bank):
  * Free (ETB 0/mo): Basic listing, 5 photos, reviews, hours, direct phone.
  * Basic (ETB 499/mo): 20 photos, featured search, analytics, priority support.
  * Premium (ETB 999/mo): Unlimited photos, top search placement, Official Green Verified Badge, direct messaging.
  * Enterprise (ETB 2,499/mo): Multi-branch management, API access, dedicated account manager.
- Listing/claiming a business: /auth/register or /dashboard/listings/new (free to start).
- Devvoltz Technology PLC Contact: Phone 0940192676, Email devvoltztech@gmail.com, Location: Addis Ababa, Ethiopia.

AVAILABLE CATEGORIES: ${context.categories.join(', ') || 'Restaurants, Hotels, Cafes, Pharmacies, Supermarkets, Tourist Attractions, Healthcare, Education, Local Services'}
CITIES IN DATABASE: ${context.cities.join(', ') || 'Addis Ababa, Bahir Dar, Hawassa, Gondar, Lalibela, Dire Dawa, Mekelle, Adama, Jimma'}
${viewingLine}

MATCHED VERIFIED BUSINESSES FROM LIVE DATABASE:
${businessLines || 'No specific businesses matched this query. Suggest browsing /businesses or searching another city/category.'}

STRICT RESPONSE RULES:
1. Respond in the SAME language the user used (English or Amharic).
2. NEVER invent fake phone numbers, fake addresses, or fake businesses. Only recommend businesses present in MATCHED VERIFIED BUSINESSES above.
3. Note that interactive business cards with Call and Google Maps buttons will automatically be displayed beneath your reply whenever businesses are matched — so keep your text concise, friendly, and well-structured!
4. Formatting: Use clean plain text with **bold** for names/highlights, emojis (🍽️ 🏨 ☕ 💊 📍 📞 ⭐), and short bullet lists. Do NOT output raw HTML tags like <b>, <br/>, or <a>.
5. For internal page references, write clean relative paths like /businesses, /pricing, /auth/register, or /business/slug so the UI turns them into clickable links.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const history = Array.isArray(body?.history) ? body.history : []
    const currentPath = typeof body?.currentPath === 'string' ? body.currentPath : null

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 1. Analyze intent & retrieve live database context
    const intent = analyzeQuery(message, currentPath)
    const context = await retrieveBusinessesAndContext(intent)

    const attachedBusinesses: AssistantBusinessCard[] =
      context.businesses.length > 0
        ? context.businesses.slice(0, 4)
        : context.viewingBusiness && intent.intentType === 'search'
        ? [context.viewingBusiness]
        : []

    // 2. Use Gemini AI if API key is configured, with automatic fallback
    const apiKey = process.env.GEMINI_API_KEY?.trim()

    if (apiKey) {
      try {
        const systemPrompt = buildSystemPrompt(context, currentPath)
        const recentHistory = history
          .slice(-8)
          .filter((msg: any) => msg && typeof msg.text === 'string' && msg.text.trim().length > 0)
          .map((msg: { role: string; text: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }],
          }))

        const contents = [
          ...recentHistory,
          { role: 'user', parts: [{ text: message }] },
        ]

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 12000)

        const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 600,
            },
          }),
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (aiReply) {
            return NextResponse.json({
              reply: aiReply,
              businesses: attachedBusinesses,
              quickActions: buildQuickActions(intent, attachedBusinesses),
              mode: 'ai',
            })
          }
        } else {
          const errText = await response.text().catch(() => '')
          console.warn(`Gemini API returned ${response.status}; using smart fallback.`, errText.slice(0, 200))
        }
      } catch (aiErr) {
        console.warn('Gemini request failed or timed out; using smart fallback.', aiErr)
      }
    }

    // 3. Smart Database-Powered Fallback (works with zero API key or on rate-limit)
    const fallback = generateSmartFallbackReply(intent, context)
    return NextResponse.json({
      reply: fallback.reply,
      businesses: attachedBusinesses,
      quickActions: fallback.quickActions,
      mode: 'smart-fallback',
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        reply:
          'I ran into a temporary issue while checking the directory. Please try again, or browse all verified businesses directly at /businesses.',
        businesses: [],
        quickActions: ['Browse all businesses', 'Show pricing packages'],
        mode: 'error-fallback',
      },
      { status: 200 }
    )
  }
}
