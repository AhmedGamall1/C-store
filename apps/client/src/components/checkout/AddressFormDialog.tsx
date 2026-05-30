import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GOVERNORATES } from '@/data/user'
import { useCreateAddress, useUpdateAddress } from '@/hooks/useAddresses'

const empty = { street: '', city: '', governorate: '', isDefault: false }

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSaved,
}) {
  const isEdit = Boolean(address)
  const create = useCreateAddress()
  const update = useUpdateAddress()
  const pending = create.isPending || update.isPending

  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (open) {
      setForm(
        address
          ? {
              street: address.street ?? '',
              city: address.city ?? '',
              governorate: address.governorate ?? '',
              isDefault: Boolean(address.isDefault),
            }
          : empty
      )
    }
  }, [open, address])

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e?.target ? e.target.value : e,
    }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.street.trim() || !form.city.trim() || !form.governorate) return
    try {
      const saved = isEdit
        ? await update.mutateAsync({ id: address.id, ...form })
        : await create.mutateAsync(form)
      onSaved?.(saved)
      onOpenChange(false)
    } catch {
      // error toast handled in hooks; keep dialog open
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit address' : 'Add a new address'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details for this saved address.'
              : 'This address will be available at checkout.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="street">Street address</Label>
            <Input
              id="street"
              required
              value={form.street}
              onChange={set('street')}
              placeholder="12 El Nasr Road, Apt 5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="city">City / District</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={set('city')}
                placeholder="New Cairo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gov">Governorate</Label>
              <Select
                value={form.governorate}
                onValueChange={set('governorate')}
              >
                <SelectTrigger id="gov">
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-foreground"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
            />
            Set as default address
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Add address'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
