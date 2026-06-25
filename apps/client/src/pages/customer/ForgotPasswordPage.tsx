import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/common/Logo'
import { forgotPassword } from '@/api/auth'
import { forgotPasswordSchema } from '@/lib/validation/auth'
import { useApiError } from '@/hooks/useApiError'
import { t } from '@/lib/errors/messages'

export default function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState(null)

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form
  const { handle: handleApiError } = useApiError({ form })

  const forgot = useMutation({ mutationFn: forgotPassword })

  const onSubmit = async ({ email }) => {
    try {
      const message = await forgot.mutateAsync(email)
      // Always show the generic message — never reveal whether the email exists.
      setSentMessage(message || t('FORGOT_PASSWORD_SENT'))
    } catch (e) {
      handleApiError(e)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Logo />

        {sentMessage ? (
          <div className="mt-10">
            <div className="flex justify-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
                <MailCheck className="h-7 w-7 text-emerald-600" />
              </span>
            </div>
            <h1 className="mt-6 text-center font-display text-2xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {sentMessage}
            </p>
            <Button asChild variant="outline" size="lg" className="mt-8 w-full">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Forgot password
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we will send you a link to reset your
                password.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
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
                    Send reset link
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-10 text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
