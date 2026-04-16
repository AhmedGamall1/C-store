import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/common/Logo'
import { useAuth } from '@/providers/AuthProvider'
import { loginSchema } from '@/lib/validation/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      const user = await login(values)
      toast.success(`Welcome back, ${user.firstName}`)
      const to = location.state?.from ?? '/'
      navigate(to, { replace: true })
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <Logo />

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Welcome back
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              New here?{' '}
              <Link
                to="/register"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                Create an account
              </Link>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-4">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <img
          src="https://picsum.photos/seed/cstore-login/1200/1600"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-foreground/80 via-foreground/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-background">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
            <span className="inline-block h-1.5 w-6 bg-accent" />
            Made in Cairo
          </div>
          <div>
            <p className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Built for the street.
              <br />
              Shaped by the Nile.
            </p>
            <p className="mt-4 max-w-md text-sm text-background/70">
              Premium streetwear pieces, thoughtfully cut and honestly priced.
              Fast shipping across all 27 governorates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
