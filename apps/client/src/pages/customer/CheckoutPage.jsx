import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { AddressFormDialog } from '@/components/checkout/AddressFormDialog'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/providers/AuthProvider'
import { useMyAddresses } from '@/hooks/useAddresses'
import { useShippingRates } from '@/hooks/useShipping'
import { useCreateOrder } from '@/hooks/useOrders'
import { GOVERNORATES } from '@/data/user'
import { cn, formatEGP } from '@/lib/utils'

const STEPS = ['Details', 'Payment', 'Review']

const govSlug = (name) =>
  name?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? ''

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cart, isLoading: cartLoading } = useCart()
  const { data: shippingRates } = useShippingRates()
  const { data: addresses, isLoading: addressesLoading } = useMyAddresses()
  const createOrder = useCreateOrder()

  const [step, setStep] = useState(0)

  // Authenticated: which saved address is selected
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addrDialogOpen, setAddrDialogOpen] = useState(false)

  // Guest: contact info + freeform shipping address
  const [guest, setGuest] = useState({ name: '', phone: '', email: '' })
  const [guestAddress, setGuestAddress] = useState({
    street: '',
    city: '',
    governorate: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [notes, setNotes] = useState('')

  // Initialize the selected address when the user's saved list arrives.
  useEffect(() => {
    if (!isAuthenticated) return
    if (!addresses || addresses.length === 0) return
    setSelectedAddressId((id) => {
      if (id && addresses.some((a) => a.id === id)) return id
      return (addresses.find((a) => a.isDefault) ?? addresses[0]).id
    })
  }, [isAuthenticated, addresses])

  // Empty cart? Bounce.
  if (!cartLoading && cart.items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  // Resolve the active governorate (drives the shipping rate)
  const activeGovernorate = isAuthenticated
    ? addresses?.find((a) => a.id === selectedAddressId)?.governorate
    : guestAddress.governorate

  const shippingCost =
    activeGovernorate && shippingRates
      ? (shippingRates[govSlug(activeGovernorate)] ?? null)
      : null

  // Show shipping in summary once an address has resolved a rate
  const summaryShipping = step >= 1 && shippingCost ? shippingCost : 0

  // Disabled lines block checkout — surface them up front
  const blockedLines = cart.items.filter(
    (i) => !i.isActive || i.quantity > i.stock
  )

  const detailsValid = isAuthenticated
    ? Boolean(selectedAddressId && shippingCost != null)
    : Boolean(
        guest.name.trim() &&
          guest.phone.trim() &&
          guestAddress.street.trim() &&
          guestAddress.city.trim() &&
          guestAddress.governorate &&
          shippingCost != null
      )

  const stepValid = useMemo(() => {
    if (blockedLines.length > 0) return false
    if (step === 0) return detailsValid
    if (step === 1) return Boolean(paymentMethod)
    return true
  }, [step, detailsValid, paymentMethod, blockedLines.length])

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const placeOrder = async () => {
    const items = cart.items.map((i) => ({
      productSizeId: i.productSizeId,
      quantity: i.quantity,
    }))

    const payload = {
      paymentMethod,
      items,
      notes: notes.trim() || undefined,
      clearCart: true,
    }

    if (isAuthenticated) {
      payload.addressId = selectedAddressId
    } else {
      payload.guest = {
        name: guest.name.trim(),
        phone: guest.phone.trim(),
        ...(guest.email.trim() && { email: guest.email.trim() }),
      }
      payload.shippingAddress = {
        street: guestAddress.street.trim(),
        city: guestAddress.city.trim(),
        governorate: guestAddress.governorate,
      }
    }

    try {
      const data = await createOrder.mutateAsync(payload)
      navigate(`/order/success/${data.order.id}`, {
        replace: true,
        state: { order: data.order },
      })
    } catch {
      // error toast handled in hook
    }
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Checkout
          </h1>
          {!isAuthenticated ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Checking out as a guest.{' '}
              <Link
                to="/login"
                state={{ from: '/checkout' }}
                className="underline underline-offset-4 hover:no-underline"
              >
                Have an account? Sign in
              </Link>
            </p>
          ) : null}
        </div>
        <CheckoutSteps steps={STEPS} current={step} />
      </div>

      {blockedLines.length > 0 ? (
        <div className="mt-8 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">
              Some items in your cart can't be checked out.
            </p>
            <p className="mt-1 text-destructive/80">
              Update quantities or remove unavailable items before continuing.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/cart">Back to cart</Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {step === 0 ? (
            isAuthenticated ? (
              <UserDetailsStep
                addresses={addresses ?? []}
                isLoading={addressesLoading}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onAdd={() => setAddrDialogOpen(true)}
                shippingCost={shippingCost}
                shippingMissing={
                  Boolean(activeGovernorate) && shippingCost == null
                }
              />
            ) : (
              <GuestDetailsStep
                guest={guest}
                onGuest={setGuest}
                address={guestAddress}
                onAddress={setGuestAddress}
                shippingCost={shippingCost}
                shippingMissing={
                  Boolean(guestAddress.governorate) && shippingCost == null
                }
              />
            )
          ) : null}

          {step === 1 ? (
            <PaymentStep value={paymentMethod} onChange={setPaymentMethod} />
          ) : null}

          {step === 2 ? (
            <ReviewStep
              isAuthenticated={isAuthenticated}
              addresses={addresses ?? []}
              selectedAddressId={selectedAddressId}
              guest={guest}
              guestAddress={guestAddress}
              paymentMethod={paymentMethod}
              shippingCost={shippingCost}
              notes={notes}
              onNotes={setNotes}
            />
          ) : null}

          <Separator />

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={back}
              disabled={step === 0 || createOrder.isPending}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="lg" onClick={next} disabled={!stepValid}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={placeOrder}
                disabled={
                  !stepValid ||
                  createOrder.isPending ||
                  blockedLines.length > 0
                }
              >
                {createOrder.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Place order
              </Button>
            )}
          </div>
        </div>

        <OrderSummary items={cart.items} shipping={summaryShipping} />
      </div>

      <AddressFormDialog
        open={addrDialogOpen}
        onOpenChange={setAddrDialogOpen}
        onSaved={(saved) => saved?.id && setSelectedAddressId(saved.id)}
      />
    </div>
  )
}

