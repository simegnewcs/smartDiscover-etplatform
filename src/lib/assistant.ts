import { prisma } from '@/lib/prisma'
import { getMapDirectionsUrl } from '@/lib/maps'

export interface BusinessReviewSnippet {
  author: string
  rating: number
  comment: string
}

export interface AssistantBusinessCard {
  id: string
  slug: string
  name: string
  description: string | null
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
  isOpenNow: boolean | null
  features: string[]
  featureLabels: string[]
  topReviews: BusinessReviewSnippet[]
  weeklyHours: Array<{ day: string; hours: string }>
}

export type AssistantTopic =
  | 'greeting'
  | 'thanks'
  | 'search'
  | 'open_now'
  | 'hours'
  | 'reviews'
  | 'amenities'
  | 'categories_list'
  | 'cities_list'
  | 'pricing'
  | 'payments'
  | 'list_business'
  | 'claim_business'
  | 'verified_badge'
  | 'compare_competitors'
  | 'mobile_app'
  | 'account_features'
  | 'about_contact'
  | 'ethiopia_guide'
  | 'business_detail'

export interface AssistantIntent {
  language: 'en' | 'am'
  intentType: 'search' | 'pricing' | 'list_business' | 'help' | 'greeting' | 'general'
  matchedTopics: AssistantTopic[]
  keywords: string[]
  categoryHints: string[]
  featureHints: string[]
  cityHint: string | null
  subcityHint: string | null
  viewingSlug: string | null
  wantsOpenNow: boolean
  wantsTopRated: boolean
  referencedOrdinal: number | null
}

export interface HistoryTurn {
  role: string
  text: string
}

export const FEATURE_LABELS: Record<string, string> = {
  wifi: 'Free WiFi',
  parking: 'Parking Available',
  delivery: 'Delivery Service',
  cardPayment: 'Card Payment',
  takeaway: 'Takeaway',
  wheelchair: 'Wheelchair Accessible',
  familyFriendly: 'Family Friendly',
  liveMusic: 'Live Music',
  tv: 'TV Available',
  outdoorSeating: 'Outdoor Seating',
  coffeeShop: 'Coffee Shop',
  gym: 'Gym/Fitness',
  airportShuttle: 'Airport Shuttle',
  library: 'Library/Reading Area',
  security247: '24/7 Security',
}

const FEATURE_SYNONYMS: Array<{ terms: string[]; featureId: string }> = [
  { terms: ['wifi', 'wi-fi', 'internet', 'ዋይፋይ', 'ኢንተርኔት'], featureId: 'wifi' },
  { terms: ['parking', 'park car', 'garage', 'ፓርኪንግ', 'መኪና ማቆሚያ'], featureId: 'parking' },
  { terms: ['delivery', 'deliver', 'ዴሊቨሪ', 'ማድረስ'], featureId: 'delivery' },
  { terms: ['card', 'visa', 'mastercard', 'pos', 'atm', 'ካርድ'], featureId: 'cardPayment' },
  { terms: ['takeaway', 'take away', 'takeout', 'to go'], featureId: 'takeaway' },
  { terms: ['wheelchair', 'accessible', 'disability'], featureId: 'wheelchair' },
  { terms: ['family', 'kids', 'children', 'playground', 'ቤተሰብ'], featureId: 'familyFriendly' },
  { terms: ['live music', 'music', 'band', 'azmari', 'ሙዚቃ'], featureId: 'liveMusic' },
  { terms: ['tv', 'football', 'match', 'screen'], featureId: 'tv' },
  { terms: ['outdoor', 'garden', 'terrace', 'patio', 'rooftop', 'veranda'], featureId: 'outdoorSeating' },
  { terms: ['coffee shop', 'espresso', 'bunna'], featureId: 'coffeeShop' },
  { terms: ['gym', 'fitness', 'workout', 'pool', 'spa', 'ጂም'], featureId: 'gym' },
  { terms: ['shuttle', 'airport', 'pickup', 'transfer'], featureId: 'airportShuttle' },
  { terms: ['library', 'reading', 'study', 'quiet', 'coworking', 'work'], featureId: 'library' },
  { terms: ['24/7', '24 hours', '24 hour', 'security', 'all night', 'guard', '24 ሰዓት'], featureId: 'security247' },
]

const STOP_WORDS = new Set([
  'in', 'me', 'to', 'on', 'at', 'by', 'of', 'or', 'is', 'it', 'my', 'we', 'do', 'go', 'no', 'so', 'up', 'us', 'an', 'as',
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one',
  'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see',
  'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'what',
  'where', 'when', 'which', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'will',
  'would', 'there', 'their', 'about', 'best', 'good', 'great', 'nice', 'top', 'near', 'nearest',
  'find', 'show', 'give', 'list', 'looking', 'want', 'need', 'please', 'hello', 'here', 'around',
  'some', 'any', 'ethiopia', 'place', 'places', 'spot', 'spots', 'business', 'businesses',
  'open', 'now', 'today', 'very', 'much', 'more', 'most', 'tell', 'know', 'help', 'could', 'does', 'ones', 'them', 'those', 'also', 'plus',
  'ምርጥ', 'አቅራቢያ', 'ያለ', 'ውስጥ', 'እባክዎ', 'ፈልግ', 'አሳየኝ', 'የት', 'ነው', 'ናቸው', 'ኢትዮጵያ', 'ቦታ', 'ቦታዎች', 'እና', 'ስለ', 'ምንድን'
])

