/* eslint-disable no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate, useParams } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ImagePlus,
  Loader2,
  Palette,
  Pencil,
  Power,
  Ruler,
  Save,
  Trash2,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAdminCategories } from '@/hooks/useCategories'
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/useProducts'
import {
  useAddColor,
  useUpdateColor,
  useDeleteColor,
  useAddSize,
  useUpdateSize,
  useDeleteSize,
} from '@/hooks/useVariants'

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = id && id !== 'new'
  const { data: product, isLoading: productLoading } = useAdminProduct(
    isEdit ? id : null
  )
  const { data: categories = [] } = useAdminCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const submitting = createMutation.isPending || updateMutation.isPending

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Sync form fields when product loads
  useEffect(() => {
    if (!product) return
    setName(product.name ?? '')
    setDescription(product.description ?? '')
    setPrice(product.price ?? '')
    setComparePrice(product.comparePrice ?? '')
    setSku(product.sku ?? '')
    setIsActive(product.isActive ?? true)
  }, [product])

  // Sync the selected category only once the categories list is loaded —
  // Radix Select will otherwise silently fall back to the placeholder when
  // value is set before a matching SelectItem exists.
  useEffect(() => {
    if (!product || categories.length === 0) return
    setCategoryId(product.categoryId ?? '')
  }, [product, categories])

  // Manage blob URL lifecycle
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id,
          name: name !== product.name ? name : undefined,
          description:
            description !== (product.description ?? '')
              ? description
              : undefined,
          price: String(price) !== String(product.price) ? price : undefined,
          comparePrice:
            String(comparePrice) !== String(product.comparePrice ?? '')
              ? comparePrice || null
              : undefined,
          sku: sku !== (product.sku ?? '') ? sku : undefined,
          categoryId:
            categoryId !== product.categoryId ? categoryId : undefined,
          isActive: isActive !== product.isActive ? isActive : undefined,
          imageFile: imageFile ?? undefined,
        })
      } else {
        if (!imageFile) return
        await createMutation.mutateAsync({
          name,
          description,
          price,
          comparePrice: comparePrice || undefined,
          sku: sku || undefined,
          categoryId,
          imageFile,
        })
      }
      navigate('/admin/products')
    } catch {
      // error toast handled by hook
    }
  }

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const displayedImage = previewUrl || product?.imageUrl

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All products
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            {isEdit ? (product?.name ?? 'Edit product') : 'New product'}
          </h1>
          {product?.sku ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              SKU {product.sku}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? 'Save changes' : 'Create product'}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Basic info */}
          <Section title="Basics" subtitle="Name, description and URL slug">
            <div className="grid gap-5">
              <Field label="Name" htmlFor="name">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tahrir Heavyweight Tee"
                  required
                />
              </Field>
              <Field label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pre-washed heavyweight cotton, boxy street fit…"
                />
              </Field>
            </div>
          </Section>

          {/* Cover image */}
          <Section
            title="Cover image"
            subtitle={
              isEdit
                ? 'Change the main product image.'
                : 'Upload the main product image.'
            }
          >
            <div className="relative h-48 overflow-hidden rounded-md border bg-secondary">
              {displayedImage ? (
                <>
                  <img
                    src={displayedImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 grid place-items-center bg-foreground/0 text-sm font-medium text-background opacity-0 transition-opacity hover:bg-foreground/60 hover:opacity-100"
                  >
                    Change image
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-secondary/80"
                >
                  <ImagePlus className="h-5 w-5" />
                  Upload cover
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing" subtitle="Prices are in EGP.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Price" htmlFor="price">
                <div className="flex items-stretch overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="grid place-items-center border-r bg-muted px-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    EGP
                  </span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </Field>
              <Field
                label="Compare-at price"
                htmlFor="comparePrice"
                hint="Shows as a strikethrough when set."
              >
                <div className="flex items-stretch overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="grid place-items-center border-r bg-muted px-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    EGP
                  </span>
                  <Input
                    id="comparePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="0.00"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* Colors & Sizes — only when editing (needs product ID) */}
          {isEdit && (
            <ColorsSection productId={id} colors={product?.colors ?? []} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Section title="Status" compact>
            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Visible in the store
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-foreground"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </label>
          </Section>

          <Section title="Organization" compact>
            <div className="grid gap-4">
              <Field label="Category" htmlFor="category">
                {categories.length === 0 ? (
                  <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                    Loading categories…
                  </div>
                ) : (
                  <Select
                    key={isEdit ? `cat-${id}-${categories.length}` : 'cat-new'}
                    value={categoryId}
                    onValueChange={setCategoryId}
                  >
                    <SelectTrigger id="category">
                      <SelectValue
                        placeholder={
                          product?.category?.name ?? 'Select category'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <Field label="SKU" htmlFor="sku">
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="CS-SH-001"
                />
              </Field>
            </div>
          </Section>
        </aside>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button asChild type="button" variant="outline">
          <Link to="/admin/products">Cancel</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? 'Save changes' : 'Create product'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// ── Colors & Sizes management ──────────────────────────

function ColorsSection({ productId, colors }) {
  const [addColorOpen, setAddColorOpen] = useState(false)
  const [editColor, setEditColor] = useState(null)
  const [addSizeFor, setAddSizeFor] = useState(null)
  const [confirmDeleteColor, setConfirmDeleteColor] = useState(null)
  const [expanded, setExpanded] = useState(() => new Set())

  const toggleExpanded = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const deleteColorMutation = useDeleteColor()
  const updateColorMutation = useUpdateColor()
  const deleteSizeMutation = useDeleteSize()
  const updateSizeMutation = useUpdateSize()

  return (
    <Section
      title="Colors & Sizes"
      subtitle="Manage color variants, each with its own sizes and stock."
    >
      <div className="space-y-3">
        {colors.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            No colors yet. Add one to start managing sizes and stock.
          </div>
        ) : null}

        {colors.map((color) => {
          const isOpen = expanded.has(color.id)
          return (
            <div
              key={color.id}
              className={`rounded-lg border bg-background${!color.isActive ? ' opacity-60' : ''}`}
            >
              {/* Color header — click to toggle */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(color.id)}
                  aria-expanded={isOpen}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src={color.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{color.name}</p>
                      {color.hex && (
                        <span
                          className="inline-block h-4 w-4 shrink-0 rounded-full border"
                          style={{ backgroundColor: color.hex }}
                        />
                      )}
                      <Badge
                        variant={color.isActive ? 'success' : 'destructive'}
                      >
                        {color.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {color.sizes?.length ?? 0} sizes
                      {color.images?.length
                        ? ` · ${color.images.length} gallery images`
                        : ''}
                    </p>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={color.isActive ? 'Deactivate' : 'Activate'}
                    onClick={() =>
                      updateColorMutation.mutate({
                        productId,
                        colorId: color.id,
                        isActive: !color.isActive,
                      })
                    }
                    disabled={updateColorMutation.isPending}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Edit color"
                    onClick={() => setEditColor(color)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Delete color"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDeleteColor(color)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Collapsible body */}
              {isOpen && (
                <div className="border-t px-4 py-3">
                  {color.sizes && color.sizes.length > 0 ? (
                    <div className="overflow-hidden rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">
                              Size
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              Stock
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              Price
                            </th>
                            <th className="px-3 py-2 text-left font-medium">
                              SKU
                            </th>
                            <th className="px-3 py-2 text-center font-medium">
                              Status
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {color.sizes.map((sz) => (
                            <SizeRow
                              key={sz.id}
                              productId={productId}
                              color={color}
                              size={sz}
                              updateMutation={updateSizeMutation}
                              deleteMutation={deleteSizeMutation}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No sizes yet for this color.
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setAddSizeFor(color)}
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    Add size
                  </Button>
                </div>
              )}
            </div>
          )
        })}

        <Button
          type="button"
          variant="default"
          className="w-full sm:w-auto"
          onClick={() => setAddColorOpen(true)}
        >
          <Palette className="h-4 w-4" />
          Add color
        </Button>
      </div>

      <AddColorDialog
        open={addColorOpen}
        onOpenChange={setAddColorOpen}
        productId={productId}
      />

      <EditColorDialog
        color={editColor}
        onClose={() => setEditColor(null)}
        productId={productId}
      />

      <AddSizeDialog
        color={addSizeFor}
        onClose={() => setAddSizeFor(null)}
        productId={productId}
      />

      {/* Delete color confirm */}
      <Dialog
        open={Boolean(confirmDeleteColor)}
        onOpenChange={(v) => !v && setConfirmDeleteColor(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete color?</DialogTitle>
            <DialogDescription>
              Delete{' '}
              <span className="font-semibold">{confirmDeleteColor?.name}</span>{' '}
              and all its sizes. Colors that have been ordered cannot be
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteColor(null)}
              disabled={deleteColorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteColorMutation.isPending}
              onClick={async () => {
                try {
                  await deleteColorMutation.mutateAsync({
                    productId,
                    colorId: confirmDeleteColor.id,
                  })
                  setConfirmDeleteColor(null)
                } catch {
                  // toast in hook
                }
              }}
            >
              {deleteColorMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  )
}

function SizeRow({
  productId,
  color,
  size: sz,
  updateMutation,
  deleteMutation,
}) {
  const [editing, setEditing] = useState(false)
  const [stock, setStock] = useState(String(sz.stock))
  const [price, setPrice] = useState(sz.price ?? '')
  const [sku, setSku] = useState(sz.sku ?? '')

  const save = async () => {
    try {
      await updateMutation.mutateAsync({
        productId,
        colorId: color.id,
        sizeId: sz.id,
        stock: Number(stock),
        price: price ? Number(price) : null,
        sku: sku || null,
      })
      setEditing(false)
    } catch {
      // toast in hook
    }
  }

  if (editing) {
    return (
      <tr className="border-t">
        <td className="px-3 py-2 font-medium">{sz.size}</td>
        <td className="px-3 py-2">
          <Input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-8 w-20 ml-auto text-right"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-8 w-24 ml-auto text-right"
            placeholder="—"
          />
        </td>
        <td className="px-3 py-2">
          <Input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="h-8 w-28"
            placeholder="—"
          />
        </td>
        <td />
        <td className="px-3 py-2">
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={save}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className={`border-t${!sz.isActive ? ' opacity-50' : ''}`}>
      <td className="px-3 py-2 font-medium">{sz.size}</td>
      <td className="px-3 py-2 text-right tabular">{sz.stock}</td>
      <td className="px-3 py-2 text-right tabular">{sz.price ?? '—'}</td>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
        {sz.sku ?? '—'}
      </td>
      <td className="px-3 py-2 text-center">
        <Badge
          variant={sz.isActive ? 'success' : 'destructive'}
          className="text-[10px]"
        >
          {sz.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              updateMutation.mutate({
                productId,
                colorId: color.id,
                sizeId: sz.id,
                isActive: !sz.isActive,
              })
            }
            disabled={updateMutation.isPending}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() =>
              deleteMutation.mutate({
                productId,
                colorId: color.id,
                sizeId: sz.id,
              })
            }
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function AddColorDialog({ open, onOpenChange, productId }) {
  const addMutation = useAddColor()
  const [name, setName] = useState('')
  const [hex, setHex] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const fileRef = useRef(null)
  const galleryRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setHex('')
    setImageFile(null)
    setPreviewUrl(null)
    setGalleryFiles([])
    setGalleryPreviews([])
  }, [open])

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    const urls = galleryFiles.map((f) => URL.createObjectURL(f))
    setGalleryPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [galleryFiles])

  const onSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!imageFile) return
    try {
      await addMutation.mutateAsync({
        productId,
        name,
        hex: hex || undefined,
        imageFile,
        galleryFiles: galleryFiles.length ? galleryFiles : undefined,
      })
      onOpenChange(false)
    } catch {
      // toast in hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add color</DialogTitle>
          <DialogDescription>
            Add a new color variant to this product.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="color-name">Color name</Label>
            <Input
              id="color-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Black"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color-hex">Hex code (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color-hex"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                placeholder="#000000"
              />
              {hex && (
                <span
                  className="h-8 w-8 shrink-0 rounded-md border"
                  style={{ backgroundColor: hex }}
                />
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Cover image</Label>
            <div className="relative h-32 overflow-hidden rounded-md border bg-secondary">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 grid place-items-center bg-foreground/0 text-sm font-medium text-background opacity-0 transition-opacity hover:bg-foreground/60 hover:opacity-100"
                  >
                    Change
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-secondary/80"
                >
                  <ImagePlus className="h-5 w-5" />
                  Upload cover
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setImageFile(f)
                }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Gallery images (optional, up to 5)</Label>
            <div className="grid grid-cols-5 gap-2">
              {galleryPreviews.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-secondary"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryFiles((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {galleryFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-secondary/80"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setGalleryFiles((prev) => [...prev, ...files].slice(0, 5))
                e.target.value = ''
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add color'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditColorDialog({ color, onClose, productId }) {
  const updateMutation = useUpdateColor()
  const [name, setName] = useState('')
  const [hex, setHex] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const fileRef = useRef(null)
  const galleryRef = useRef(null)

  useEffect(() => {
    if (!color) return
    setName(color.name ?? '')
    setHex(color.hex ?? '')
    setImageFile(null)
    setPreviewUrl(null)
    setGalleryFiles([])
    setGalleryPreviews([])
  }, [color])

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    const urls = galleryFiles.map((f) => URL.createObjectURL(f))
    setGalleryPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [galleryFiles])

  const displayImage = previewUrl || color?.imageUrl
  // If user is uploading new gallery files, show those. Otherwise show the existing ones from the server.
  const showNewGallery = galleryFiles.length > 0
  const existingGallery = color?.images ?? []

  const onSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await updateMutation.mutateAsync({
        productId,
        colorId: color.id,
        name: name !== color.name ? name : undefined,
        hex: hex !== (color.hex ?? '') ? hex || null : undefined,
        imageFile: imageFile ?? undefined,
        galleryFiles: galleryFiles.length ? galleryFiles : undefined,
      })
      onClose()
    } catch {
      // toast in hook
    }
  }

  return (
    <Dialog open={Boolean(color)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit color</DialogTitle>
          <DialogDescription>
            Update color details for {color?.name}.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="edit-color-name">Color name</Label>
            <Input
              id="edit-color-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-color-hex">Hex code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="edit-color-hex"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                placeholder="#000000"
              />
              {hex && (
                <span
                  className="h-8 w-8 shrink-0 rounded-md border"
                  style={{ backgroundColor: hex }}
                />
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Cover image</Label>
            <div className="relative h-32 overflow-hidden rounded-md border bg-secondary">
              {displayImage ? (
                <>
                  <img
                    src={displayImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute inset-0 grid place-items-center bg-foreground/0 text-sm font-medium text-background opacity-0 transition-opacity hover:bg-foreground/60 hover:opacity-100"
                  >
                    Change
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-secondary/80"
                >
                  <ImagePlus className="h-5 w-5" />
                  Upload cover
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setImageFile(f)
                }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Gallery images</Label>
            {showNewGallery ? (
              <p className="text-xs text-amber-600">
                Uploading new gallery will replace all existing gallery images.
              </p>
            ) : existingGallery.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Current gallery ({existingGallery.length}). Upload new files to
                replace all.
              </p>
            ) : null}
            <div className="grid grid-cols-5 gap-2">
              {showNewGallery
                ? galleryPreviews.map((url, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-md border bg-secondary"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryFiles((prev) =>
                            prev.filter((_, j) => j !== i)
                          )
                        }
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                : existingGallery.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-md border bg-secondary"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
              {((showNewGallery && galleryFiles.length < 5) ||
                (!showNewGallery && existingGallery.length < 5)) && (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-secondary/80"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setGalleryFiles((prev) => [...prev, ...files].slice(0, 5))
                e.target.value = ''
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddSizeDialog({ color, onClose, productId }) {
  const addMutation = useAddSize()
  const [size, setSize] = useState('')
  const [stock, setStock] = useState('0')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    if (!color) return
    setSize('')
    setStock('0')
    setSku('')
    setPrice('')
  }, [color])

  const onSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addMutation.mutateAsync({
        productId,
        colorId: color.id,
        size,
        stock: Number(stock),
        sku: sku || undefined,
        price: price ? Number(price) : undefined,
      })
      onClose()
    } catch {
      // toast in hook
    }
  }

  return (
    <Dialog open={Boolean(color)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add size to {color?.name}</DialogTitle>
          <DialogDescription>
            Add a size variant with stock level.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="size-label">Size</Label>
              <Input
                id="size-label"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="M"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size-stock">Stock</Label>
              <Input
                id="size-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="size-sku">SKU (optional)</Label>
              <Input
                id="size-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="CS-BLK-M"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size-price">Price override (optional)</Label>
              <Input
                id="size-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="—"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={addMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add size'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Shared layout helpers ──────────────────────────────

function Section({ title, subtitle, compact, children }) {
  return (
    <section
      className={'rounded-lg border bg-background ' + (compact ? 'p-4' : 'p-6')}
    >
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className={compact ? 'mt-3' : 'mt-5'}>{children}</div>
    </section>
  )
}

function Field({ label, htmlFor, hint, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