/* ---------- Step 1 (auth) — Saved addresses ---------- */
function UserDetailsStep({
  addresses,
  isLoading,
  selectedId,
  onSelect,
  onAdd,
  shippingCost,
  shippingMissing,
}) {
  return (
    <section className="space-y-6">
      <Header
        icon={MapPin}
        title="Shipping address"
        subtitle="Pick where this order should go."
      />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You haven't saved any addresses yet.
          </p>
          <Button onClick={onAdd} className="mt-4">
            <Plus className="h-4 w-4" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors',
                selectedId === a.id
                  ? 'border-foreground bg-secondary/50'
                  : 'hover:border-foreground'
              )}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === a.id}
                onChange={() => onSelect(a.id)}
                className="mt-1 h-4 w-4 accent-foreground"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {a.city}, {a.governorate}
                  </p>
                  {a.isDefault ? (
                    <Badge variant="outline" className="normal-case">
                      Default
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.street}</p>
              </div>
            </label>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground hover:border-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add a new address
          </button>
        </div>
      )}

      <ShippingHint
        cost={shippingCost}
        missing={shippingMissing}
        govLabel={
          addresses.find((a) => a.id === selectedId)?.governorate
        }
      />
    </section>
  )
}

/* ---------- Step 1 (guest) — Contact + freeform address ---------- */
function GuestDetailsStep({
  guest,
  onGuest,
  address,
  onAddress,
  shippingCost,
  shippingMissing,
}) {
  return (
    <section className="space-y-8">
      <div>
        <Header
          icon={User}
          title="Your details"
          subtitle="So we can confirm and deliver your order."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="g-name">Full name</Label>
            <Input
              id="g-name"
              required
              value={guest.name}
              onChange={(e) => onGuest({ ...guest, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-phone">Phone</Label>
            <Input
              id="g-phone"
              type="tel"
              required
              value={guest.phone}
              onChange={(e) => onGuest({ ...guest, phone: e.target.value })}
              placeholder="+20 ..."
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="g-email">
              Email{' '}
              <span className="text-xs font-normal text-muted-foreground">
                (optional, for order updates)
              </span>
            </Label>
            <Input
              id="g-email"
              type="email"
              value={guest.email}
              onChange={(e) => onGuest({ ...guest, email: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <Header
          icon={MapPin}
          title="Shipping address"
          subtitle="Where should we deliver?"
        />
        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="g-street">Street address</Label>
            <Input
              id="g-street"
              required
              value={address.street}
              onChange={(e) =>
                onAddress({ ...address, street: e.target.value })
              }
              placeholder="12 El Nasr Road, Apt 5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="g-city">City / District</Label>
              <Input
                id="g-city"
                required
                value={address.city}
                onChange={(e) =>
                  onAddress({ ...address, city: e.target.value })
                }
                placeholder="New Cairo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="g-gov">Governorate</Label>
              <Select
                value={address.governorate}
                onValueChange={(v) =>
                  onAddress({ ...address, governorate: v })
                }
              >
                <SelectTrigger id="g-gov">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {GOVERNORATES.map((g) => (
                    <SelectItem key={g.slug} value={g.name}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <ShippingHint
        cost={shippingCost}
        missing={shippingMissing}
        govLabel={address.governorate}
      />
    </section>
  )
}

function ShippingHint({ cost, missing, govLabel }) {
  if (!govLabel) {
    return (
      <p className="text-xs text-muted-foreground">
        Pick a governorate and we'll calculate shipping automatically.
      </p>
    )
  }
  if (missing) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Sorry, we don't ship to {govLabel} yet.
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-md border bg-secondary/40 p-3 text-sm">
      <Truck className="h-4 w-4" />
      <span className="flex-1">Standard shipping to {govLabel}</span>
      <span className="font-semibold tabular">{formatEGP(cost)}</span>
    </div>
  )
}

/* ---------- Step 2 — Payment ---------- */
function PaymentStep({ value, onChange }) {
  return (
    <section>
      <Header
        icon={Wallet}
        title="Payment method"
        subtitle="Choose how you'd like to pay."
      />
      <div className="mt-6 space-y-3">
        <PaymentOption
          value="COD"
          current={value}
          onClick={onChange}
          icon={Wallet}
          title="Cash on Delivery"
          desc="Pay cash to the courier when your order arrives."
        />
        <PaymentOption
          value="PAYMOB"
          current={value}
          onClick={onChange}
          icon={CreditCard}
          title="Pay with Paymob"
          desc="Visa, Mastercard, Meeza — secure online payment."
          comingSoon
        />
      </div>
    </section>
  )
}

function PaymentOption({
  value,
  current,
  onClick,
  icon: Icon,
  title,
  desc,
  comingSoon,
}) {
  const active = current === value
  const disabled = Boolean(comingSoon)
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-4 rounded-md border p-4 text-left transition-colors',
        active
          ? 'border-foreground bg-secondary/50'
          : 'hover:border-foreground',
        disabled && 'cursor-not-allowed opacity-60 hover:border-border'
      )}
    >
      <span
        className={cn(
          'grid h-10 w-10 place-items-center rounded-md',
          active ? 'bg-foreground text-background' : 'bg-secondary'
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {comingSoon ? (
            <Badge variant="outline" className="normal-case">
              Coming soon
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span
        className={cn(
          'h-4 w-4 rounded-full border',
          active && 'border-[5px] border-foreground'
        )}
      />
    </button>
  )
}

/* ---------- Step 3 — Review ---------- */
function ReviewStep({
  isAuthenticated,
  addresses,
  selectedAddressId,
  guest,
  guestAddress,
  paymentMethod,
  shippingCost,
  notes,
  onNotes,
}) {
  const addr = isAuthenticated
    ? addresses.find((a) => a.id === selectedAddressId)
    : guestAddress

  return (
    <section className="space-y-6">
      <Header
        icon={Check}
        title="Review & place"
        subtitle="One last look before we send it out."
      />

      {!isAuthenticated ? (
        <ReviewSection title="Contact">
          <p className="font-medium">{guest.name}</p>
          <p className="text-sm text-muted-foreground">{guest.phone}</p>
          {guest.email ? (
            <p className="text-sm text-muted-foreground">{guest.email}</p>
          ) : null}
        </ReviewSection>
      ) : null}

      <ReviewSection title="Shipping address">
        <p className="font-medium">
          {addr?.city}, {addr?.governorate}
        </p>
        <p className="text-sm text-muted-foreground">{addr?.street}</p>
        {shippingCost != null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Standard shipping · {formatEGP(shippingCost)}
          </p>
        ) : null}
      </ReviewSection>

      <ReviewSection title="Payment">
        <p className="font-medium">
          {paymentMethod === 'PAYMOB'
            ? 'Paymob (online card)'
            : 'Cash on Delivery'}
        </p>
      </ReviewSection>

      <ReviewSection title="Order notes (optional)">
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Any special instructions for the courier?"
        />
      </ReviewSection>
    </section>
  )
}

function ReviewSection({ title, children }) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Header({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