const CATEGORY_SYNONYMS: Array<{ terms: string[]; category: string }> = [
  { terms: ['restaurant', 'restaurants', 'food', 'eat', 'dining', 'dinner', 'lunch', 'breakfast', 'injera', 'kitfo', 'tibs', 'beyaynetu', 'pizza', 'burger', 'shiro', 'ሬስቶራንት', 'ሬስቶራንቶ', 'ምግብ'], category: 'Restaurant' },
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
  { terms: ['saris', 'sarise', 'ሳሪስ'], subcity: 'Saris' },
  { terms: ['megenagna', 'መገናኛ'], subcity: 'Megenagna' },
]

/**
 * Returns current date/time in Ethiopia (Africa/Addis_Ababa, UTC+3).
 */
export function getEthiopiaNow(): Date {
  try {
    const str = new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })
    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) return parsed
  } catch {
    // Fallback to UTC+3 offset
  }
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000
  return new Date(utc + 3 * 3600000)
}

function getTodayDayOfWeek(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[getEthiopiaNow().getDay()]
}

function parseTimeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null
  const clean = timeStr.trim().toUpperCase()
  if (clean === '24:00' || clean === '00:00' || clean.includes('24 HOURS') || clean.includes('24/7')) {
    return -1 // Special marker for 24h
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3]
  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function computeIsOpenNow(todayHour: any): boolean | null {
  if (!todayHour) return null
  if (todayHour.isClosed) return false
  const openMins = parseTimeToMinutes(todayHour.openTime)
  const closeMins = parseTimeToMinutes(todayHour.closeTime)
  if (openMins === -1 || closeMins === -1) return true
  if (openMins === null || closeMins === null) return null

  const nowET = getEthiopiaNow()
  const nowMins = nowET.getHours() * 60 + nowET.getMinutes()

  if (closeMins >= openMins) {
    return nowMins >= openMins && nowMins <= closeMins
  }
  // Overnight wrap (e.g. 18:00 - 02:00)
  return nowMins >= openMins || nowMins <= closeMins
}

