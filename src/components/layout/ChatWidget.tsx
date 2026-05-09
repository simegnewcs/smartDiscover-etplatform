'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

function MessageContent({ text, isUser }: { text: string; isUser: boolean }) {
  // Strip stray markdown
  let clean = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/^#{1,3}\s+/gm, '')

  // Convert URLs to clickable links
  clean = clean.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) => {
      const label = url.replace('https://helloet.devvoltz.com', 'HelloET')
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 underline underline-offset-2 font-semibold ${isUser ? 'text-yellow-300' : 'text-[#006747]'} break-all">🔗 ${label}</a>`
    }
  )

  return (
    <span
      dangerouslySetInnerHTML={{ __html: clean }}
      className="leading-relaxed"
    />
  )
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

const suggestedQuestions = [
  'Best restaurants in Addis Ababa?',
  'Hotels in Bahir Dar?',
  'Pharmacies near me in Gondar?',
  'Tourist attractions in Ethiopia?',
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! 👋 I\'m HelloET Assistant. I can help you find restaurants, hotels, cafes, pharmacies and any business across Ethiopia. What are you looking for?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  const [micLang, setMicLang] = useState<'en-US' | 'am-ET'>('en-US')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakText = useCallback((text: string, msgId: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    // Strip HTML tags and URLs for clean speech
    const clean = text
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[*_`#]/g, '')
      .trim()

    // Detect Amharic — Unicode range U+1200–U+137F
    const isAmharic = /[\u1200-\u137F]/.test(clean)

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 1.0
    utterance.pitch = 1

    if (isAmharic) {
      utterance.lang = 'am-ET'
      // Try to find an Amharic voice, fallback to any available
      const voices = window.speechSynthesis.getVoices()
      const amharicVoice = voices.find(v => v.lang.startsWith('am')) ||
                           voices.find(v => v.lang.startsWith('sw')) || // Swahili as fallback
                           null
      if (amharicVoice) utterance.voice = amharicVoice
      utterance.rate = 0.9
    } else {
      utterance.lang = 'en-US'
      const voices = window.speechSynthesis.getVoices()
      const enVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                      voices.find(v => v.lang === 'en-US') || null
      if (enVoice) utterance.voice = enVoice
    }

    utterance.onstart = () => { setIsSpeaking(true); setSpeakingMsgId(msgId) }
    utterance.onend = () => { setIsSpeaking(false); setSpeakingMsgId(null) }
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingMsgId(null) }
    window.speechSynthesis.speak(utterance)
  }, [ttsEnabled])

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setSpeakingMsgId(null)
    }
  }

  const toggleListening = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.')
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
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history })
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply || 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      if (ttsEnabled) speakText(assistantMessage.text, assistantMessage.id)
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I\'m having trouble connecting. Please try again in a moment.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)', height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#006747] to-[#00523A] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#EEF578]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">HelloET Assistant</h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/70 text-xs">Powered by DevVoltz </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { ttsEnabled ? stopSpeaking() : null; setTtsEnabled(!ttsEnabled) }}
                title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4 text-[#EEF578]" /> : <VolumeX className="w-4 h-4 text-white/50" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'assistant' ? 'bg-[#006747]' : 'bg-neutral-300'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-neutral-600" />
                  }
                </div>
                <div className="flex flex-col gap-1 max-w-[75%]">
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#006747] text-white rounded-tr-sm'
                      : 'bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-tl-sm'
                  }`}>
                    <MessageContent text={msg.text} isUser={msg.role === 'user'} />
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speakingMsgId === msg.id ? stopSpeaking() : speakText(msg.text, msg.id)}
                      className="self-start flex items-center gap-1 text-xs text-neutral-400 hover:text-[#006747] transition-colors px-1"
                    >
                      {speakingMsgId === msg.id
                        ? <><VolumeX className="w-3 h-3" /> Stop</>
                        : <><Volume2 className="w-3 h-3" /> Speak</>
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-[#006747] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-100">
                  <Loader2 className="w-4 h-4 text-[#006747] animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions — only show at start */}
          {messages.length === 1 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-white border-t border-neutral-100">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-[#D1EFE4] text-[#006747] px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-[#006747] hover:text-white transition-colors font-medium flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 bg-white flex-shrink-0">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${isListening ? 'bg-red-50 border border-red-300' : 'bg-neutral-100'}`}>
              <button
                type="button"
                onClick={() => setMicLang(micLang === 'en-US' ? 'am-ET' : 'en-US')}
                title="Switch mic language"
                className="text-xs font-bold text-[#006747] bg-[#D1EFE4] hover:bg-[#006747] hover:text-white px-2 py-1 rounded-lg transition-colors flex-shrink-0"
              >
                {micLang === 'en-US' ? 'EN' : 'አማ'}
              </button>
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : `Speak in ${micLang === 'am-ET' ? 'Amharic' : 'English'}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-neutral-300 hover:bg-[#006747]'}`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-white" />}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask or speak your question...'}
                className="flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder-neutral-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 bg-[#006747] disabled:bg-neutral-300 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-center text-neutral-400 text-xs mt-1.5">HelloET · Devvoltz Technology PLC</p>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#006747] to-[#00402C] hover:from-[#00523A] hover:to-[#003020] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EEF578] rounded-full flex items-center justify-center">
                <span className="text-[#003D2B] text-xs font-bold">1</span>
              </span>
            )}
          </>
        )}
      </button>
    </>
  )
}
