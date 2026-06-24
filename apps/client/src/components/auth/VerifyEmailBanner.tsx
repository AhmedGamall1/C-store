import { useState } from 'react'
import { Loader2, MailWarning, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useNeedsVerification,
  useResendVerification,
} from '@/hooks/useVerification'

// Persistent (but dismissible) bar shown across the storefront while a
// logged-in user still needs to verify their email. Dismissal is remembered
// for the browser session so it doesn't nag on every page change.
const DISMISS_KEY = 'verify-email-banner-dismissed'

export function VerifyEmailBanner() {
  const needsVerification = useNeedsVerification()
  const resend = useResendVerification()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  )

  if (!needsVerification || dismissed) return null

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="container-page flex flex-wrap items-center gap-3 py-2.5 text-sm">
        <MailWarning className="h-4 w-4 shrink-0" />
        <p className="flex-1">
          Please verify your email to place orders and manage your account.
          Check your inbox for the link.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
          className="border-amber-300 bg-transparent hover:bg-amber-100"
        >
          {resend.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Resend email'
          )}
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-amber-700 hover:text-amber-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
