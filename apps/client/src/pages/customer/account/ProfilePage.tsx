import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CURRENT_USER } from '@/data/user'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: CURRENT_USER.firstName,
    lastName: CURRENT_USER.lastName,
    email: CURRENT_USER.email,
    phone: CURRENT_USER.phone ?? '',
  })

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your name and contact details.
            </p>
          </div>
        </div>

        <form
          className="mt-6 grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </section>

      <Separator />

      <section>
        <h2 className="font-display text-xl font-semibold">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password you don&apos;t use anywhere else.
        </p>
        <form
          className="mt-6 grid max-w-md gap-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" name="current" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" name="new" type="password" />
          </div>
          <div>
            <Button type="submit" variant="outline">
              Update password
            </Button>
          </div>
        </form>
      </section>

      <Separator />

      <section className="text-xs text-muted-foreground">
        Member since {formatDate(CURRENT_USER.createdAt)}
      </section>
    </div>
  )
}
