import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Eye, EyeOff, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/common/Logo'
import { useAuth } from '@/providers/AuthProvider'
import { registerSchema } from '@/lib/validation/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password')
  const pwChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
  ]

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values)
      toast.success(`Welcome to C-Store, ${user.firstName}`)
      navigate('/', { replace: true })
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Visual side (unchanged) */}
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <img
          src="https://picsum.photos/seed/cstore-register/1200/1600"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-bl from-foreground/80 via-foreground/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-background">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
            <span className="inline-block h-1.5 w-6 bg-accent" />
            Join the crew
          </div>
          <div>
            <p className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Members get first drops.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-background/80">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                Early access to limited releases
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                Free shipping on orders over 1,500 EGP
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                30-day hassle-free returns
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-sm">
          <Logo />

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Create account
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Start shopping with C-Store
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                  {...register('firstName')}
                />
                {errors.firstName ? (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                  {...register('lastName')}
                />
                {errors.lastName ? (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                ) : null}
              </div>
            </div>

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
              <Label htmlFor="phone">
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+20 10 1234 5678"
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              {password ? (
                <ul className="mt-2 space-y-1 text-xs">
                  {pwChecks.map((c) => (
                    <li
                      key={c.label}
                      className={
                        c.ok ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      <Check
                        className={
                          'mr-1 inline h-3 w-3 ' +
                          (c.ok ? 'text-accent' : 'opacity-30')
                        }
                      />
                      {c.label}
                    </li>
                  ))}
                </ul>
              ) : null}
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
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
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
    </div>
  )
}
