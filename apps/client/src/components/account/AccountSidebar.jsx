import { NavLink, useNavigate } from 'react-router'
import { MapPin, Package, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'sonner'

const NAV = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
]

export function AccountSidebar() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const onSignOut = async () => {
    try {
      await logout()
      toast.success('Signed out')
      navigate('/', { replace: true })
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <nav className="lg:sticky lg:top-24">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:pb-0">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          </li>
        ))}
        <li className="lg:mt-4 lg:border-t lg:pt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  )
}
