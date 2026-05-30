import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/providers/AuthProvider'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="container-page py-20">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
