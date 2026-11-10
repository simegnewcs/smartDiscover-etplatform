'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  MapPin,
  Star,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Minimize2,
  Building2,
  Clock,
  Copy,
  Check,
  Square,
} from 'lucide-react'
import type { AssistantBusinessCard } from '@/lib/assistant'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  businesses?: AssistantBusinessCard[]
  quickActions?: string[]
  mode?: string
  isStreaming?: boolean
}

const STORAGE_KEY = 'helloet_assistant_chat_v3'

const INTERNAL_ROUTE_REGEX =
  /(\/(?:businesses|business\/[a-zA-Z0-9_-]+|pricing|auth\/register|auth\/login|dashboard(?:\/[a-zA-Z0-9_/-]+)?|about|contact|help|privacy|terms|city\/[a-zA-Z0-9_/-]+|category\/[a-zA-Z0-9_-]+)(?:\?[^\s,.)]+)?)/g

function renderInlineFormatting(text: string, isUser: boolean): React.ReactNode[] {
  const combinedRegex = new RegExp(
    `(https?:\\/\\/[^\\s<)]+|${INTERNAL_ROUTE_REGEX.source})`,
    'g'
  )
  const parts = text.split(combinedRegex).filter((p) => p !== undefined && p !== '')

  return parts.map((part, idx) => {
    if (/^https?:\/\//.test(part)) {
      const isHelloET = part.includes('helloet.devvoltz.com')
      const cleanLabel = isHelloET
        ? part.replace(/^https?:\/\/helloet\.devvoltz\.com/, '') || 'HelloET'
        : part
      if (isHelloET && cleanLabel.startsWith('/')) {
        return (
          <Link
            key={idx}
            href={cleanLabel}
            className={`underline underline-offset-2 font-semibold ${
              isUser ? 'text-amber-300' : 'text-[#16A34A] hover:text-[#036246]'
            }`}
          >
            {cleanLabel}
          </Link>
        )
      }
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 font-semibold break-all ${
            isUser ? 'text-amber-300' : 'text-[#16A34A] hover:text-[#036246]'
          }`}
        >
          {part}
        </a>
      )
    }

    if (part.startsWith('/') && INTERNAL_ROUTE_REGEX.test(part)) {
      INTERNAL_ROUTE_REGEX.lastIndex = 0
      return (
        <Link
          key={idx}
          href={part}
          className={`underline underline-offset-2 font-semibold ${
            isUser ? 'text-amber-300' : 'text-[#16A34A] hover:text-[#036246]'
          }`}
        >
          {part}
        </Link>
      )
    }
    INTERNAL_ROUTE_REGEX.lastIndex = 0

    const boldTokens = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return (
      <React.Fragment key={idx}>
        {boldTokens.map((tok, bIdx) => {
          if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
            return <strong key={bIdx} className="font-bold">{tok.slice(2, -2)}</strong>
          }
          if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
            return <em key={bIdx} className="italic">{tok.slice(1, -1)}</em>
          }
          return <React.Fragment key={bIdx}>{tok}</React.Fragment>
        })}
      </React.Fragment>
    )
  })
}

function SafeMessageContent({
  text,
  isUser,
  isStreaming,
}: {
  text: string
  isUser: boolean
  isStreaming?: boolean
}) {
  const normalized = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<[^>]+>/g, '')

  const lines = normalized.split('\n')

  return (
    <div className="space-y-1 leading-relaxed break-words">
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1
        return (
          <p key={i} className={line.trim() === '' ? 'h-1.5' : ''}>
            {renderInlineFormatting(line, isUser)}
            {isLast && isStreaming && (
              <span className="inline-block w-1.5 h-3.5 bg-[#16A34A] ml-1 align-middle animate-pulse rounded-sm" />
            )}
          </p>
        )
      })}
    </div>
  )
}

function BusinessMiniCard({ business }: { business: AssistantBusinessCard }) {
  const visibleFeatures = (business.featureLabels || []).slice(0, 3)
  const extraFeatureCount = Math.max(0, (business.featureLabels || []).length - 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm hover:border-[#16A34A]/50 hover:shadow-md transition-all"
    >
      <div className="flex gap-2.5 items-start">
        <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-100">
          {business.image ? (
            <img
              src={business.image}
              alt={business.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Building2 className="w-6 h-6 text-[#16A34A]/60" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Link
              href={`/business/${business.slug}`}
              className="font-bold text-xs text-neutral-900 hover:text-[#16A34A] truncate"
            >
              {business.name}
            </Link>
            {business.verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" aria-label="Verified" />
            )}
          </div>

          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
            {business.category} · {business.city}
            {business.subcity ? `, ${business.subcity}` : ''}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {business.rating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-600">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {business.rating}
                {business.reviewCount > 0 && (
                  <span className="text-neutral-400 font-normal">({business.reviewCount})</span>
                )}
              </span>
            )}

            {business.isOpenNow !== null ? (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                  business.isOpenNow ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    business.isOpenNow ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {business.isOpenNow ? 'Open now' : 'Closed'}
              </span>
            ) : (
              business.todayHours && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-500">
                  <Clock className="w-2.5 h-2.5" />
                  {business.todayHours}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Amenity Pills */}
      {visibleFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleFeatures.map((feat) => (
            <span
              key={feat}
              className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-md"
            >
              {feat}
            </span>
          ))}
          {extraFeatureCount > 0 && (
            <span className="text-[10px] font-medium text-neutral-400 px-1 py-0.5">
              +{extraFeatureCount} more
            </span>
          )}
        </div>
      )}

      {/* Quick Action Row */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-100">
        <Link
          href={`/business/${business.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1 bg-[#DCFCE7] hover:bg-[#16A34A] text-[#16A34A] hover:text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors"
        >
          <span>View</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-[#16A34A] hover:bg-[#036246] text-white text-[11px] font-bold py-1.5 px-2 rounded-lg transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>
        )}

        {business.directionsUrl && (
          <a
            href={business.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold py-1.5 px-2.5 rounded-lg transition-colors"
            title="Get Directions"
          >
            <MapPin className="w-3 h-3 text-[#16A34A]" />
            <span>Map</span>
          </a>
        )}
      </div>
    </motion.div>
  )
}

function getDefaultWelcome(lang: 'en' | 'am'): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    text:
      lang === 'am'
        ? 'ሰላም! 👋 እኔ **HelloET Assistant** ነኝ። በኢትዮጵያ ውስጥ ምርጥ ሬስቶራንቶችን፣ ሆቴሎችን፣ ካፌዎችን፣ ፋርማሲዎችን፣ የስራ ሰዓታቸውን፣ የዋጋ ፓኬጆችን እና ሌሎችንም እንዲያገኙ እረዳዎታለሁ። ማንኛውንም ጥያቄ ይጠይቁኝ!'
        : 'Selam! 👋 I\'m **HelloET Assistant**. Ask me anything — find top restaurants, WiFi cafes, 24/7 pharmacies open now, check reviews & hours, compare ETB pricing plans, or learn how to list your business across Ethiopia.',
    timestamp: new Date().toISOString(),
  }
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [micLang, setMicLang] = useState<'en-US' | 'am-ET'>('en-US')
  const [messages, setMessages] = useState<Message[]>([getDefaultWelcome('en')])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Restore persisted chat history on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: Message) => ({ ...m, isStreaming: false })))
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Persist completed messages
  useEffect(() => {
    try {
      const toSave = messages
        .filter((m) => !m.isStreaming && m.text.trim().length > 0)
        .slice(-20)
      if (toSave.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      }
    } catch {
      // Ignore storage errors
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [isOpen])

  // Escape key closes chat smoothly
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      recognitionRef.current?.stop()
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeakingMsgId(null)
    }
  }, [])

  const speakText = useCallback((text: string, msgId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceNotice('Voice playback is not supported in this browser.')
      return
    }
    window.speechSynthesis.cancel()

    const clean = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[*_`#]/g, '')
      .trim()

    if (!clean) return

    const isAmharic = /[\u1200-\u137F]/.test(clean)
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    if (isAmharic) {
      utterance.lang = 'am-ET'
      const amharicVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('am')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('sw')) ||
        null
      if (amharicVoice) utterance.voice = amharicVoice
      utterance.rate = 0.92
    } else {
      utterance.lang = 'en-US'
      const enVoice =
        voices.find((v) => v.lang === 'en-US' && v.name.includes('Google')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null
      if (enVoice) utterance.voice = enVoice
      utterance.rate = 1.0
    }

    utterance.onstart = () => setSpeakingMsgId(msgId)
    utterance.onend = () => setSpeakingMsgId(null)
    utterance.onerror = () => setSpeakingMsgId(null)
    window.speechSynthesis.speak(utterance)
  }, [])

  const copyText = (text: string, msgId: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    const clean = text.replace(/\*\*/g, '').replace(/\*/g, '')
    navigator.clipboard.writeText(clean).then(() => {
      setCopiedMsgId(msgId)
      setTimeout(() => setCopiedMsgId(null), 1800)
    }).catch(() => {})
  }

  const toggleListening = () => {
    if (typeof window === 'undefined') return
    setVoiceNotice(null)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceNotice('Voice input requires Chrome, Edge, or Safari with microphone access.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = micLang
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (transcript) {
        setInput(transcript)
      }
      setIsListening(false)
    }
    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event?.error === 'not-allowed') {
        setVoiceNotice('Microphone permission was denied. Please allow mic access to use voice.')
      }
    }
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopGeneration = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsLoading(false)
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    )
  }

  const clearChat = () => {
    stopGeneration()
    stopSpeaking()
    const fresh = getDefaultWelcome(micLang === 'am-ET' ? 'am' : 'en')
    setMessages([fresh])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const switchLanguage = () => {
    const nextLang = micLang === 'en-US' ? 'am-ET' : 'en-US'
    setMicLang(nextLang)
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([getDefaultWelcome(nextLang === 'am-ET' ? 'am' : 'en')])
    }
  }

  const getInitialSuggestions = () => {
    if (micLang === 'am-ET') {
      return [
        'አዲስ አበባ ምርጥ ሬስቶራንቶች',
        'ቦሌ አቅራቢያ ዋይፋይ ያላቸው ካፌዎች',
        'የዋጋ ፓኬጆች እና ቴሌብር',
        'ንግዴን እንዴት ልመዝግብ?',
      ]
    }
    const cityMatch = pathname?.match(/^\/city\/([^/]+)/)
    const currentCity = cityMatch
      ? decodeURIComponent(cityMatch[1]).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : null

    if (currentCity) {
      return [
        `Best restaurants in ${currentCity}?`,
        `Hotels in ${currentCity} with WiFi?`,
        `Pharmacies open now in ${currentCity}?`,
        'Pricing & Telebirr payment',
      ]
    }

    return [
      'Best restaurants in Addis Ababa?',
      'Cafes in Bole with WiFi & parking?',
      'Compare Basic vs Premium & Telebirr',
      'How do I list my business & get verified?',
    ]
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    }

    const assistantMsgId = (Date.now() + 1).toString()
    const updatedMessages = [...messages, userMessage]

    setMessages([
      ...updatedMessages,
      {
        id: assistantMsgId,
        role: 'assistant',
        text: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      },
    ])
    setInput('')
    setIsLoading(true)
    setVoiceNotice(null)

    const controller = new AbortController()
    abortControllerRef.current = controller

    let accumulatedText = ''

    try {
      const history = updatedMessages
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text.trim(),
          history,
          currentPath: pathname,
          stream: true,
        }),
      })

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const evt of events) {
            const dataLine = evt
              .split('\n')
              .find((l) => l.startsWith('data:'))
            if (!dataLine) continue
            const jsonStr = dataLine.slice(5).trim()
            if (!jsonStr) continue

            try {
              const payload = JSON.parse(jsonStr)

              if (payload.type === 'meta') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          businesses: Array.isArray(payload.businesses) ? payload.businesses : [],
                          quickActions: Array.isArray(payload.quickActions) ? payload.quickActions : [],
                          mode: payload.mode,
                        }
                      : m
                  )
                )
              } else if (payload.type === 'delta' && typeof payload.text === 'string') {
                accumulatedText += payload.text
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, text: accumulatedText }
                      : m
                  )
                )
              } else if (payload.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                  )
                )
              }
            } catch {
              // Ignore partial chunk errors
            }
          }
        }
      } else {
        // Fallback standard JSON handling
        const data = await res.json()
        accumulatedText = data.reply || 'Sorry, something went wrong. Please try again.'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: accumulatedText,
                  businesses: Array.isArray(data.businesses) ? data.businesses : [],
                  quickActions: Array.isArray(data.quickActions) ? data.quickActions : [],
                  mode: data.mode,
                  isStreaming: false,
                }
              : m
          )
        )
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: m.text || 'Here is what I found on HelloET.',
                isStreaming: false,
              }
            : m
        )
      )

      if (ttsEnabled && accumulatedText) {
        speakText(accumulatedText, assistantMsgId)
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: m.text || 'Generation stopped.',
                  isStreaming: false,
                }
              : m
          )
        )
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: 'Sorry, I\'m having trouble connecting right now. You can browse verified listings directly at /businesses.',
                  isStreaming: false,
                }
              : m
          )
        )
      }
    } finally {
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')
  const followUpChips =
    messages.length === 1
      ? getInitialSuggestions()
      : !isLoading
      ? latestAssistantMsg?.quickActions || []
      : []

  return (
    <>
      {/* Animated Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden ${
              isExpanded
                ? 'bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[510px] sm:h-[650px]'
                : 'bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[400px] sm:h-[550px]'
            }`}
            style={{ maxHeight: 'calc(100dvh - 105px)', height: isExpanded ? '650px' : '550px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#16A34A] via-[#047857] to-[#004D35] px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Sparkles className="w-5 h-5 text-[#FBBF24]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm leading-tight truncate">
                    HelloET Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-white/80 text-[11px] font-medium truncate">
                      {isLoading ? 'Thinking & searching...' : 'Live Ethiopian Directory AI'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={switchLanguage}
                  title="Switch Assistant Language (English / Amharic)"
                  className="px-2 py-1 text-[11px] font-black bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors border border-white/20"
                >
                  {micLang === 'en-US' ? 'EN' : 'አማ'}
                </button>

                <button
                  onClick={() => {
                    if (ttsEnabled) stopSpeaking()
                    setTtsEnabled(!ttsEnabled)
                  }}
                  title={ttsEnabled ? 'Auto-read replies: ON' : 'Auto-read replies: OFF'}
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  {ttsEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#FBBF24]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white/65" />
                  )}
                </button>

                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-white/85" />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore size' : 'Expand chat'}
                  className="hidden sm:flex w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg items-center justify-center transition-colors"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-3.5 h-3.5 text-white/85" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-white/85" />
                  )}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Inline Voice Notice Banner */}
            {voiceNotice && (
              <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center justify-between text-xs text-amber-800">
                <span>{voiceNotice}</span>
                <button onClick={() => setVoiceNotice(null)} className="text-amber-600 hover:text-amber-900 ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-neutral-50">
              {messages.map((msg) => {
                const showLoadingDots = msg.role === 'assistant' && msg.isStreaming && !msg.text

                return (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`flex gap-2 ${
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                          msg.role === 'assistant' ? 'bg-[#16A34A]' : 'bg-neutral-300'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-neutral-700" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 max-w-[84%]">
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-[#16A34A] text-white rounded-tr-sm'
                              : 'bg-white text-neutral-800 border border-neutral-200/70 rounded-tl-sm'
                          }`}
                        >
                          {showLoadingDots ? (
                            <div className="flex items-center gap-2 py-0.5">
                              <Loader2 className="w-4 h-4 text-[#16A34A] animate-spin" />
                              <span className="text-xs text-neutral-500 font-medium">
                                Searching directory & preparing answer...
                              </span>
                            </div>
                          ) : (
                            <SafeMessageContent
                              text={msg.text}
                              isUser={msg.role === 'user'}
                              isStreaming={msg.isStreaming}
                            />
                          )}
                        </div>

                        {msg.role === 'assistant' && !msg.isStreaming && msg.text && (
                          <div className="flex items-center gap-3 px-1">
                            <button
                              onClick={() =>
                                speakingMsgId === msg.id
                                  ? stopSpeaking()
                                  : speakText(msg.text, msg.id)
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-[#16A34A] transition-colors font-medium"
                            >
                              {speakingMsgId === msg.id ? (
                                <>
                                  <VolumeX className="w-3 h-3" /> Stop
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" /> Listen
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => copyText(msg.text, msg.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-[#16A34A] transition-colors font-medium"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-[#16A34A]" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Business Cards inside Assistant Reply */}
                    {msg.role === 'assistant' && msg.businesses && msg.businesses.length > 0 && (
                      <div className="pl-9 space-y-2">
                        {msg.businesses.map((biz) => (
                          <BusinessMiniCard key={biz.id} business={biz} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested / Follow-up Quick Action Chips */}
            {followUpChips.length > 0 && (
              <div className="px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0 bg-white border-t border-neutral-100">
                {followUpChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-[11px] sm:text-xs bg-[#DCFCE7] text-[#16A34A] px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#16A34A] hover:text-white transition-colors font-semibold flex-shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 bg-white flex-shrink-0">
              <div
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 transition-colors ${
                  isListening
                    ? 'bg-red-50 border border-red-300'
                    : 'bg-neutral-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#16A34A]/30 focus-within:border-[#16A34A]'
                }`}
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  title={
                    isListening
                      ? 'Stop listening'
                      : `Speak in ${micLang === 'am-ET' ? 'Amharic' : 'English'}`
                  }
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500 animate-pulse text-white'
                      : 'bg-white text-neutral-600 hover:bg-[#16A34A] hover:text-white shadow-sm'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening
                      ? micLang === 'am-ET'
                        ? 'እያዳመጥኩ ነው...'
                        : 'Listening...'
                      : micLang === 'am-ET'
                      ? 'ጥያቄዎን ይጻፉ ወይም ይናገሩ...'
                      : 'Ask any question about places, hours, pricing...'
                  }
                  className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-800 outline-none placeholder-neutral-400 min-w-0"
                  disabled={isLoading}
                />

                {isLoading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    title="Stop response"
                    className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                    aria-label="Stop response"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-[#16A34A] hover:bg-[#036246] disabled:bg-neutral-300 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-center text-neutral-400 text-[10px] mt-1.5">
                HelloET AI · Devvoltz Technology PLC
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#16A34A] to-[#004D35] hover:from-[#15803D] hover:to-[#003D2B] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 ring-4 ring-white/80"
        aria-label={isOpen ? 'Close HelloET Assistant' : 'Open HelloET Assistant'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FBBF24] rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                <Sparkles className="w-2.5 h-2.5 text-[#003D2B]" />
              </span>
            )}
          </>
        )}
      </button>
    </>
  )
}
