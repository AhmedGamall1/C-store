import { Link } from 'react-router'
import {
  WifiOff,
  Lock,
  ShieldAlert,
  PackageOpen,
  ServerCrash,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isApiError } from '@/lib/errors/ApiError'
import { t } from '@/lib/errors/messages'

// Picks an icon, title, body, and CTA based on the error code.
// Falls back gracefully when `error` is not an ApiError (e.g. plain Error).
function describe(error, fallback) {
  if (!isApiError(error)) {
    return {
      Icon: ServerCrash,
      title: fallback?.title ?? 'Something went wrong',
      body: fallback?.body ?? error?.message ?? t('GENERIC'),
      cta: 'retry',
    }
  }

  switch (error.code) {
    case 'NETWORK':
      return {
        Icon: WifiOff,
        title: 'You appear to be offline',
        body: t('NETWORK'),
        cta: 'retry',
      }
    case 'UNAUTHORIZED':
      return {
        Icon: Lock,
        title: 'Sign in required',
        body: error.message || t('UNAUTHORIZED'),
        cta: 'login',
      }
    case 'FORBIDDEN':
      return {
        Icon: ShieldAlert,
        title: 'No access',
        body: error.message || t('FORBIDDEN'),
        cta: 'home',
      }
    case 'NOT_FOUND':
      return {
        Icon: PackageOpen,
        title: fallback?.title ?? 'Not found',
        body: fallback?.body ?? error.message ?? t('NOT_FOUND'),
        cta: fallback?.cta ?? 'home',
      }
    case 'SERVER':
      return {
        Icon: ServerCrash,
        title: 'Something went wrong on our end',
        body: error.message || t('SERVER'),
        cta: 'retry',
      }
    default:
      return {
        Icon: ServerCrash,
        title: fallback?.title ?? 'Something went wrong',
        body: error.message || t('GENERIC'),
        cta: fallback?.cta ?? 'retry',
      }
  }
}

export function ErrorView({
  error,
  onRetry,
  fallback,
  homeHref = '/',
  homeLabel = 'Back to home',
}) {
  const { Icon, title, body, cta } = describe(error, fallback)

  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <Icon className="h-10 w-10 text-muted-foreground" />
      <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      <div className="mt-2 flex gap-3">
        {cta === 'retry' && onRetry ? (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4" />
            {t('RETRY')}
          </Button>
        ) : null}
        {cta === 'login' ? (
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        ) : null}
        {cta === 'home' || (cta === 'retry' && !onRetry) ? (
          <Button asChild variant="outline">
            <Link to={homeHref}>{homeLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
