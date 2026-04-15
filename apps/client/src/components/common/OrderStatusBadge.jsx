import { Badge } from '@/components/ui/badge'

const MAP = {
  PENDING: { variant: 'warning', label: 'Pending' },
  CONFIRMED: { variant: 'info', label: 'Confirmed' },
  PROCESSING: { variant: 'info', label: 'Processing' },
  SHIPPED: { variant: 'accent', label: 'Shipped' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
  CANCELLED: { variant: 'destructive', label: 'Cancelled' },
}

export function OrderStatusBadge({ status, className }) {
  const { variant, label } = MAP[status] ?? { variant: 'outline', label: status }
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

const PAYMENT_MAP = {
  PAID: { variant: 'success', label: 'Paid' },
  UNPAID: { variant: 'warning', label: 'Unpaid' },
  REFUNDED: { variant: 'secondary', label: 'Refunded' },
  FAILED: { variant: 'destructive', label: 'Failed' },
}

export function PaymentStatusBadge({ status, className }) {
  const { variant, label } = PAYMENT_MAP[status] ?? {
    variant: 'outline',
    label: status,
  }
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
