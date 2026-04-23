/* eslint-disable react-hooks/set-state-in-effect */
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Power,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pagination } from '@/components/product/Pagination'
import {
  useAdminProducts,
  useDeleteProduct,
  useForceDeleteProduct,
  useToggleProductActive,
} from '@/hooks/useProducts'
import { useAdminCategories } from '@/hooks/useCategories'
import { formatEGP } from '@/lib/utils'

const PAGE_SIZE = 20

export default function AdminProductsPage() {
  const { data: categories = [] } = useAdminCategories()

  // Filter state — local, ephemeral. No URL sync for admin.
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('') // debounced
  const [cat, setCat] = useState('all')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmForceDelete, setConfirmForceDelete] = useState(null)

  // Debounce search input → server query (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1) // any search change goes back to page 1
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset to page 1 when category changes
  useEffect(() => {
    setPage(1)
  }, [cat])

  const filters = {
    page,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(cat !== 'all' && { category: cat }),
  }

  const { data, isLoading, isFetching } = useAdminProducts(filters)
  const products = data?.products ?? []
  const pagination = data?.pagination

  const deleteMutation = useDeleteProduct()
  const forceDeleteMutation = useForceDeleteProduct()
  const toggleMutation = useToggleProductActive()

  // If we deleted the last item on a non-first page, drop back one page
  useEffect(() => {
    if (!isLoading && products.length === 0 && page > 1) {
      setPage((p) => p - 1)
    }
  }, [isLoading, products.length, page])

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.id)
      setConfirmDelete(null)
    } catch {
      // toast handled in hook; leave dialog open so user sees the reason
    }
  }

  const handleConfirmForceDelete = async () => {
    try {
      await forceDeleteMutation.mutateAsync(confirmForceDelete.id)
      setConfirmForceDelete(null)
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination
              ? `${products.length} of ${pagination.total} products`
              : 'Loading…'}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-background p-4">
        <div className="relative min-w-55 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or description…"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFetching && !isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No products match your filters.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow
                  key={p.id}
                  className={!p.isActive ? 'opacity-50' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {p.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.category?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular">
                    {formatEGP(p.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? 'success' : 'destructive'}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={p.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() =>
                          toggleMutation.mutate({
                            id: p.id,
                            isActive: !p.isActive,
                          })
                        }
                        disabled={toggleMutation.isPending}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                      >
                        <Link to={`/admin/products/${p.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete"
                        onClick={() => setConfirmDelete(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label="Force delete"
                        onClick={() => setConfirmForceDelete(p)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={setPage}
        />
      ) : null}

      {/* Delete confirm */}
      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              You are about to delete{' '}
              <span className="font-semibold">{confirmDelete?.name}</span>. This
              soft-deletes it — the product is hidden from the store and from
              admin. Existing orders keep their item history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force-delete confirm */}
      <Dialog
        open={Boolean(confirmForceDelete)}
        onOpenChange={(v) => !v && setConfirmForceDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete product?</DialogTitle>
            <DialogDescription>
              You are about to <strong>permanently</strong> delete{' '}
              <span className="font-semibold">{confirmForceDelete?.name}</span>.
              This removes all data and images. Products that appear in existing
              orders cannot be force-deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmForceDelete(null)}
              disabled={forceDeleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmForceDelete}
              disabled={forceDeleteMutation.isPending}
            >
              {forceDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Force delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
