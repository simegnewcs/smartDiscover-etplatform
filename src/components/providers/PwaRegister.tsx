'use client'

import { useEffect, useState } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null
  }
}

export default function PwaRegister() {
  const [, setIsInstallable] = useState(false)

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope)
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err)
          })
      })
    } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In development mode also register for testing offline / installability
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA Dev] Service Worker registered:', reg.scope)
        })
        .catch(() => {})
    }

    // 2. Capture beforeinstallprompt for PWA native installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      window.deferredPrompt = promptEvent
      setIsInstallable(true)
      window.dispatchEvent(new CustomEvent('helloet-pwa-installable', { detail: promptEvent }))
    }

    // 3. App installed handler
    const handleAppInstalled = () => {
      window.deferredPrompt = null
      setIsInstallable(false)
      window.dispatchEvent(new CustomEvent('helloet-pwa-installed'))
      console.log('[PWA] HelloET App installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return null
}
