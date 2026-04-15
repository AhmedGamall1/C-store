import { useState } from 'react'
import { MapPin, Plus, Star, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ADDRESSES, GOVERNORATES } from '@/data/user'
import { cn } from '@/lib/utils'

export default function AddressesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const startAdd = () => {
    setEditing(null)
    setOpen(true)
  }
  const startEdit = (addr) => {
    setEditing(addr)
    setOpen(true)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Saved addresses
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to 5 addresses to speed up checkout.
          </p>
        </div>
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4" />
          New address
        </Button>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {ADDRESSES.map((a) => (
          <li
            key={a.id}
            className={cn(
              'rounded-lg border p-5 transition-colors',
              a.isDefault && 'border-foreground'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-secondary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {a.city}, {a.governorate}
                    {a.isDefault ? (
                      <Badge variant="outline" className="gap-1 normal-case">
                        <Star className="h-3 w-3" />
                        Default
                      </Badge>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.street}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t pt-4">
              {!a.isDefault ? (
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4" />
                  Set default
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => startEdit(a)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {!a.isDefault ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <AddressDialog
        open={open}
        onOpenChange={setOpen}
        address={editing}
      />
    </div>
  )
}

function AddressDialog({ open, onOpenChange, address }) {
  const isEdit = Boolean(address)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            onOpenChange(false)
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="street">Street address</Label>
            <Input
              id="street"
              defaultValue={address?.street ?? ''}
              placeholder="12 El Nasr Road, Apt 5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="city">City / District</Label>
              <Input
                id="city"
                defaultValue={address?.city ?? ''}
                placeholder="New Cairo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gov">Governorate</Label>
              <Select defaultValue={address?.governorate?.toLowerCase()}>
                <SelectTrigger id="gov">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {GOVERNORATES.map((g) => (
                    <SelectItem key={g.slug} value={g.name.toLowerCase()}>
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
              defaultChecked={address?.isDefault}
            />
            Set as default address
          </label>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Save changes' : 'Add address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
