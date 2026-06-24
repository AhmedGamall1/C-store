import { Outlet, ScrollRestoration } from 'react-router'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnnouncementBar } from './AnnouncementBar'
import { VerifyEmailBanner } from '@/components/auth/VerifyEmailBanner'

export function CustomerLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AnnouncementBar />
      <Navbar />
      <VerifyEmailBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
