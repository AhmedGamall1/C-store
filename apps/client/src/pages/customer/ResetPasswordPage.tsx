import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Eye, EyeOff, Loader2, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/common/Logo'
import { resetPassword } from '@/api/auth'
import { resetPasswordSchema } from '@/lib/validation/auth'
import { useApiError } from '@/hooks/useApiError'
import { isApiError } from '@/lib/errors/ApiError'
import { t } from '@/lib/errors/messages'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  // Set only for an expired/used link (400) so we can show the "request a new
  // link" path inline; all other errors go to the global toast handler.
  const [tokenError, setTokenError] = useState(null)

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form
  const { handle: handleApiError } = useApiError({ form })

  const reset = useMutation({
    mutationFn: ({ password }) => resetPassword(token, password),
    // The page renders its own inline error for a bad link.
    meta: { silentError: true },
    onSuccess: (message) => {
      toast.success(message || t('RESET_PASSWORD_SUCCESS'))
      // Do NOT auto-login — send the user to sign in with their new password.
      navigate('/login', { replace: true })
    },
  })

  const onSubmit = async ({ password }) => {
    setTokenError(null)
    try {
      await reset.mutateAsync({ password })
    } catch (e) {
      if (isApiError(e) && e.status === 400) {
        setTokenError(e.message)
      } else {
        handleApiError(e)
      }
    }
  }

  // No token in the URL → there is nothing we can reset.
  if (!token) {
    return (
      <InvalidLink body="This reset link is missing its token. Please request a new one." />
    )
  }

  return (
    <div className="grid min-h-dvh place-items-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Logo />

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Reset password
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a strong password you do not use anywhere else.
          </p>
        </div>

        {tokenError ? (
          <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p>{tokenError}</p>
            <Link
              to="/forgot-password"
              className="mt-1 inline-block font-medium underline underline-offset-4"
            >
              Request a new reset link
            </Link>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Reset password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

function InvalidLink({ body }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-10">
          <div className="flex justify-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <XCircle className="h-7 w-7 text-destructive" />
            </span>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
