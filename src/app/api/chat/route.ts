import { NextRequest, NextResponse } from 'next/server'
import {
  analyzeQuery,
  retrieveBusinessesAndContext,
  generateSmartFallbackReply,
  getEthiopiaNow,
  type AssistantBusinessCard,
} from '@/lib/assistant'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GEMINI_STREAM_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse'
const GEMINI_GENERATE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function buildQuickActions(
  intent: ReturnType<typeof analyzeQuery>,
  businesses: AssistantBusinessCard[]
): string[] {
  if (intent.language === 'am') {
    if (intent.matchedTopics.includes('pricing')) {
      return ['በቴሌብር መክፈል ይቻላል?', 'ንግዴን እንዴት ልመዝግብ?', 'አዲስ አበባ ምርጥ ሬስቶራንቶች']
    }
    return ['አዲስ አበባ ምርጥ ሬስቶራንቶች', 'ቦሌ አቅራቢያ ዋይፋይ ያላቸው ካፌዎች', 'የዋጋ ፓኬጆች']
  }

  if (intent.matchedTopics.includes('pricing')) {
    return ['How do I pay with Telebirr?', 'How to list my business?', 'What is the Verified Badge?']
  }
  if (intent.matchedTopics.includes('list_business') || intent.matchedTopics.includes('claim_business')) {
    return ['Show pricing packages', 'What is the Verified Badge?', 'Browse all businesses']
  }
  if (businesses.length > 0) {
    const first = businesses[0]
    return [
      `Which ${first.category} in ${first.city} have WiFi?`,
      `Are any ${first.category} in ${first.city} open now?`,
      'Show pricing packages',
    ]
  }
  return [
    'Best restaurants in Addis Ababa',
    'Which categories are available?',
    'Show pricing packages',
  ]
}

