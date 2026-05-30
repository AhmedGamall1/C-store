import { Link } from 'react-router'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-20">
      <div className="text-center">
        <p className="font-display text-9xl font-black tracking-tight text-foreground/10">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          This page got lost in the desert.
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to the good stuff.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/shop">
              <Search className="h-4 w-4" />
              Browse the shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
