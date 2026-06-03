import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { NewArrivals } from '@/components/home/NewArrivals'
import { DropBanner } from '@/components/home/DropBanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Desktop: trust bar sits right under the hero */}
      <TrustBar className="hidden md:block" />
      <FeaturedCategories />
      {/* Mobile: trust bar moves between categories and new arrivals */}
      <TrustBar className="md:hidden" />
      <NewArrivals />
      <DropBanner />
    </>
  )
}
