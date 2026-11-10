'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
}

const STORAGE_KEY = 'helloet_assistant_chat_v2'

const INTERNAL_ROUTE_REGEX =
  /(\/(?:businesses|business\/[a-zA-Z0-9_-]+|pricing|auth\/register|auth\/login|dashboard(?:\/[a-zA-Z0-9_/-]+)?|about|contact|help|city\/[a-zA-Z0-9_/-]+|category\/[a-zA-Z0-9_-]+)(?:\?[^\s,.)]+)?)/g

function renderInlineFormatting(text: string, isUser: boolean): React.ReactNode[] {
  // Split by URLs or internal routes first
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

    // Parse **bold** and *italic* safely as React nodes
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

function SafeMessageContent({ text, isUser }: { text: string; isUser: boolean }) {
  // Normalize basic HTML tags into markdown/newlines safely without dangerouslySetInnerHTML
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
      {lines.map((line, i) => (
        <p key={i} className={line.trim() === '' ? 'h-1.5' : ''}>
          {renderInlineFormatting(line, isUser)}
        </p>
      ))}
    </div>
  )
}

function BusinessMiniCard({ business }: { business: AssistantBusinessCard }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-2.5 shadow-sm hover:border-[#16A34A]/40 transition-all">
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
            {business.todayHours && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-500">
                <Clock className="w-2.5 h-2.5" />
                {business.todayHours}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Row */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-neutral-100">
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
    </div>
  )
}

function getDefaultWelcome(lang: 'en' | 'am'): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    text:
      lang === 'am'
        ? 'ሰላም! 👋 እኔ **HelloET Assistant** ነኝ። በኢትዮጵያ ውስጥ ምርጥ ሬስቶራንቶችን፣ ሆቴሎችን፣ ካፌዎችን፣ ፋርማሲዎችን እና ሌሎች ንግዶችን እንዲያገኙ እረዳዎታለሁ። ምን ይፈልጋሉ?'
        : 'Selam! 👋 I\'m **HelloET Assistant**. I can help you find verified restaurants, hotels, traditional coffee houses, 24/7 pharmacies, and local businesses across Ethiopia. What are you looking for?',
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
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Restore persisted chat history on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Persist chat history
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)))
    } catch {
      // Ignore storage quota errors
    }
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Stop speech cleanly on unmount
  useEffect(() => {
    return () => {
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

  const clearChat = () => {
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

  // Context-aware suggested prompts
  const getInitialSuggestions = () => {
    if (micLang === 'am-ET') {
      return [
        'አዲስ አበባ ምርጥ ሬስቶራንቶች',
        'ባህር ዳር ሆቴሎች',
        'ቦሌ አቅራቢያ ፋርማሲ',
        'የዋጋ ፓኬጆች (Pricing)',
      ]
    }
    const cityMatch = pathname?.match(/^\/city\/([^/]+)/)
    const currentCity = cityMatch
      ? decodeURIComponent(cityMatch[1]).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : null

    if (currentCity) {
      return [
        `Best restaurants in ${currentCity}?`,
        `Top hotels in ${currentCity}?`,
        `Pharmacies in ${currentCity}?`,
        'Show pricing packages',
      ]
    }

    return [
      'Best restaurants in Addis Ababa?',
      'Hotels in Bahir Dar?',
      '24/7 Pharmacies near Bole?',
      'Show pricing packages',
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

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setVoiceNotice(null)

    try {
      const history = updatedMessages
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          currentPath: pathname,
        }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply || 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
        businesses: Array.isArray(data.businesses) ? data.businesses : [],
        quickActions: Array.isArray(data.quickActions) ? data.quickActions : [],
        mode: data.mode,
      }

      setMessages((prev) => [...prev, assistantMessage])
      if (ttsEnabled) {
        speakText(assistantMessage.text, assistantMessage.id)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'Sorry, I\'m having trouble connecting right now. You can browse verified listings directly at /businesses.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
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
      : latestAssistantMsg?.quickActions || []

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[500px] sm:h-[640px]'
              : 'bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[395px] sm:h-[540px]'
          }`}
          style={{ maxHeight: 'calc(100dvh - 105px)', height: isExpanded ? '640px' : '540px' }}
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
                    Live Ethiopian Directory AI
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
            {messages.map((msg) => (
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

                  <div className="flex flex-col gap-1 max-w-[82%]">
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-[#16A34A] text-white rounded-tr-sm'
                          : 'bg-white text-neutral-800 border border-neutral-200/70 rounded-tl-sm'
                      }`}
                    >
                      <SafeMessageContent text={msg.text} isUser={msg.role === 'user'} />
                    </div>

                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 px-1">
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
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-200/70 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#16A34A] animate-spin" />
                  <span className="text-xs text-neutral-500 font-medium">Searching HelloET directory...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested / Follow-up Quick Action Chips */}
          {!isLoading && followUpChips.length > 0 && (
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
                    : 'Ask about places, hotels, pricing...'
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-800 outline-none placeholder-neutral-400 min-w-0"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-[#16A34A] hover:bg-[#036246] disabled:bg-neutral-300 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-neutral-400 text-[10px] mt-1.5">
              HelloET AI · Devvoltz Technology PLC
            </p>
          </form>
        </div>
      )}

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
