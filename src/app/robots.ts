import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/businesses',
          '/business/',
          '/category/',
          '/city/',
          '/about',
          '/help',
          '/manifest.webmanifest',
          '/manifest.json',
          '/site.webmanifest',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/register',
          '/my-reviews',
          '/notifications',
          '/saved',
          '/_next/',
        ],
      },
      // Googlebot (Deep indexing & Rich Snippets)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/_next/'],
      },
      // Bingbot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/_next/'],
      },
      // Applebot (Apple Maps & Spotlight search)
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/_next/'],
      },
      // AI Search & Knowledge Engines (ChatGPT Search, Perplexity, Claude)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai'],
        allow: [
          '/',
          '/businesses',
          '/business/',
          '/category/',
          '/city/',
          '/about',
        ],
        disallow: ['/api/', '/admin/', '/dashboard/', '/_next/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
