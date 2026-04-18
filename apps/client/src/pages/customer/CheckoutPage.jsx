import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
  Truck,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { ADDRESSES, GOVERNORATES } from '@/data/user'
import { cn, formatEGP } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
const STEPS = ['Address', 'Shipping', 'Payment', 'Review']

export default function CheckoutPage() {
  const { cart, isLoading } = useCart()
  const [step, setStep] = useState(0)
  const [addressId, setAddressId] = useState(ADDRESSES[0]?.id)
  const [shippingGov, setShippingGov] = useState('cairo')
  const [paymentMethod, setPaymentMethod] = useState('PAYMOB')
  const navigate = useNavigate()
  if (!isLoading && cart.items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const shippingCost =
    GOVERNORATES.find((g) => g.slug === shippingGov)?.cost ?? 30

  const next = () => {
    if (step === STEPS.length - 1) {
      navigate('/order/success/ord-demo-1234')
    } else setStep((s) => s + 1)
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Checkout
        </h1>
        <CheckoutSteps steps={STEPS} current={step} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {step === 0 ? (
            <AddressStep addressId={addressId} onChange={setAddressId} />
          ) : null}
          {step === 1 ? (
            <ShippingStep value={shippingGov} onChange={setShippingGov} />
          ) : null}
          {step === 2 ? (
            <PaymentStep value={paymentMethod} onChange={setPaymentMethod} />
          ) : null}
          {step === 3 ? (
            <ReviewStep
              address={ADDRESSES.find((a) => a.id === addressId)}
              paymentMethod={paymentMethod}
            />
          ) : null}

          <Separator />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button size="lg" onClick={next}>
              {step === STEPS.length - 1 ? 'Place Order' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <OrderSummary
          items={cart.items}
          shipping={step >= 1 ? shippingCost : 0}
        />
      </div>
    </div>
  )
}

/* ---------- Step 1 — Address ---------- */
function AddressStep({ addressId, onChange }) {
  return (
    <section>
      <Header
        icon={MapPin}
        title="Shipping Address"
        subtitle="Where should we send it?"
      />
      <div className="mt-6 space-y-3">
        {ADDRESSES.map((a) => (
          <label
            key={a.id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors',
              addressId === a.id
                ? 'border-foreground bg-secondary/50'
                : 'hover:border-foreground'
            )}
          >
            <input
              type="radio"
              name="address"
              checked={addressId === a.id}
              onChange={() => onChange(a.id)}
              className="mt-1 h-4 w-4 accent-foreground"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {a.city}, {a.governorate}
                </p>
                {a.isDefault ? (
                  <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                    Default
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.street}</p>
            </div>
          </label>
        ))}

        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground hover:border-foreground hover:text-foreground">
          + Add new address
        </button>
      </div>
    </section>
  )
}

/* ---------- Step 2 — Shipping ---------- */
function ShippingStep({ value, onChange }) {
  return (
    <section>
      <Header
        icon={Truck}
        title="Shipping Method"
        subtitle="Rates vary by governorate."
      />
      <div className="mt-6 space-y-3">
        <div>
          <Label className="text-xs uppercase tracking-wider">Deliver to</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.slug} value={g.slug}>
                  {g.name} — {formatEGP(g.cost)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Standard shipping</p>
              <p className="text-xs text-muted-foreground">
                2–6 business days · Tracking included
              </p>
            </div>
            <p className="font-semibold tabular">
              {formatEGP(
                GOVERNORATES.find((g) => g.slug === value)?.cost ?? 30
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Step 3 — Payment ---------- */
function PaymentStep({ value, onChange }) {
  return (
    <section>
      <Header
        icon={Wallet}
        title="Payment Method"
        subtitle="Pay online with Paymob or on delivery."
      />
      <div className="mt-6 space-y-3">
        <PaymentOption
          value="PAYMOB"
          current={value}
          onClick={onChange}
          icon={CreditCard}
          title="Pay with Paymob"
          desc="Visa, Mastercard, Meeza — secure iframe payment."
        />
        <PaymentOption
          value="COD"
          current={value}
          onClick={onChange}
          icon={Wallet}
          title="Cash on Delivery"
          desc="Pay cash to the driver when your order arrives."
        />
      </div>
    </section>
  )
}

function PaymentOption({ value, current, onClick, icon: Icon, title, desc }) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        'flex w-full items-center gap-4 rounded-md border p-4 text-left transition-colors',
        active ? 'border-foreground bg-secondary/50' : 'hover:border-foreground'
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
        <p className="font-medium">{title}</p>
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

/* ---------- Step 4 — Review ---------- */
function ReviewStep({ address, paymentMethod }) {
  return (
    <section className="space-y-6">
      <Header
        icon={CreditCard}
        title="Review & Place"
        subtitle="Last check before we ship it out."
      />

      <ReviewSection title="Shipping Address">
        <p>
          {address?.city}, {address?.governorate}
        </p>
        <p className="text-sm text-muted-foreground">{address?.street}</p>
      </ReviewSection>

      <ReviewSection title="Payment">
        <p>
          {paymentMethod === 'PAYMOB'
            ? 'Paymob (online card)'
            : 'Cash on Delivery'}
        </p>
      </ReviewSection>

      <ReviewSection title="Order Notes (optional)">
        <Textarea placeholder="Any special instructions for the courier?" />
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
