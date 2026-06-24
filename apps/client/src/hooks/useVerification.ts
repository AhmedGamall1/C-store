import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resendVerification } from '@/api/auth'
import { useAuth } from '@/providers/AuthProvider'
import { t } from '@/lib/errors/messages'

// True only for a logged-in user whose email is not verified yet.
// Guests (no user) are never gated — guest checkout must keep working.
export function useNeedsVerification(): boolean {
  const { user } = useAuth()
  return Boolean(user && user.emailVerified === false)
}

// Re-send the verification email. Toasts on success; failures fall through to
// the global error handler (which itself shows the verification-aware message).
export function useResendVerification() {
  return useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast.success(t('VERIFY_EMAIL_SENT'))
    },
  })
}
