import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

// Consolidate SEO authority: 308 redirect /businesses/[slug] to canonical /business/[slug]
export default function BusinessesDetailPage({ params }: PageProps) {
  redirect(`/business/${params.slug}`)
}
