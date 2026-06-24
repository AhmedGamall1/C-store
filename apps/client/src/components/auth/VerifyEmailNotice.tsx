import { Loader2, MailWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResendVerification } from '@/hooks/useVerification'

// Inline amber alert that explains why a control is disabled and lets the
// user re-send the verification email. Render it only for logged-in,
// unverified users (see `useNeedsVerification`).
export function VerifyEmailNotice({ message }) {
  const resend = useResendVerification()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <MailWarning className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        {message ??
          'Please verify your email to continue. Check your inbox for the verification link.'}
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
    </div>
  )
}
