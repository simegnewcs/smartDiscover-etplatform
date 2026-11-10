import { prisma } from '@/lib/prisma'
import { getMapDirectionsUrl } from '@/lib/maps'

export interface AssistantBusinessCard {
  id: string
  slug: string
  name: string
  category: string
  city: string
  subcity: string | null
  address: string | null
  phone: string | null
  website: string | null
  verified: boolean
  image: string | null
  rating: number
  reviewCount: number
  directionsUrl: string
  todayHours: string | null
}

export interface AssistantIntent {
  language: 'en' | 'am'
  intentType: 'search' | 'pricing' | 'list_business' | 'help' | 'greeting' | 'general'
  keywords: string[]
  categoryHints: string[]
  cityHint: string | null
  subcityHint: string | null
  viewingSlug: string | null
}

const STOP_WORDS = new Set([
  'in', 'me', 'to', 'on', 'at', 'by', 'of', 'or', 'is', 'it', 'my', 'we', 'do', 'go', 'no', 'so', 'up', 'us', 'an', 'as',
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one',
  'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see',
  'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'what',
  'where', 'when', 'which', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'will',
  'would', 'there', 'their', 'about', 'best', 'good', 'great', 'nice', 'top', 'near', 'nearest',
  'find', 'show', 'give', 'list', 'looking', 'want', 'need', 'please', 'hello', 'here', 'around',
  'some', 'any', 'ethiopia', 'place', 'places', 'spot', 'spots', 'business', 'businesses',
  'open', 'now', 'today', 'very', 'much', 'more', 'most', 'tell', 'know', 'help', 'could',
  'ምርጥ', 'አቅራቢያ', 'ያለ', 'ውስጥ', 'እባክዎ', 'ፈልግ', 'አሳየኝ', 'የት', 'ነው', 'ናቸው', 'ኢትዮጵያ', 'ቦታ', 'ቦታዎች'
])

const CATEGORY_SYNONYMS: Array<{ terms: string[]; category: string }> = [
  { terms: ['restaurant', 'restaurants', 'food', 'eat', 'dining', 'dinner', 'lunch', 'breakfast', 'injera', 'kitfo', 'tibs', 'pizza', 'burger', 'shiro', 'ሬስቶራንት', 'ሬስቶራንቶ', 'ምግብ'], category: 'Restaurant' },
  { terms: ['hotel', 'hotels', 'stay', 'room', 'rooms', 'lodge', 'resort', 'guesthouse', 'motel', 'accommodation', 'ሆቴል', 'ሆቴሎ', 'መኝታ'], category: 'Hotel' },
  { terms: ['cafe', 'cafes', 'coffee', 'bunna', 'buna', 'tea', 'espresso', 'bakery', 'pastry', 'macchiato', 'ካፌ', 'ቡና'], category: 'Cafe' },
  { terms: ['pharmacy', 'pharmacies', 'drug', 'drugstore', 'medicine', 'chemist', 'ፋርማሲ', 'መድኃኒት'], category: 'Pharmacy' },
  { terms: ['supermarket', 'supermarkets', 'grocery', 'groceries', 'mart', 'store', 'shopping', 'ሱፐርማርኬት', 'ሱፐርማርኬቶ', 'ግሮሰሪ'], category: 'Supermarket' },
  { terms: ['tourist', 'attraction', 'attractions', 'museum', 'park', 'monument', 'visit', 'tour', 'sightseeing', 'church', 'heritage', 'ቱሪስት', 'ሙዚየም', 'ሙዚየሞ'], category: 'Tourist' },
  { terms: ['hospital', 'clinic', 'doctor', 'healthcare', 'health', 'medical', 'dentist', 'dental', 'lab', 'ሆስፒታል', 'ሆስፒታሎ', 'ክሊኒክ', 'ክሊኒኮ', 'ጤና'], category: 'Health' },
  { terms: ['education', 'school', 'college', 'university', 'academy', 'training', 'course', 'ትምህርት'], category: 'Education' },
  { terms: ['entertainment', 'cinema', 'movie', 'club', 'lounge', 'bar', 'music', 'gym', 'fitness', 'spa', 'መዝናኛ'], category: 'Entertainment' },
  { terms: ['service', 'services', 'salon', 'barber', 'repair', 'garage', 'mechanic', 'bank', 'delivery', 'laundry', 'አገልግሎት', 'አገልግሎቶ'], category: 'Service' },
]