function parseFeatures(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string')
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

function unslugify(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

function matchesTerm(lowerText: string, term: string): boolean {
  if (/[\u1200-\u137F]/.test(term)) {
    return lowerText.includes(term)
  }
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i')
  return regex.test(lowerText)
}

function detectCityAndCategoryFromText(lower: string): {
  city: string | null
  subcity: string | null
  categories: string[]
} {
  let city: string | null = null
  for (const entry of CITY_SYNONYMS) {
    if (entry.terms.some((t) => matchesTerm(lower, t))) {
      city = entry.city
      break
    }
  }

  let subcity: string | null = null
  for (const entry of SUBCITY_SYNONYMS) {
    if (entry.terms.some((t) => matchesTerm(lower, t))) {
      subcity = entry.subcity
      if (!city) city = 'Addis Ababa'
      break
    }
  }

  const categories: string[] = []
  for (const entry of CATEGORY_SYNONYMS) {
    if (entry.terms.some((t) => matchesTerm(lower, t))) {
      if (!categories.includes(entry.category)) {
        categories.push(entry.category)
      }
    }
  }

  return { city, subcity, categories }
}

/**
 * Parses current query + conversation history + active page path into multi-topic
 * structured search intent, amenities, language, and follow-up carry-over.
 */
export function analyzeQuery(
  message: string,
  currentPath?: string | null,
  history: HistoryTurn[] = []
): AssistantIntent {
  const isAmharic = /[\u1200-\u137F]/.test(message)
  const lower = message.toLowerCase().trim()

  // Extract page context from pathname
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

  const matchedTopics: AssistantTopic[] = []

  // Greeting / Thanks
  if (/^(hi|hello|hey|selam|selamta|good morning|good afternoon|good evening|ሰላም|ታዲያስ|እንደምን|እንዴት)[\s!?.]*$/i.test(lower)) {
    matchedTopics.push('greeting')
  }
  if (/(thank you|thanks|thx|appreciate|አመሰግናለሁ|እናመሰግናለን)/i.test(lower)) {
    matchedTopics.push('thanks')
  }

  // Multi-topic platform & detailed FAQ detection
  if (/\b(pricing|price|package|packages|plan|plans|subscription|cost|etb|birr|how much|basic|premium|enterprise)\b|ዋጋ|ፓኬጅ/i.test(lower)) {
    matchedTopics.push('pricing')
  }
  if (/\b(pay|payment|payments|telebirr|cbe birr|cbe|awash|bank|invoice|forex|usd|currency|tele birr)\b|ክፍያ|ቴሌብር/i.test(lower)) {
    matchedTopics.push('payments')
  }
  if (/\b(add business|add my business|list my business|register business|register my|create listing|submit business|how to list)\b|ንግድ መመዝገብ|ቢዝነስ መመዝገብ/i.test(lower)) {
    matchedTopics.push('list_business')
  }
  if (/\b(claim|verify my business|ownership|business dashboard|analytics|manage listing|owner)\b|ባለቤትነት/i.test(lower)) {
    matchedTopics.push('claim_business')
  }
  if (/\b(verified badge|verification|how do you verify|is it trusted|legit|fake|trust|badge)\b|የተረጋገጠ/i.test(lower)) {
    matchedTopics.push('verified_badge')
  }
  if (/\b(booking\.com|tripadvisor|google maps|better than|competitor|middleman|commission|zero fee)\b|0%|ለምን helloet/i.test(lower)) {
    matchedTopics.push('compare_competitors')
  }
  if (/\b(mobile app|app|apk|pwa|android|iphone|ios|install|offline|download)\b|አፕ/i.test(lower)) {
    matchedTopics.push('mobile_app')
  }
  if (/\b(save|saved|bookmark|favorite|write review|leave a review|notification|sign up|create account|account)\b|አካውንት/i.test(lower)) {
    matchedTopics.push('account_features')
  }
  if (/\b(devvoltz|who built|who made|about helloet|contact|support|email|phone number of helloet|privacy|terms)\b|እርዳታ|ስለ helloet/i.test(lower)) {
    matchedTopics.push('about_contact')
  }
  if (/\b(what categories|list categories|which categories|all categories|types of business)\b|ምድቦች/i.test(lower)) {
    matchedTopics.push('categories_list')
  }
  if (/\b(what cities|which cities|cities covered|where does helloet work|coverage|regions)\b|ከተሞች/i.test(lower)) {
    matchedTopics.push('cities_list')
  }
  if (/\b(bunna bet|coffee ceremony|injera|kitfo|cultural|traditional|visit ethiopia|travel tip|things to do)\b|ቡና ቤት|ባህላዊ/i.test(lower)) {
    matchedTopics.push('ethiopia_guide')
  }

  const wantsOpenNow = /\b(open now|currently open|open right now|open today|late night|24 hour)\b|24\/7|ክፍት ነው|አሁን ክፍት/i.test(lower)
  const wantsTopRated = /\b(top rated|highest rated|best reviewed|best rating|5 star|popular|top 10)\b|ምርጥ ደረጃ/i.test(lower)

  if (wantsOpenNow || /\b(hours|opening time|closing time|when do they open|when does it close|schedule)\b|ሰዓት/i.test(lower)) {
    matchedTopics.push(wantsOpenNow ? 'open_now' : 'hours')
  }
  if (/\b(review|reviews|rating|ratings|what do people say|feedback|comment)\b|ግምገማ/i.test(lower)) {
    matchedTopics.push('reviews')
  }

  // Extract amenities/features
  const featureHints: string[] = []
  for (const f of FEATURE_SYNONYMS) {
    if (f.terms.some((t) => matchesTerm(lower, t))) {
      if (!featureHints.includes(f.featureId)) {
        featureHints.push(f.featureId)
      }
    }
  }
  if (featureHints.length > 0) {
    matchedTopics.push('amenities')
  }

  // Ordinal reference like "first one", "#2", "number 1"
  let referencedOrdinal: number | null = null
  const ordMatch = lower.match(/(?:#|number\s*)([1-5])\b|\b(first|second|third|fourth)\b/i)
  if (ordMatch) {
    const mapWord: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 }
    referencedOrdinal = ordMatch[1] ? parseInt(ordMatch[1], 10) : mapWord[ordMatch[2]] || null
  }

  // Extract city, subcity, category from current message
  const detected = detectCityAndCategoryFromText(lower)
  let cityHint = detected.city
  let subcityHint = detected.subcity
  let categoryHints = detected.categories

  if (!cityHint && pathCity && /(here|near me|around|this city|local|አቅራቢያ)/i.test(lower)) {
    cityHint = pathCity
  }
  if (categoryHints.length === 0 && pathCategory && /(here|this|near|place|best|top|recommended)/i.test(lower)) {
    const pathDetected = detectCityAndCategoryFromText(pathCategory.toLowerCase())
    categoryHints = pathDetected.categories
  }

  // Conversation follow-up carry-over from recent history
  const looksLikeFollowUp =
    /(there|that city|that area|which one|any with|what about|how about|and the|more like|do they|does it|their|those|them|open now|with wifi|with parking|number \d|first|second)/i.test(
      lower
    ) ||
    (featureHints.length > 0 && categoryHints.length === 0 && !cityHint)

  if (looksLikeFollowUp && history.length > 0) {
    const recentTurns = [...history].reverse().slice(0, 4)
    for (const turn of recentTurns) {
      const prevDetected = detectCityAndCategoryFromText(turn.text.toLowerCase())
      if (!cityHint && prevDetected.city) cityHint = prevDetected.city
      if (!subcityHint && prevDetected.subcity) subcityHint = prevDetected.subcity
      if (categoryHints.length === 0 && prevDetected.categories.length > 0) {
        categoryHints = prevDetected.categories
      }
      if (cityHint && categoryHints.length > 0) break
    }
  }

  // Check if user is asking specifically about the viewing business page
  if (viewingSlug && /(this place|this business|this hotel|this restaurant|they|their|it open|phone|address|hours|features|wifi)/i.test(lower)) {
    matchedTopics.push('business_detail')
  }

  // Clean meaningful keywords
  const cleaned = lower.replace(/[?!.,;:'"()\[\]{}\/\\]/g, ' ')
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))

  const hasSearchSignals =
    categoryHints.length > 0 ||
    cityHint !== null ||
    subcityHint !== null ||
    featureHints.length > 0 ||
    wantsOpenNow ||
    wantsTopRated ||
    (tokens.length > 0 &&
      !matchedTopics.some((t) =>
        ['greeting', 'thanks', 'pricing', 'payments', 'list_business', 'claim_business', 'verified_badge', 'compare_competitors', 'mobile_app', 'account_features', 'about_contact', 'categories_list', 'cities_list'].includes(t)
      ))

  if (hasSearchSignals && !matchedTopics.includes('search')) {
    matchedTopics.push('search')
  }

  // Primary intentType for backward compatibility
  let intentType: AssistantIntent['intentType'] = 'general'
  if (matchedTopics.includes('greeting') && matchedTopics.length === 1) {
    intentType = 'greeting'
  } else if (matchedTopics.includes('pricing') || matchedTopics.includes('payments')) {
    intentType = 'pricing'
  } else if (matchedTopics.includes('list_business') || matchedTopics.includes('claim_business')) {
    intentType = 'list_business'
  } else if (matchedTopics.includes('about_contact') || matchedTopics.includes('mobile_app') || matchedTopics.includes('compare_competitors')) {
    intentType = 'help'
  } else if (matchedTopics.includes('search')) {
    intentType = 'search'
  }

  return {
    language: isAmharic ? 'am' : 'en',
    intentType,
    matchedTopics,
    keywords: Array.from(new Set(tokens)).slice(0, 6),
    categoryHints,
    featureHints,
    cityHint,
    subcityHint,
    viewingSlug,
    wantsOpenNow,
    wantsTopRated,
    referencedOrdinal,
  }
}

/**
 * Queries live verified businesses, categories with counts, cities with counts,
 * opening hours, features, and customer reviews from MySQL via Prisma.
 */
export async function retrieveBusinessesAndContext(intent: AssistantIntent): Promise<{
  businesses: AssistantBusinessCard[]
  viewingBusiness: AssistantBusinessCard | null
  categories: Array<{ name: string; count: number }>
  cities: Array<{ name: string; count: number }>
  totalVerifiedCount: number
}> {
  const todayDay = getTodayDayOfWeek()

  const [categoriesRaw, citiesRaw, totalVerifiedCount] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { businesses: { where: { verified: true } } } } },
      orderBy: { name: 'asc' },
      take: 25,
    }),
    prisma.city.findMany({
      include: { _count: { select: { businesses: { where: { verified: true } } } } },
      orderBy: { name: 'asc' },
      take: 35,
    }),
    prisma.business.count({ where: { verified: true } }),
  ])

  const categories = categoriesRaw.map((c) => ({
    name: c.name,
    count: c._count.businesses,
  }))
  const cities = citiesRaw.map((c) => ({
    name: c.name,
    count: c._count.businesses,
  }))

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
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
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

  const shouldSearchBusinesses =
    intent.matchedTopics.includes('search') ||
    intent.categoryHints.length > 0 ||
    intent.cityHint !== null ||
    intent.subcityHint !== null ||
    intent.featureHints.length > 0 ||
    intent.wantsOpenNow ||
    intent.wantsTopRated

  if (!shouldSearchBusinesses) {
    return { businesses: [], viewingBusiness, categories, cities, totalVerifiedCount }
  }

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
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 2,
      },
      _count: { select: { reviews: true } },
    },
    take: 40,
    orderBy: [{ createdAt: 'desc' }],
  })

  if (candidates.length === 0) {
    return { businesses: [], viewingBusiness, categories, cities, totalVerifiedCount }
  }

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

  const scored = candidates.map((b) => {
    let score = 0
    const bName = b.name.toLowerCase()
    const bDesc = (b.description || '').toLowerCase()
    const bCat = b.category.name.toLowerCase()
    const bCity = b.city.name.toLowerCase()
    const bSub = (b.subcity?.name || '').toLowerCase()
    const bAddr = (b.address || '').toLowerCase()
    const bFeatures = parseFeatures(b.features)

    if (intent.cityHint && bCity.includes(intent.cityHint.toLowerCase())) score += 10
    if (intent.subcityHint && (bSub.includes(intent.subcityHint.toLowerCase()) || bAddr.includes(intent.subcityHint.toLowerCase()))) score += 9
    for (const cat of intent.categoryHints) {
      if (bCat.includes(cat.toLowerCase())) score += 10
    }
    for (const feat of intent.featureHints) {
      if (bFeatures.includes(feat)) score += 7
    }
    for (const kw of intent.keywords) {
      if (bName.includes(kw)) score += 6
      if (bCat.includes(kw)) score += 4
      if (bCity.includes(kw) || bSub.includes(kw)) score += 3
      if (bDesc.includes(kw) || bAddr.includes(kw)) score += 2
    }

    const avgRating = ratingMap[b.id.toString()] || 0
    score += avgRating * (intent.wantsTopRated ? 2.5 : 0.6)
    score += Math.min(b._count.reviews, 10) * 0.25

    const todayHour = b.hours.find((h) => h.day === todayDay)
    const card = formatBusinessCard(b, avgRating, todayHour)
    if (intent.wantsOpenNow && card.isOpenNow === true) {
      score += 8
    }

    return { score, card }
  })

  scored.sort((a, b) => b.score - a.score)

  let filtered = scored
  if (intent.cityHint && intent.categoryHints.length > 0) {
    const strictMatches = scored.filter(
      (s) =>
        s.card.city.toLowerCase().includes(intent.cityHint!.toLowerCase()) &&
        intent.categoryHints.some((cat) => s.card.category.toLowerCase().includes(cat.toLowerCase()))
    )
    if (strictMatches.length > 0) filtered = strictMatches
  }

  if (intent.featureHints.length > 0) {
    const featureMatches = filtered.filter((s) =>
      intent.featureHints.every((f) => s.card.features.includes(f))
    )
    if (featureMatches.length > 0) filtered = featureMatches
  }

  if (intent.wantsOpenNow) {
    const openMatches = filtered.filter((s) => s.card.isOpenNow === true)
    if (openMatches.length > 0) filtered = openMatches
  }

  return {
    businesses: filtered.slice(0, 5).map((s) => s.card),
    viewingBusiness,
    categories,
    cities,
    totalVerifiedCount,
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

  const featureIds = parseFeatures(b.features)
  const featureLabels = featureIds.map((id) => FEATURE_LABELS[id] || id)

  const topReviews: BusinessReviewSnippet[] = Array.isArray(b.reviews)
    ? b.reviews.slice(0, 2).map((r: any) => ({
        author: r.user?.name || 'Customer',
        rating: r.rating,
        comment: r.comment || '',
      }))
    : []

  const weeklyHours = Array.isArray(b.hours)
    ? b.hours.map((h: any) => ({
        day: h.day,
        hours: h.isClosed ? 'Closed' : h.openTime && h.closeTime ? `${h.openTime} - ${h.closeTime}` : 'Open',
      }))
    : []

  return {
    id: b.id.toString(),
    slug: b.slug,
    name: b.name,
    description: b.description || null,
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
    isOpenNow: computeIsOpenNow(todayHour),
    features: featureIds,
    featureLabels,
    topReviews,
    weeklyHours,
  }
}

