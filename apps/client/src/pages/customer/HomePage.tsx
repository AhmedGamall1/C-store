import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { NewArrivals } from '@/components/home/NewArrivals'
import { DropBanner } from '@/components/home/DropBanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Trust bar — tablet and up only, hidden on mobile */}
      <TrustBar className="hidden md:block" />
      <FeaturedCategories />
      <NewArrivals />
      <DropBanner />
    </>
  )
}