const CITY_SYNONYMS: Array<{ terms: string[]; city: string }> = [
  { terms: ['addis ababa', 'addis', 'finfinne', 'አዲስ አበባ', 'አዲስ'], city: 'Addis Ababa' },
  { terms: ['bahir dar', 'bahirdar', 'ባህር ዳር'], city: 'Bahir Dar' },
  { terms: ['hawassa', 'awassa', 'ሀዋሳ'], city: 'Hawassa' },
  { terms: ['gondar', 'gonder', 'ጎንደር'], city: 'Gondar' },
  { terms: ['lalibela', 'ላሊበላ'], city: 'Lalibela' },
  { terms: ['dire dawa', 'diredawa', 'ድሬዳዋ'], city: 'Dire Dawa' },
  { terms: ['mekelle', 'mekele', 'መቀሌ'], city: 'Mekelle' },
  { terms: ['adama', 'nazret', 'nazareth', 'አዳማ'], city: 'Adama' },
  { terms: ['jimma', 'ጅማ'], city: 'Jimma' },
  { terms: ['arba minch', 'arbaminch', 'አርባ ምንጭ'], city: 'Arba Minch' },
  { terms: ['dessie', 'dese', 'ደሴ'], city: 'Dessie' },
  { terms: ['bishoftu', 'debre zeit', 'ቢሾፍቱ'], city: 'Bishoftu' },
  { terms: ['jijiga', 'jigjiga', 'ጅጅጋ'], city: 'Jijiga' },
  { terms: ['shashamane', 'ሻሸመኔ'], city: 'Shashamane' },
  { terms: ['axum', 'aksum', 'አክሱም'], city: 'Axum' },
  { terms: ['harar', 'ሐረር'], city: 'Harar' },
]

const SUBCITY_SYNONYMS: Array<{ terms: string[]; subcity: string }> = [
  { terms: ['bole', 'ቦሌ'], subcity: 'Bole' },
  { terms: ['kazanchis', 'casanchis', 'ካዛንቺስ'], subcity: 'Kazanchis' },
  { terms: ['piassa', 'piazza', 'ፒያሳ'], subcity: 'Piassa' },
  { terms: ['sarbet', 'sar bet', 'ሳርቤት'], subcity: 'Sarbet' },
  { terms: ['yeka', 'የካ'], subcity: 'Yeka' },
  { terms: ['arada', 'አራዳ'], subcity: 'Arada' },
  { terms: ['kirkos', 'ቂርቆስ'], subcity: 'Kirkos' },
  { terms: ['mekanisa', 'መካኒሳ'], subcity: 'Mekanisa' },
  { terms: ['cmc', 'ሲኤምሲ'], subcity: 'CMC' },
  { terms: ['ayat', 'አያት'], subcity: 'Ayat' },
  { terms: ['lideta', 'ልደታ'], subcity: 'Lideta' },
  { terms: ['gerji', 'ገርጂ'], subcity: 'Gerji' },
  { terms: ['sarise', 'saris', 'ሳሪስ'], subcity: 'Saris' },
  { terms: ['megenagna', 'መገናኛ'], subcity: 'Megenagna' },
]

function getTodayDayOfWeek(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[new Date().getDay()]
}

