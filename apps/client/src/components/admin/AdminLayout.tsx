import { Outlet, ScrollRestoration } from 'react-router'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

export function AdminLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[240px_1fr]">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex min-h-dvh flex-col">
        <AdminTopbar />
        <main className="flex-1 bg-secondary/20 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
