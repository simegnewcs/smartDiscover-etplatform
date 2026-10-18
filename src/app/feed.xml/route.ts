import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://helloet.devvoltz.com'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        city: true,
        subcity: true,
      }
    })

    const itemsXml = businesses
      .map((b) => {
        const location = b.subcity ? `${b.subcity.name}, ${b.city.name}` : b.city.name
        const title = `${b.name} - ${b.category.name} in ${location}`
        const link = `${siteUrl}/business/${b.slug}`
        const pubDate = new Date(b.createdAt).toUTCString()
        const description = (b.description || `${b.name} is a verified ${b.category.name} in ${location}, Ethiopia.`)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

        return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${b.category.name}]]></category>
    </item>`
      })
      .join('')

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HelloET - Latest Ethiopian Businesses &amp; Places</title>
    <link>${siteUrl}</link>
    <description>Ethiopia's #1 trusted local business discovery platform. Discover verified restaurants, hotels, cafes, supermarkets and services across Ethiopian cities.</description>
    <language>en-ET</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`

    return new NextResponse(feedXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}