function unslugify(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Parses user message and current page route into structured search intent,
 * language detection, city/subcity hints, and category synonyms.
 */
export function analyzeQuery(message: string, currentPath?: string | null): AssistantIntent {
  const isAmharic = /[\u1200-\u137F]/.test(message)
  const lower = message.toLowerCase().trim()

  // Extract page context from pathname if available
  let pathCity: string | null = null
  let pathCategory: string | null = null
  let viewingSlug: string | null = null

  if (currentPath) {
    const cityMatch = currentPath.match(/^\/city\/([^/?#]+)(?:\/([^/?#]+))?/)
    if (cityMatch) {
      pathCity = unslugify(cityMatch[1])
      if (cityMatch[2]) pathCategory = unslugify(cityMatch[2])
    }
    const catMatch = currentPath.match(/^\/category\/([^/?#]+)/)
    if (catMatch) {
      pathCategory = unslugify(catMatch[1])
    }
    const bizMatch = currentPath.match(/^\/business\/([^/?#]+)/)
    if (bizMatch && bizMatch[1] !== 'claim') {
      viewingSlug = decodeURIComponent(bizMatch[1])
    }
  }

  // Detect high-level intent
  let intentType: AssistantIntent['intentType'] = 'search'

  const greetingRegex = /^(hi|hello|hey|selam|selamta|good morning|good afternoon|good evening|thanks|thank you|ሰላም|ታዲያስ|እንዴት|አመሰግናለሁ)[\s!?.]*$/i
  if (greetingRegex.test(lower)) {
    intentType = 'greeting'
  } else if (/(pricing|price|package|plan|subscription|cost|fee|commission|etb|birr|ዋጋ|ክፍያ|ፓኬጅ)/i.test(lower)) {
    intentType = 'pricing'
  } else if (/(list my business|add business|add my business|register business|claim|create listing|owner|ቢዝነስ መመዝገብ|ንግድ መመዝገብ)/i.test(lower)) {
    intentType = 'list_business'
  } else if (/(how does helloet work|how it works|contact devvoltz|support|help me|እርዳታ|ስለ helloet)/i.test(lower)) {
    intentType = 'help'
  }

  // Extract category hints
  const categoryHints: string[] = []
  for (const entry of CATEGORY_SYNONYMS) {
    if (entry.terms.some((t) => lower.includes(t))) {
      if (!categoryHints.includes(entry.category)) {
        categoryHints.push(entry.category)
      }
    }
  }
  if (categoryHints.length === 0 && pathCategory && /(here|this|near|place|best|top|recommended)/i.test(lower)) {
    for (const entry of CATEGORY_SYNONYMS) {
      if (entry.terms.some((t) => pathCategory!.toLowerCase().includes(t))) {
        categoryHints.push(entry.category)
      }
    }
  }

  // Extract city hint
  let cityHint: string | null = null
  for (const entry of CITY_SYNONYMS) {
    if (entry.terms.some((t) => lower.includes(t))) {
      cityHint = entry.city
      break
    }
  }
  if (!cityHint && pathCity && /(here|near me|around|this city|local|አቅራቢያ)/i.test(lower)) {
    cityHint = pathCity
  }

  // Extract subcity hint
  let subcityHint: string | null = null
  for (const entry of SUBCITY_SYNONYMS) {
    if (entry.terms.some((t) => lower.includes(t))) {
      subcityHint = entry.subcity
      if (!cityHint) cityHint = 'Addis Ababa'
      break
    }
  }

  // Clean meaningful keywords
  const cleaned = lower.replace(/[?!.,;:'"()\[\]{}\/\\]/g, ' ')
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))

  return {
    language: isAmharic ? 'am' : 'en',
    intentType,
    keywords: Array.from(new Set(tokens)).slice(0, 6),
    categoryHints,
    cityHint,
    subcityHint,
    viewingSlug,
  }
}

/**
 * Queries live verified businesses, categories, cities, and ratings from MySQL via Prisma
 * using multi-keyword matching and relevance scoring.
 */
export async function retrieveBusinessesAndContext(intent: AssistantIntent): Promise<{
  businesses: AssistantBusinessCard[]
  viewingBusiness: AssistantBusinessCard | null
  categories: string[]
  cities: string[]
}> {
  const todayDay = getTodayDayOfWeek()

  const [categoriesList, citiesList] = await Promise.all([
    prisma.category.findMany({ select: { name: true }, take: 25, orderBy: { name: 'asc' } }),
    prisma.city.findMany({ select: { name: true }, take: 30, orderBy: { name: 'asc' } }),
  ])

  const categories = categoriesList.map((c) => c.name)
  const cities = citiesList.map((c) => c.name)

  // Fetch currently viewed business if on /business/[slug]
  let viewingBusiness: AssistantBusinessCard | null = null
  if (intent.viewingSlug) {
    const vb = await prisma.business.findUnique({
      where: { slug: intent.viewingSlug },
      include: {
        category: true,
        city: true,
        subcity: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        hours: true,
        _count: { select: { reviews: true } },
      },
    })
    if (vb && vb.verified) {
      const ratingAgg = await prisma.review.aggregate({
        where: { businessId: vb.id },
        _avg: { rating: true },
      })
      const todayHour = vb.hours.find((h) => h.day === todayDay)
      viewingBusiness = formatBusinessCard(vb, ratingAgg._avg.rating || 0, todayHour)
    }
  }

  // Skip business search if purely pricing/greeting/list_business without category/city keywords
  const shouldSearchBusinesses =
    intent.intentType === 'search' ||
    intent.categoryHints.length > 0 ||
    intent.cityHint !== null ||
    intent.subcityHint !== null ||
    intent.keywords.length > 0

  if (!shouldSearchBusinesses) {
    return { businesses: [], viewingBusiness, categories, cities }
  }

  // Build flexible OR conditions across all extracted signals
  const orConditions: any[] = []

  for (const cat of intent.categoryHints) {
    orConditions.push({ category: { name: { contains: cat } } })
  }
  if (intent.cityHint) {
    orConditions.push({ city: { name: { contains: intent.cityHint } } })
  }
  if (intent.subcityHint) {
    orConditions.push({ subcity: { name: { contains: intent.subcityHint } } })
    orConditions.push({ address: { contains: intent.subcityHint } })
  }
  for (const kw of intent.keywords) {
    orConditions.push({ name: { contains: kw } })
    orConditions.push({ description: { contains: kw } })
    orConditions.push({ address: { contains: kw } })
    orConditions.push({ category: { name: { contains: kw } } })
    orConditions.push({ city: { name: { contains: kw } } })
    orConditions.push({ subcity: { name: { contains: kw } } })
  }

  const candidates = await prisma.business.findMany({
    where: {
      verified: true,
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    },
    include: {
      category: true,
      city: true,
      subcity: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      hours: true,
      _count: { select: { reviews: true } },
    },
    take: 30,
    orderBy: [{ createdAt: 'desc' }],
  })

  if (candidates.length === 0) {
    return { businesses: [], viewingBusiness, categories, cities }
  }

  // Fetch average ratings for candidates in one query
  const candidateIds = candidates.map((b) => b.id)
  const ratings = await prisma.review.groupBy({
    by: ['businessId'],
    where: { businessId: { in: candidateIds } },
    _avg: { rating: true },
  })
  const ratingMap = ratings.reduce((acc, r) => {
    acc[r.businessId.toString()] = r._avg.rating || 0
    return acc
  }, {} as Record<string, number>)

  // Score candidates by how well they match BOTH city + category + keywords + rating
  const scored = candidates.map((b) => {
    let score = 0
    const bName = b.name.toLowerCase()
    const bDesc = (b.description || '').toLowerCase()
    const bCat = b.category.name.toLowerCase()
    const bCity = b.city.name.toLowerCase()
    const bSub = (b.subcity?.name || '').toLowerCase()
    const bAddr = (b.address || '').toLowerCase()

    if (intent.cityHint && bCity.includes(intent.cityHint.toLowerCase())) {
      score += 10
    }
    if (intent.subcityHint && (bSub.includes(intent.subcityHint.toLowerCase()) || bAddr.includes(intent.subcityHint.toLowerCase()))) {
      score += 8
    }
    for (const cat of intent.categoryHints) {
      if (bCat.includes(cat.toLowerCase())) {
        score += 10
      }
    }
    for (const kw of intent.keywords) {
      if (bName.includes(kw)) score += 6
      if (bCat.includes(kw)) score += 4
      if (bCity.includes(kw) || bSub.includes(kw)) score += 3
      if (bDesc.includes(kw) || bAddr.includes(kw)) score += 2
    }

    const avgRating = ratingMap[b.id.toString()] || 0
    score += avgRating * 0.5
    score += Math.min(b._count.reviews, 10) * 0.2

    const todayHour = b.hours.find((h) => h.day === todayDay)
    return {
      score,
      card: formatBusinessCard(b, avgRating, todayHour),
    }
  })

  scored.sort((a, b) => b.score - a.score)

  // If user requested BOTH a city and a category, prefer results that match both if any exist
  let topMatches = scored.slice(0, 6).map((s) => s.card)
  if (intent.cityHint && intent.categoryHints.length > 0) {
    const strictMatches = scored.filter(
      (s) =>
        s.card.city.toLowerCase().includes(intent.cityHint!.toLowerCase()) &&
        intent.categoryHints.some((cat) => s.card.category.toLowerCase().includes(cat.toLowerCase()))
    )
    if (strictMatches.length > 0) {
      topMatches = strictMatches.slice(0, 5).map((s) => s.card)
    }
  } else {
    topMatches = scored.slice(0, 5).map((s) => s.card)
  }

  return {
    businesses: topMatches,
    viewingBusiness,
    categories,
    cities,
  }
}

function formatBusinessCard(b: any, rating: number, todayHour?: any): AssistantBusinessCard {
  const lat = b.latitude ? parseFloat(b.latitude.toString()) : null
  const lng = b.longitude ? parseFloat(b.longitude.toString()) : null
  const locationQuery = `${b.name}, ${b.address || ''} ${b.subcity?.name || ''} ${b.city.name}, Ethiopia`.trim()

  let todayHours: string | null = null
  if (todayHour) {
    todayHours = todayHour.isClosed
      ? 'Closed today'
      : todayHour.openTime && todayHour.closeTime
      ? `${todayHour.openTime} - ${todayHour.closeTime}`
      : 'Open'
  }

  return {
    id: b.id.toString(),
    slug: b.slug,
    name: b.name,
    category: b.category.name,
    city: b.city.name,
    subcity: b.subcity?.name || null,
    address: b.address || null,
    phone: b.phone || null,
    website: b.website || null,
    verified: b.verified,
    image: b.images?.[0]?.imageUrl || null,
    rating: Number(rating.toFixed(1)),
    reviewCount: b._count?.reviews || 0,
    directionsUrl: getMapDirectionsUrl(lat, lng, locationQuery),
    todayHours,
  }
}

/**
 * Generates an intelligent database-backed response when Gemini is unconfigured,
 * rate-limited (429), or unreachable.
 */
export function generateSmartFallbackReply(
  intent: AssistantIntent,
  context: {
    businesses: AssistantBusinessCard[]
    viewingBusiness: AssistantBusinessCard | null
    categories: string[]
    cities: string[]
  }
): { reply: string; quickActions: string[] } {
  const isAm = intent.language === 'am'

  if (intent.intentType === 'greeting') {
    return {
      reply: isAm
        ? 'ሰላም! 👋 እንኳን ወደ **HelloET Assistant** በደህና መጡ። በኢትዮጵያ ውስጥ ምርጥ ሬስቶራንቶችን፣ ሆቴሎችን፣ ካፌዎችን፣ ፋርማሲዎችን እና ሌሎች የንግድ ተቋማትን እንዲያገኙ ልረዳዎ ዝግጁ ነኝ። ምን ይፈልጋሉ?'
        : 'Selam! 👋 Welcome to **HelloET Assistant**. I can help you find verified restaurants, hotels, traditional coffee houses, 24/7 pharmacies, and local businesses across 80+ cities in Ethiopia. What are you looking for today?',
      quickActions: isAm
        ? ['አዲስ አበባ ምርጥ ሬስቶራንቶች', 'ቦሌ አቅራቢያ ካፌዎች', 'የዋጋ ፓኬጆች (Pricing)']
        : ['Best restaurants in Addis Ababa', 'Hotels in Bahir Dar', '24/7 Pharmacies near Bole', 'Show pricing packages'],
    }
  }

  if (intent.intentType === 'pricing') {
    return {
      reply: isAm
        ? '💰 **የHelloET የንግድ ፓኬጆች (0% ኮሚሽን):**\n\n• **Free (ETB 0/ወር):** መሰረታዊ ማውጫ፣ 5 ፎቶዎች፣ የደንበኛ ግምገማዎች እና ቀጥታ ስልክ\n• **Basic (ETB 499/ወር):** 20 ፎቶዎች፣ በፍለጋ ቅድሚያ እና ትንታኔ (Analytics)\n• **Premium (ETB 999/ወር - ተወዳጅ):** ያልተገደበ ፎቶ፣ **Verified Badge**፣ ቀዳሚ ደረጃ እና የደንበኛ መልዕክት\n• **Enterprise (ETB 2,499/ወር):** ለብዙ ቅርንጫፎች እና API\n\n👉 ሁሉንም ዝርዝሮች በ /pricing ይመልከቱ።'
        : '💰 **HelloET Business Packages (0% Commission):**\n\n• **Free (ETB 0/mo):** Standard listing, 5 photos, reviews, business hours & direct phone\n• **Basic (ETB 499/mo):** 20 photos, featured search placement & analytics\n• **Premium (ETB 999/mo — Most Popular):** Unlimited photos, **Official Verified Badge**, top city rankings & direct messaging\n• **Enterprise (ETB 2,499/mo):** Multi-branch management, API & dedicated account manager\n\nPayments accepted via **Telebirr**, **CBE Birr**, and bank transfer. View full details on /pricing',
      quickActions: ['How to list my business?', 'Best restaurants in Addis Ababa', 'Contact Devvoltz team'],
    }
  }

  if (intent.intentType === 'list_business') {
    return {
      reply: isAm
        ? '🏪 **ንግድዎን በHelloET ላይ በነፃ መመዝገብ ይችላሉ!**\n\n1. በ /auth/register አካውንት ይክፈቱ\n2. ወደ /dashboard/listings/new በመሄድ የንግድዎን ስም፣ ስልክ፣ አድራሻ እና ፎቶ ያስገቡ\n3. ቡድናችን ካረጋገጠ በኋላ ደንበኞች በቀጥታ ይደውሉልዎታል (0% ኮሚሽን)!\n\nእርዳታ ከፈለጉ በ 0940192676 ይደውሉ።'
        : '🏪 **Listing or claiming your business on HelloET is fast and free!**\n\n1. Create an account at /auth/register\n2. Add your business details, GPS location, photos & direct phone number at /dashboard/listings/new\n3. Once verified, customers can call and navigate directly to you with **0% middleman commission**.\n\nNeed onboarding help? Call Devvoltz Technology PLC at **0940192676**.',
      quickActions: ['Show pricing packages', 'Browse businesses', 'What is the Verified Badge?'],
    }
  }

  if (intent.intentType === 'help') {
    return {
      reply: isAm
        ? 'ℹ️ **HelloET** በ Devvoltz Technology PLC የተሰራ የኢትዮጵያ #1 የንግድ ማውጫ ነው። ደንበኞች በ 80+ ከተሞች ውስጥ ያሉ የተረጋገጡ ንግዶችን በቀጥታ ስልክ እና GPS ካርታ እንዲያገኙ ይረዳል።\n\n📞 ስልክ: 0940192676\n✉️ ኢሜይል: devvoltztech@gmail.com'
        : 'ℹ️ **HelloET** is Ethiopia\'s trusted local business discovery platform built by **Devvoltz Technology PLC**. We connect locals and tourists directly to verified businesses across 80+ Ethiopian cities with **0% booking fees**.\n\n📞 Support: 0940192676\n✉️ Email: devvoltztech@gmail.com',
      quickActions: ['Best restaurants in Addis Ababa', 'Show pricing packages', 'How to list my business?'],
    }
  }

  // If user is on a business detail page and asks about it
  if (context.viewingBusiness && context.businesses.length === 0) {
    const vb = context.viewingBusiness
    return {
      reply: isAm
        ? `📍 ስለ **${vb.name}** (${vb.category} - ${vb.city}):\n${vb.phone ? `📞 ስልክ: ${vb.phone}\n` : ''}${vb.address ? `🗺️ አድራሻ: ${vb.address}\n` : ''}${vb.todayHours ? `🕒 የዛሬ ሰዓት: ${vb.todayHours}` : ''}`
        : `📍 Here are the details for **${vb.name}** (${vb.category} in ${vb.city}):\n${vb.phone ? `📞 Direct Phone: **${vb.phone}**\n` : ''}${vb.address ? `🗺️ Address: ${vb.address}\n` : ''}${vb.todayHours ? `🕒 Today's Hours: ${vb.todayHours}` : ''}`,
      quickActions: [`More ${vb.category} in ${vb.city}`, 'Browse all businesses'],
    }
  }

  // Business Search Results
  if (context.businesses.length > 0) {
    const locationText = intent.subcityHint
      ? `${intent.subcityHint}, ${intent.cityHint || 'Ethiopia'}`
      : intent.cityHint || 'Ethiopia'
    const catText = intent.categoryHints.length > 0 ? intent.categoryHints.join(' / ') : 'businesses'

    const summaryLines = context.businesses
      .slice(0, 4)
      .map((b, i) => {
        const ratingPart = b.rating > 0 ? ` ⭐ ${b.rating}` : ''
        const subPart = b.subcity ? `, ${b.subcity}` : ''
        return `${i + 1}. **${b.name}** (${b.category} · ${b.city}${subPart})${ratingPart}`
      })
      .join('\n')

    return {
      reply: isAm
        ? `✅ በ **${locationText}** ውስጥ የሚገኙ የተረጋገጡ ውጤቶች እነሆ፦\n\n${summaryLines}\n\nከታች ባሉት ካርዶች በቀጥታ መደወል ወይም አቅጣጫ ማየት ይችላሉ።`
        : `✅ Here are the top verified **${catText}** found in **${locationText}**:\n\n${summaryLines}\n\nTap any card below to view details, call directly, or get Google Maps directions.`,
      quickActions: isAm
        ? ['ተጨማሪ ንግዶችን ይመልከቱ', 'የዋጋ ፓኬጆች']
        : ['Browse all businesses', 'How to list my business?'],
    }
  }

  // Zero results fallback
  return {
    reply: isAm
      ? `ይቅርታ፣ ለጥያቄዎ የተለየ የተረጋገጠ ንግድ አልተገኘም። ሆኖም በ /businesses ገጽ ላይ በከተማ እና በምድብ (${context.categories.slice(0, 5).join('፣ ')}) መፈለግ ይችላሉ።`
      : `I couldn't find an exact verified match for that query in our database yet. You can browse all verified listings across **${context.cities.slice(0, 6).join(', ')}** at /businesses — or try searching by city or category like **Restaurants in Addis Ababa** or **Hotels in Bahir Dar**.`,
    quickActions: ['Best restaurants in Addis Ababa', 'Hotels in Bahir Dar', 'Browse all businesses'],
  }
}
