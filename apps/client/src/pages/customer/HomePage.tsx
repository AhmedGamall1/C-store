import { Hero } from '@/components/home/Hero'
import { TrustBar } from '@/components/home/TrustBar'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { BestSellers } from '@/components/home/BestSellers'
import { DropBanner } from '@/components/home/DropBanner'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedCategories />
      <BestSellers />
      <DropBanner />
    </>
  )
}