/**
 * Generates rich, detailed multi-topic answers directly from live MySQL/Prisma context
 * and HelloET platform knowledge—handling compound questions smoothly without an external LLM.
 */
export function generateSmartFallbackReply(
  intent: AssistantIntent,
  context: {
    businesses: AssistantBusinessCard[]
    viewingBusiness: AssistantBusinessCard | null
    categories: Array<{ name: string; count: number }>
    cities: Array<{ name: string; count: number }>
    totalVerifiedCount: number
  }
): { reply: string; quickActions: string[] } {
  const isAm = intent.language === 'am'
  const topics = new Set(intent.matchedTopics)
  const sections: string[] = []
  const suggestedFollowUps: string[] = []

  // 1. Greeting / Thanks
  if (topics.has('greeting') && topics.size === 1) {
    return {
      reply: isAm
        ? `ሰላም! 👋 እንኳን ወደ **HelloET Assistant** በደህና መጡ። በመላው ኢትዮጵያ (${context.totalVerifiedCount > 0 ? `${context.totalVerifiedCount}+ የተረጋገጡ ንግዶች` : '80+ ከተሞች'}) ውስጥ ሬስቶራንቶችን፣ ሆቴሎችን፣ ካፌዎችን፣ ፋርማሲዎችን እና አገልግሎቶችን እንዲያገኙ እረዳዎታለሁ። ምን ልርዳዎት?`
        : `Selam! 👋 Welcome to **HelloET Assistant**. I can help you find verified restaurants, hotels, traditional coffee houses, 24/7 pharmacies, check opening hours & amenities, compare pricing plans, or register your business across Ethiopia. What can I help you with today?`,
      quickActions: isAm
        ? ['አዲስ አበባ ምርጥ ሬስቶራንቶች', 'ቦሌ አቅራቢያ ዋይፋይ ያላቸው ካፌዎች', 'የዋጋ ፓኬጆች (Pricing)', 'ንግዴን እንዴት ልመዝግብ?']
        : ['Best restaurants in Addis Ababa', 'Cafes in Bole with WiFi', 'Show pricing packages', 'How to list my business?'],
    }
  }

  if (topics.has('thanks') && topics.size === 1) {
    return {
      reply: isAm
        ? 'በጣም አመሰግናለሁ! 😊 ሌላ የሚፈልጉት ነገር ካለ በማንኛውም ጊዜ ይጠይቁኝ።'
        : 'You\'re very welcome! 😊 Let me know anytime if you need directions, phone numbers, reviews, or recommendations anywhere in Ethiopia.',
      quickActions: ['Best restaurants in Addis Ababa', 'Hotels in Bahir Dar', 'Browse all businesses'],
    }
  }

  // 2. Currently viewed business details
  if (topics.has('business_detail') && context.viewingBusiness) {
    const vb = context.viewingBusiness
    const feats = vb.featureLabels.length > 0 ? `\n✨ **Amenities:** ${vb.featureLabels.join(', ')}` : ''
    const hours = vb.weeklyHours.length > 0
      ? `\n🕒 **Weekly Schedule:**\n${vb.weeklyHours.slice(0, 5).map((h) => `• ${h.day.slice(0, 3)}: ${h.hours}`).join('\n')}`
      : vb.todayHours
      ? `\n🕒 **Today:** ${vb.todayHours}`
      : ''
    const rev = vb.topReviews.length > 0
      ? `\n💬 **Recent Review:** "${vb.topReviews[0].comment.slice(0, 140)}..." — *${vb.topReviews[0].author}* (${vb.topReviews[0].rating}⭐)`
      : ''

    sections.push(
      isAm
        ? `📍 **${vb.name}** (${vb.category} · ${vb.city})\n${vb.phone ? `📞 ስልክ: **${vb.phone}**\n` : ''}${vb.address ? `🗺️ አድራሻ: ${vb.address}\n` : ''}${vb.todayHours ? `🕒 የዛሬ ሰዓት: ${vb.todayHours}` : ''}`
        : `📍 **${vb.name}** (${vb.category} · ${vb.city}${vb.subcity ? `, ${vb.subcity}` : ''})${vb.rating > 0 ? ` — ⭐ **${vb.rating}/5** (${vb.reviewCount} reviews)` : ''}\n${vb.description ? `${vb.description}\n` : ''}${vb.phone ? `📞 **Phone:** ${vb.phone}\n` : ''}${vb.address ? `🗺️ **Address:** ${vb.address}` : ''}${feats}${hours}${rev}`
    )
    suggestedFollowUps.push(`More ${vb.category} in ${vb.city}`, 'Browse all businesses')
  }

  // 3. Live Business Search Results (with Hours, Amenities & Reviews!)
  if (context.businesses.length > 0) {
    const locationLabel = intent.subcityHint
      ? `${intent.subcityHint}, ${intent.cityHint || 'Ethiopia'}`
      : intent.cityHint || 'Ethiopia'
    const catLabel = intent.categoryHints.length > 0 ? intent.categoryHints.join(' / ') : 'businesses'
    const featureNote = intent.featureHints.length > 0
      ? ` featuring **${intent.featureHints.map((f) => FEATURE_LABELS[f] || f).join(', ')}**`
      : ''

    const listText = context.businesses
      .slice(0, 4)
      .map((b, i) => {
        const sub = b.subcity ? `, ${b.subcity}` : ''
        const ratingPart = b.rating > 0 ? ` · ⭐ ${b.rating} (${b.reviewCount})` : ''
        const openBadge = b.isOpenNow === true ? ' · 🟢 Open now' : b.isOpenNow === false ? ' · 🔴 Closed now' : ''
        const feats = b.featureLabels.length > 0 ? `\n   ✨ *Amenities:* ${b.featureLabels.slice(0, 4).join(', ')}` : ''
        const revSnippet = (topics.has('reviews') || intent.wantsTopRated) && b.topReviews.length > 0
          ? `\n   💬 *"${b.topReviews[0].comment.slice(0, 110)}${b.topReviews[0].comment.length > 110 ? '...' : ''}"* — ${b.topReviews[0].author}`
          : ''
        const phoneLine = b.phone ? ` · 📞 ${b.phone}` : ''
        return `${i + 1}. **${b.name}** (${b.category} · ${b.city}${sub})${ratingPart}${openBadge}${phoneLine}${feats}${revSnippet}`
      })
      .join('\n\n')

    sections.push(
      isAm
        ? `✅ በ **${locationLabel}** ውስጥ የተገኙ የተረጋገጡ ውጤቶች፦\n\n${listText}\n\nከታች ባሉት ካርዶች በቀጥታ መደወል ወይም GPS አቅጣጫ ማግኘት ይችላሉ።`
        : `✅ Here are top verified **${catLabel}** in **${locationLabel}**${featureNote}:\n\n${listText}\n\nUse the cards below to view full profiles, call directly, or launch Google Maps directions.`
    )

    if (context.businesses[0]) {
      suggestedFollowUps.push(
        `Which ${catLabel} in ${locationLabel} have WiFi?`,
        `More ${context.businesses[0].category} in ${context.businesses[0].city}`
      )
    }
  } else if (topics.has('search') && !topics.has('business_detail')) {
    const cityStr = context.cities.filter((c) => c.count > 0).slice(0, 5).map((c) => c.name).join(', ') || 'Addis Ababa, Bahir Dar, Hawassa'
    sections.push(
      isAm
        ? `🔍 ለጥያቄዎ የተወሰነ የተረጋገጠ ውጤት አልተገኘም። በ /businesses ላይ በከተሞች (${cityStr}) እና በምድቦች መፈለግ ይችላሉ።`
        : `🔍 I didn't find an exact verified listing matching all those filters right now. You can explore all listings across **${cityStr}** on /businesses, or try broadening your neighborhood or amenity filters.`
    )
    suggestedFollowUps.push('Browse all businesses', 'What categories are available?')
  }

  // 4. Categories Discovery
  if (topics.has('categories_list')) {
    const activeCats = context.categories.filter((c) => c.count > 0)
    const displayCats = activeCats.length > 0 ? activeCats : context.categories
    const catSummary = displayCats
      .slice(0, 12)
      .map((c) => `• **${c.name}**${c.count > 0 ? ` (${c.count} verified)` : ''}`)
      .join('\n')
    sections.push(
      isAm
        ? `📂 **በHelloET የሚገኙ ዋና ምድቦች:**\n${catSummary}\n\nሁሉንም በ /businesses ይመልከቱ።`
        : `📂 **Business Categories on HelloET:**\n${catSummary || 'Restaurants, Hotels, Cafés, Pharmacies, Supermarkets, Tourist Attractions, Healthcare, Education, Local Services'}\n\nExplore any category directly at /businesses`
    )
    suggestedFollowUps.push('Best restaurants in Addis Ababa', 'Hotels in Bahir Dar')
  }

  // 5. Cities Coverage
  if (topics.has('cities_list')) {
    const activeCities = context.cities.filter((c) => c.count > 0)
    const displayCities = activeCities.length > 0 ? activeCities : context.cities
    const citySummary = displayCities.slice(0, 15).map((c) => `${c.name}${c.count > 0 ? ` (${c.count})` : ''}`).join(', ')
    sections.push(
      isAm
        ? `🗺️ **HelloET በመላው ኢትዮጵያ 80+ ከተሞችን ይሸፍናል!**\nዋና ከተሞች: ${citySummary || 'አዲስ አበባ፣ ባህር ዳር፣ ሀዋሳ፣ ጎንደር፣ ድሬዳዋ፣ መቀሌ፣ አዳማ፣ ጅማ'}`
        : `🗺️ **HelloET covers 80+ Ethiopian cities & neighborhoods!**\nActive cities in our directory right now include: **${citySummary || 'Addis Ababa, Bahir Dar, Hawassa, Gondar, Lalibela, Dire Dawa, Mekelle, Adama, Jimma'}** — with Addis subcity precision across *Bole, Kazanchis, Piassa, Sarbet, Yeka, CMC, and Mekanisa*.`
    )
    suggestedFollowUps.push('Restaurants in Bole', 'Hotels in Hawassa')
  }

  // 6. Pricing Packages
  if (topics.has('pricing')) {
    sections.push(
      isAm
        ? `💰 **የHelloET የንግድ ፓኬጆች (0% ኮሚሽን):**\n• **Free (ETB 0/ወር):** መሰረታዊ ማውጫ፣ 5 ፎቶዎች፣ ግምገማዎች እና ቀጥታ ስልክ\n• **Basic (ETB 499/ወር ወይም ETB 4,790/ዓመት):** 20 ፎቶዎች፣ የፍለጋ ቅድሚያ እና Analytics\n• **Premium (ETB 999/ወር ወይም ETB 9,590/ዓመት):** ያልተገደበ ፎቶ፣ **Official Verified Badge**፣ ቀዳሚ ደረጃ እና ቀጥታ መልዕክት\n• **Enterprise (ETB 2,499/ወር):** ለብዙ ቅርንጫፎች እና API\n👉 ዝርዝሩን በ /pricing ይመልከቱ።`
        : `💰 **HelloET Business Packages (0% Commission · Save 20% Annually):**\n• **Free (ETB 0/mo):** Standard directory listing, 5 photos, verified reviews, business hours & direct phone\n• **Basic (ETB 499/mo · ETB 4,790/yr):** 20 photos, priority search placement & performance analytics\n• **Premium (ETB 999/mo · ETB 9,590/yr — Most Popular):** Unlimited photos & menu, **Official Green Verified Badge**, top city leaderboard ranking & direct messaging\n• **Enterprise (ETB 2,499/mo · ETB 23,990/yr):** Multi-branch management, banner spotlights, API access & dedicated VIP support\n👉 Compare all plans at /pricing`
    )
    suggestedFollowUps.push('How do I pay with Telebirr?', 'What is the Verified Badge?')
  }

  // 7. Payment Methods in Ethiopia
  if (topics.has('payments')) {
    sections.push(
      isAm
        ? `💳 **የክፍያ አማራጮች (በብር ብቻ - ETB):**\n• **Telebirr (ቴሌብር)**\n• **CBE Birr (ሲቢኢ ብር)**\n• **Commercial Bank of Ethiopia (CBE)** እና **Awash Bank**\nምንም የውጭ ምንዛሪ (USD/Visa) አያስፈልግም፣ እንዲሁም ከሽያጭ 0% ኮሚሽን ይከፈላል።`
        : `💳 **Local Ethiopian Payments (100% in ETB):**\n• **Telebirr**\n• **CBE Birr**\n• **Commercial Bank of Ethiopia (CBE)** & **Awash Bank** transfers\nNo international Visa/USD card is required, and HelloET charges **0% commission** on bookings or orders. Upgrade anytime in /dashboard/billing`
    )
  }

  // 8. Listing & Claiming Businesses
  if (topics.has('list_business') || topics.has('claim_business')) {
    sections.push(
      isAm
        ? `🏪 **ንግድዎን እንዴት መመዝገብ ወይም ማረጋገጥ ይችላሉ?**\n1. በ /auth/register ነፃ የንግድ ባለቤት አካውንት ይፍጠሩ\n2. ወደ /dashboard/listings/new በመሄድ ስም፣ ምድብ፣ ከተማ/ክፍለ ከተማ፣ ቀጥታ ስልክ፣ የስራ ሰዓት፣ ፎቶዎች እና የGoogle Maps አድራሻ ያስገቡ\n3. በ /dashboard ውስጥ እይታዎችን፣ የስልክ ጥሪዎችን፣ የካርታ አቅጣጫዎችን እና የደንበኛ ግምገማዎችን መከታተል ይችላሉ።\nእርዳታ ከፈለጉ: 📞 **0940192676**`
        : `🏪 **How to List, Claim & Manage Your Business:**\n1. Create a free account at /auth/register\n2. Submit your listing at /dashboard/listings/new with your category, subcity, direct phone, weekly hours, photos, amenities (WiFi, parking, delivery) & GPS map link\n3. Manage everything in /dashboard — track live analytics (views, calls, direction clicks), respond to customer reviews, and manage billing.\nNeed fast onboarding? Call Devvoltz Technology PLC at **0940192676**.`
    )
    suggestedFollowUps.push('Show pricing packages', 'What is the Verified Badge?')
  }

  // 9. Verified Badge
  if (topics.has('verified_badge')) {
    sections.push(
      isAm
        ? `✅ **Official Green Verified Badge:** የንግድዎን ህጋዊነት፣ ትክክለኛ ስልክ እና አድራሻ ቡድናችን ካረጋገጠ በኋላ የሚሰጥ የታማኝነት ምልክት ነው። የተረጋገጡ ንግዶች በፍለጋ ቀዳሚ ደረጃ እና እስከ 3x ተጨማሪ ጥሪ ያገኛሉ።`
        : `✅ **Official Green Verified Badge:** Awarded after our moderation team confirms your business identity, location, and direct telephone number. Verified businesses build instant customer trust, appear higher in search leaderboards, and receive significantly more direct calls.`
    )
  }

  // 10. Competitor Comparison
  if (topics.has('compare_competitors')) {
    sections.push(
      isAm
        ? `🌟 **ለምን HelloET ከ Booking.com ወይም TripAdvisor ይሻላል?**\n• **0% ኮሚሽን:** የውጭ ፕላትፎርሞች 15–25% ኮሚሽን ይቆርጣሉ፤ HelloET ግን ቀጥታ የንግድ ባለቤቱን ስልክ ይሰጣል\n• **ትክክለኛ የኢትዮጵያ አድራሻ:** የክፍለ ከተማ (ቦሌ፣ ፒያሳ፣ ካዛንቺስ) ካርታ እና ወቅታዊ ስልክ\n• **አማርኛ እና እንግሊዝኛ ድጋፍ + በኢትዮጵያ ብር (ETB) ክፍያ**`
        : `🌟 **Why HelloET beats Booking.com & TripAdvisor in Ethiopia:**\n• **0% Middleman Commission:** Foreign booking sites charge hotels 15–25% commission. HelloET gives you direct merchant telephone numbers so you negotiate local rates directly.\n• **Hyper-Local Subcity Accuracy:** Built for Ethiopian neighborhoods (*Bole, Kazanchis, Piassa, Sarbet, Yeka*) with verified GPS maps.\n• **Bilingual & Local Currency:** Full English/Amharic discovery with local ETB pricing and Telebirr/CBE Birr merchant plans.`
    )
  }

  // 11. Mobile App / PWA
  if (topics.has('mobile_app')) {
    sections.push(
      isAm
        ? `📱 **HelloET ሞባይል አፕ (PWA / APK):**\nHelloETን በቀጥታ ከብራውዘርዎ (Chrome/Safari) "Add to Home Screen" በማድረግ እንደ አፕ መጫን ወይም Android APK ማውረድ ይችላሉ። አነስተኛ ኢንተርኔት (low-bandwidth) ላይ በፍጥነት እንዲሰራ ተደርጎ የተገነባ ነው።`
        : `📱 **HelloET Mobile App (PWA & Android APK):**\nYou can install HelloET directly to your phone's home screen as a fast Progressive Web App (PWA) from Chrome/Safari ("Install App" / "Add to Home Screen") or download the Android APK from the top banner. It's lightweight and optimized for Ethiopian mobile networks.`
    )
  }

  // 12. User Account Features
  if (topics.has('account_features')) {
    sections.push(
      isAm
        ? `👤 **የተጠቃሚ አካውንት ጥቅሞች:**\nበነፃ አካውንት (/auth/register) ተወዳጅ ቦታዎችን በ /saved ማስቀመጥ፣ ግምገማዎችን መጻፍ (/my-reviews) እና አዳዲስ መልዕክቶችን በ /notifications መከታተል ይችላሉ።`
        : `👤 **User Account Features (Free):**\nCreate a free account at /auth/register to bookmark favorite spots in /saved, write 1–5 star verified reviews with photos, manage your reviews in /my-reviews, and receive updates in /notifications.`
    )
  }

  // 13. Cultural & Ethiopia Guide
  if (topics.has('ethiopia_guide') && context.businesses.length === 0) {
    sections.push(
      isAm
        ? `☕ **የኢትዮጵያ ልዩ ምክሮች:**\n• **ቡና ቤቶች:** ፒያሳ (Tomoca)፣ ቦሌ እና ካዛንቺስ ውስጥ ባህላዊ የቡና ሥነ-ሥርዓት ያላቸው ካፌዎችን ያገኛሉ\n• **ባህላዊ ምግብ:** እንጀራ፣ ክትፎ፣ ጥብስ እና በያይነቱ የሚያቀርቡ ምርጥ ሬስቶራንቶችን በ /businesses ይመልከቱ።`
        : `☕ **Ethiopian Local Discovery Tips:**\n• **Coffee Culture (Bunna Bet):** Try iconic spots like Tomoca in Piassa, specialty roasters in Bole, and traditional ceremony lounges.\n• **Ethiopian Dining:** Explore authentic *Injera, Kitfo, Tibs, and Beyaynetu* restaurants across Bole, Kazanchis, and Sarbet.\n• **Top Travel Cities:** Addis Ababa, Bahir Dar (Lake Tana), Gondar (Fasil Ghebbi), Lalibela, and Hawassa. Browse /businesses to see top-rated spots!`
    )
  }

  // 14. About & Contact Devvoltz
  if (topics.has('about_contact')) {
    sections.push(
      isAm
        ? `🏢 **ስለ HelloET እና Devvoltz Technology PLC:**\nHelloET በአዲስ አበባ በሚገኘው **Devvoltz Technology PLC** የተገነባ የኢትዮጵያ #1 የንግድ ማውጫ ነው።\n📞 ስልክ: **0940192676**\n✉️ ኢሜይል: **devvoltztech@gmail.com**\n🌐 ገጾች: /about · /contact · /help`
        : `🏢 **About HelloET & Devvoltz Technology PLC:**\nHelloET is built and maintained in Addis Ababa by **Devvoltz Technology PLC** to connect communities with trusted Ethiopian businesses.\n📞 Phone: **0940192676**\n✉️ Email: **devvoltztech@gmail.com**\n🔗 Helpful Pages: /about · /contact · /help · /privacy`
    )
  }

  if (sections.length === 0) {
    return {
      reply: isAm
        ? `ጥያቄዎን ለመመለስ ዝግጁ ነኝ! ስለ **ምግብ ቤቶች፣ ሆቴሎች፣ ካፌዎች፣ ፋርማሲዎች፣ የዋጋ ፓኬጆች (/pricing)፣ ወይም ንግድ ስለመመዝገብ** ይጠይቁኝ። ሁሉንም ንግዶች በ /businesses ማየት ይችላሉ።`
        : `I can help you with many things on **HelloET**! Try asking me:\n• *"Best restaurants in Addis Ababa with WiFi"*\n• *"24/7 pharmacies open now in Bole"*\n• *"Compare Basic vs Premium packages"*\n• *"How do I list or claim my business?"*\nOr browse all listings directly at /businesses`,
      quickActions: isAm
        ? ['አዲስ አበባ ምርጥ ሬስቶራንቶች', 'የዋጋ ፓኬጆች (Pricing)', 'ንግዴን እንዴት ልመዝግብ?']
        : ['Best restaurants in Addis Ababa', 'Show pricing packages', 'How to list my business?'],
    }
  }

  const uniqueFollowUps = Array.from(new Set(suggestedFollowUps)).slice(0, 3)
  return {
    reply: sections.join('\n\n'),
    quickActions: uniqueFollowUps.length > 0
      ? uniqueFollowUps
      : ['Best restaurants in Addis Ababa', 'Show pricing packages', 'Browse all businesses'],
  }
}
