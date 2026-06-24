import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Loader2, MailWarning, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/Logo'
import { verifyEmail } from '@/api/auth'
import { useAuth } from '@/providers/AuthProvider'
import { useResendVerification } from '@/hooks/useVerification'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const qc = useQueryClient()
  const { isAuthenticated } = useAuth()
  const resend = useResendVerification()

  // Keying the query by the token dedupes the call, so React StrictMode's
  // double-mount in dev doesn't burn the single-use token on a second request.
  const { isPending, isError, isSuccess, error } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      await verifyEmail(token)
      return true
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    // The page renders its own success/error UI — don't toast or redirect.
    meta: { silentError: true },
  })

  // On success, refresh "who am I" so the banner + gates clear immediately for
  // a user who verified while logged in.
  useEffect(() => {
    if (isSuccess) qc.invalidateQueries({ queryKey: ['me'] })
  }, [isSuccess, qc])

  const missingToken = !token
  const failed = isError || missingToken

  return (
    <div className="grid min-h-dvh place-items-center px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-10">
          {missingToken ? (
            <State
              icon={XCircle}
              tone="error"
              title="Invalid verification link"
              body="This link is missing its token. Please open the link from your email."
            />
          ) : isPending ? (
            <State
              icon={Loader2}
              spin
              tone="muted"
              title="Verifying your email…"
              body="Hang tight, this only takes a second."
            />
          ) : isError ? (
            <State
              icon={MailWarning}
              tone="error"
              title="We couldn't verify your email"
              body={error?.message ?? 'This link is invalid or has expired.'}
            />
          ) : (
            <State
              icon={CheckCircle2}
              tone="success"
              title="Email verified"
              body="Thank you! Your email is confirmed and your account is ready."
            />
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {isSuccess ? (
            <>
              {/* <Button asChild size="lg">
                <Link to="/login">Go to sign in</Link>
              </Button> */}
              <Button asChild size="lg" variant="outline">
                <Link to="/">Continue shopping</Link>
              </Button>
            </>
          ) : null}

          {failed && isAuthenticated ? (
            <Button
              size="lg"
              onClick={() => resend.mutate()}
              disabled={resend.isPending}
            >
              {resend.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Resend verification email'
              )}
            </Button>
          ) : null}

          {failed && !isAuthenticated ? (
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Go to sign in</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function State({ icon: Icon, title, body, tone, spin }) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600'
      : tone === 'error'
        ? 'text-destructive'
        : 'text-muted-foreground'
  return (
    <div>
      <div className="flex justify-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
          <Icon
            className={`h-7 w-7 ${toneClass} ${spin ? 'animate-spin' : ''}`}
          />
        </span>
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
