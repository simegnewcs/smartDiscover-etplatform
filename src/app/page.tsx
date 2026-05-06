import HeroSection from '@/components/layout/HeroSection'
import TrustStrip from '@/components/layout/TrustStrip'
import CategoryGrid from '@/components/layout/CategoryGrid'
import FeaturedListings from '@/components/layout/FeaturedListings'

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <HeroSection />
      <TrustStrip />
      <CategoryGrid />
      <FeaturedListings />
    </div>
  )
}
