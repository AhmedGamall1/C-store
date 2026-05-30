import { Outlet } from 'react-router'
import { AccountSidebar } from './AccountSidebar'
import { CURRENT_USER } from '@/data/user'

export function AccountLayout() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          My Account
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Hello, {CURRENT_USER.firstName}
        </h1>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
