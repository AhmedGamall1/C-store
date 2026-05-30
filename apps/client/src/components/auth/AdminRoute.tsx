import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/providers/AuthProvider'

export function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
