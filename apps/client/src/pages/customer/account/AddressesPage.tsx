import { useState } from 'react'
import {
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/common/EmptyState'
import { AddressFormDialog } from '@/components/checkout/AddressFormDialog'
import {
  useDeleteAddress,
  useMyAddresses,
  useSetDefaultAddress,
} from '@/hooks/useAddresses'
import { cn } from '@/lib/utils'

export default function AddressesPage() {
  const { data: addresses = [], isLoading } = useMyAddresses()
  const setDefault = useSetDefaultAddress()
  const remove = useDeleteAddress()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const startAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const startEdit = (addr) => {
    setEditing(addr)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(confirmDelete.id)
      setConfirmDelete(null)
    } catch {
      // toast handled in hook
    }
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

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={MapPin}
            title="No addresses saved yet"
            description="Add your first address so checkout is one tap."
            action={
              <Button onClick={startAdd}>
                <Plus className="h-4 w-4" />
                Add address
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefault.mutate(a.id)}
                    disabled={setDefault.isPending}
                  >
                    <Star className="h-4 w-4" />
                    Set default
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(a)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                {!a.isDefault ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(a)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        address={editing}
      />

      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(v) => !remove.isPending && !v && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this address?</DialogTitle>
            <DialogDescription>
              {confirmDelete
                ? `${confirmDelete.street} — ${confirmDelete.city}, ${confirmDelete.governorate}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={remove.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