function buildSystemPrompt(
  context: Awaited<ReturnType<typeof retrieveBusinessesAndContext>>,
  currentPath?: string | null
): string {
  const ethiopiaTimeStr = getEthiopiaNow().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
  })

  const businessLines = context.businesses
    .map((b) => {
      const loc = `${b.city}${b.subcity ? `, ${b.subcity}` : ''}`
      const rating = b.rating > 0 ? `Rating: ${b.rating}/5 (${b.reviewCount} reviews)` : 'New listing'
      const openStatus =
        b.isOpenNow === true ? 'OPEN NOW' : b.isOpenNow === false ? 'CLOSED NOW' : b.todayHours || ''
      const phone = b.phone ? `Phone: ${b.phone}` : ''
      const features = b.featureLabels.length > 0 ? `Amenities: ${b.featureLabels.join(', ')}` : ''
      const reviewNote =
        b.topReviews.length > 0
          ? `Review snippet: "${b.topReviews[0].comment.slice(0, 120)}" (${b.topReviews[0].rating}⭐ by ${b.topReviews[0].author})`
          : ''
      const schedule =
        b.weeklyHours.length > 0
          ? `Weekly Hours: ${b.weeklyHours.map((h) => `${h.day.slice(0, 3)} ${h.hours}`).join('; ')}`
          : ''

      return [
        `- **${b.name}** (${b.category} | ${loc}) — Link: /business/${b.slug}`,
        b.description ? `  Description: ${b.description.slice(0, 160)}` : '',
        `  Details: ${[b.address, phone, rating, openStatus].filter(Boolean).join(' · ')}`,
        features ? `  ${features}` : '',
        schedule ? `  ${schedule}` : '',
        reviewNote ? `  ${reviewNote}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')

  const viewingLine = context.viewingBusiness
    ? `\nCURRENTLY VIEWED BUSINESS PAGE (${currentPath}):\n- **${context.viewingBusiness.name}** (${context.viewingBusiness.category}, ${context.viewingBusiness.city}${context.viewingBusiness.subcity ? `, ${context.viewingBusiness.subcity}` : ''})\n  Address: ${context.viewingBusiness.address || 'N/A'} · Phone: ${context.viewingBusiness.phone || 'N/A'} · Today: ${context.viewingBusiness.todayHours || 'N/A'} · Rating: ${context.viewingBusiness.rating}/5\n  Amenities: ${context.viewingBusiness.featureLabels.join(', ') || 'N/A'}`
    : currentPath
    ? `\nUSER CURRENT PAGE PATH: ${currentPath}`
    : ''

  const catSummary = context.categories
    .map((c) => `${c.name}${c.count > 0 ? ` (${c.count})` : ''}`)
    .join(', ')
  const citySummary = context.cities
    .map((c) => `${c.name}${c.count > 0 ? ` (${c.count})` : ''}`)
    .join(', ')

  return `You are HelloET Assistant — the intelligent, deeply knowledgeable concierge for HelloET (helloet.devvoltz.com), Ethiopia's #1 trusted local business discovery platform built by Devvoltz Technology PLC.
Current Ethiopia Local Time (UTC+3): ${ethiopiaTimeStr}.
Total Verified Businesses in Directory: ${context.totalVerifiedCount}.

COMPREHENSIVE HELLOET KNOWLEDGE:
- Purpose: Help locals, expats, and tourists discover verified restaurants, hotels, traditional Bunna Bet coffee houses, 24/7 pharmacies, supermarkets, clinics, tourist attractions, and services across 80+ Ethiopian cities.
- Pricing Plans (0% booking commission, local ETB currency, 20% annual discount):
  * Free (ETB 0/mo): Basic listing, 5 photos, reviews, hours, direct phone & GPS directions.
  * Basic (ETB 499/mo · ETB 4,790/yr): 20 photos, priority search placement, analytics (views, calls, directions), priority support.
  * Premium (ETB 999/mo · ETB 9,590/yr — Most Popular): Unlimited photos/menus, top city leaderboard ranking, Official Green Verified Badge, direct customer messaging, advanced analytics.
  * Enterprise (ETB 2,499/mo · ETB 23,990/yr): Multi-branch management, banner spotlights, API access, 24/7 VIP account manager.
- Ethiopian Payment Methods: Telebirr, CBE Birr, Commercial Bank of Ethiopia (CBE), Awash Bank transfers. No USD/Visa card needed.
- Advantages over Booking.com / TripAdvisor: 0% middleman commission (direct merchant phone calls), Ethiopian subcity precision (Bole, Kazanchis, Piassa, Sarbet, Yeka, CMC, Ayat, Mekanisa), English & Amharic bilingual discovery.
- Listing / Claiming: Register free at /auth/register, add a listing at /dashboard/listings/new, manage analytics & reviews at /dashboard.
- Account Features: Save favorites (/saved), write/manage reviews (/my-reviews), notifications (/notifications).
- Mobile App: Installable Progressive Web App (PWA) & Android APK optimized for fast, low-bandwidth use.
- Contact Devvoltz Technology PLC: Phone 0940192676, Email devvoltztech@gmail.com, Addis Ababa, Ethiopia. Pages: /about, /contact, /pricing, /help, /privacy, /terms.

LIVE CATEGORIES: ${catSummary || 'Restaurants, Hotels, Cafes, Pharmacies, Supermarkets, Tourist Attractions, Healthcare, Education, Local Services'}
LIVE CITIES: ${citySummary || 'Addis Ababa, Bahir Dar, Hawassa, Gondar, Lalibela, Dire Dawa, Mekelle, Adama, Jimma'}
${viewingLine}

MATCHED VERIFIED BUSINESSES FROM LIVE DATABASE:
${businessLines || 'No specific businesses matched this query.'}

STRICT RESPONSE GUIDELINES:
1. Answer ALL parts of the user's question thoroughly, accurately, and in the SAME language (English or Amharic).
2. NEVER invent fake phone numbers, fake addresses, or unverified listings. Only cite businesses from MATCHED VERIFIED BUSINESSES above.
3. Interactive business cards with Call and Google Maps buttons will appear right below your reply when businesses are matched — summarize highlights cleanly (hours, open status, amenities, review insights) without duplicating raw URLs.
4. Formatting: Use clean plain text with **bold**, short numbered/bulleted lists, and helpful emojis. NEVER output raw HTML tags like <b>, <br/>, or <a>.
5. For internal pages, use clean relative paths like /businesses, /pricing, /auth/register, or /dashboard/listings/new.`
}

function splitIntoSmoothChunks(text: string): string[] {
  // Split into natural 2-4 word chunks keeping newlines intact for smooth typewriter feel
  const tokens = text.match(/(\S+\s*|\n+)/g) || [text]
  const chunks: string[] = []
  let buffer = ''
  for (const tok of tokens) {
    buffer += tok
    if (buffer.length >= 14 || tok.includes('\n')) {
      chunks.push(buffer)
      buffer = ''
    }
  }
  if (buffer) chunks.push(buffer)
  return chunks
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const history = Array.isArray(body?.history) ? body.history : []
    const currentPath = typeof body?.currentPath === 'string' ? body.currentPath : null
    const wantsStream = body?.stream === true

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 1. Multi-turn intent analysis + live Prisma RAG retrieval
    const intent = analyzeQuery(message, currentPath, history)
    const context = await retrieveBusinessesAndContext(intent)

    const attachedBusinesses: AssistantBusinessCard[] =
      context.businesses.length > 0
        ? context.businesses.slice(0, 4)
        : context.viewingBusiness &&
          (intent.matchedTopics.includes('business_detail') || intent.intentType === 'search')
        ? [context.viewingBusiness]
        : []

    const quickActions = buildQuickActions(intent, attachedBusinesses)
    const apiKey = process.env.GEMINI_API_KEY?.trim()

    // Non-streaming JSON mode (backwards-compatible)
    if (!wantsStream) {
      if (apiKey) {
        try {
          const systemPrompt = buildSystemPrompt(context, currentPath)
          const recentHistory = history
            .slice(-10)
            .filter((msg: any) => msg && typeof msg.text === 'string' && msg.text.trim().length > 0)
            .map((msg: { role: string; text: string }) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.text }],
            }))

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 14000)

          const res = await fetch(`${GEMINI_GENERATE_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [...recentHistory, { role: 'user', parts: [{ text: message }] }],
              generationConfig: { temperature: 0.55, maxOutputTokens: 900 },
            }),
          })
          clearTimeout(timeoutId)

          if (res.ok) {
            const data = await res.json()
            const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            if (aiReply) {
              return NextResponse.json({
                reply: aiReply,
                businesses: attachedBusinesses,
                quickActions,
                mode: 'ai',
              })
            }
          }
        } catch (err) {
          console.warn('Gemini non-stream error; using smart fallback:', err)
        }
      }

      const fallback = generateSmartFallbackReply(intent, context)
      return NextResponse.json({
        reply: fallback.reply,
        businesses: attachedBusinesses,
        quickActions: fallback.quickActions,
        mode: 'smart-fallback',
      })
    }

    // Streaming SSE mode
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (payload: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        }

        let emittedAiTokens = false

        if (apiKey) {
          try {
            const systemPrompt = buildSystemPrompt(context, currentPath)
            const recentHistory = history
              .slice(-10)
              .filter((msg: any) => msg && typeof msg.text === 'string' && msg.text.trim().length > 0)
              .map((msg: { role: string; text: string }) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.text }],
              }))

            const abortCtrl = new AbortController()
            const timeoutId = setTimeout(() => abortCtrl.abort(), 18000)

            const geminiRes = await fetch(`${GEMINI_STREAM_URL}&key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: abortCtrl.signal,
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [...recentHistory, { role: 'user', parts: [{ text: message }] }],
                generationConfig: { temperature: 0.55, maxOutputTokens: 950 },
              }),
            })

            clearTimeout(timeoutId)

            if (geminiRes.ok && geminiRes.body) {
              sendEvent({
                type: 'meta',
                businesses: attachedBusinesses,
                quickActions,
                mode: 'ai',
              })

              const reader = geminiRes.body.getReader()
              const decoder = new TextDecoder()
              let buffer = ''

              while (true) {
                const { value, done } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const rawLine of lines) {
                  const line = rawLine.trim()
                  if (!line.startsWith('data:')) continue
                  const jsonStr = line.slice(5).trim()
                  if (!jsonStr || jsonStr === '[DONE]') continue

                  try {
                    const parsed = JSON.parse(jsonStr)
                    const deltaText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                    if (typeof deltaText === 'string' && deltaText.length > 0) {
                      emittedAiTokens = true
                      sendEvent({ type: 'delta', text: deltaText })
                    }
                  } catch {
                    // Ignore partial JSON frames
                  }
                }
              }
            }
          } catch (streamErr) {
            console.warn('Gemini SSE stream failed; falling back smoothly:', streamErr)
          }
        }

        // Smooth progressive fallback streaming if AI wasn't available or produced nothing
        if (!emittedAiTokens) {
          const fallback = generateSmartFallbackReply(intent, context)
          sendEvent({
            type: 'meta',
            businesses: attachedBusinesses,
            quickActions: fallback.quickActions,
            mode: 'smart-fallback',
          })

          const chunks = splitIntoSmoothChunks(fallback.reply)
          for (const chunk of chunks) {
            sendEvent({ type: 'delta', text: chunk })
            await new Promise((resolve) => setTimeout(resolve, 14))
          }
        }

        sendEvent({ type: 'done' })
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
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
