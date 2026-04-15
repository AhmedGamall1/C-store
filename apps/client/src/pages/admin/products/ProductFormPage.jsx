import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ImagePlus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { PRODUCTS } from '@/data/products'
import { CATEGORIES } from '@/data/categories'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = id && id !== 'new'
  const product = isEdit ? PRODUCTS.find((p) => p.id === id) : null

  const onSubmit = (e) => {
    e.preventDefault()
    navigate('/admin/products')
  }

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
            {isEdit ? product?.name ?? 'Edit product' : 'New product'}
          </h1>
          {product ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              SKU {product.sku}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {isEdit ? (
            <Button variant="outline" className="text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
          <Button type="submit">
            <Save className="h-4 w-4" />
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Basic info */}
          <Section title="Basics" subtitle="Name, description and URL slug">
            <div className="grid gap-5">
              <Field label="Name" htmlFor="name">
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name}
                  placeholder="Tahrir Heavyweight Tee"
                  required
                />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                hint="Lowercase, URL-safe. Used in the product URL."
              >
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={product?.slug}
                  placeholder="tahrir-heavyweight-tee"
                />
              </Field>
              <Field label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={product?.description}
                  placeholder="Pre-washed heavyweight cotton, boxy street fit…"
                />
              </Field>
            </div>
          </Section>

          {/* Images */}
          <Section title="Images" subtitle="First image is the cover.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(product?.images ?? Array(4).fill(null)).map((src, i) => (
                <div
                  key={i}
                  className="aspect-product relative overflow-hidden rounded-md border bg-secondary"
                >
                  {src ? (
                    <>
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-destructive hover:bg-background"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-secondary/80"
                    >
                      <ImagePlus className="h-5 w-5" />
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Pricing */}
          <Section title="Pricing" subtitle="Prices are in EGP.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Price" htmlFor="price">
                <div className="relative">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    defaultValue={product?.price ?? ''}
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    EGP
                  </span>
                </div>
              </Field>
              <Field
                label="Compare-at price"
                htmlFor="comparePrice"
                hint="Shows as a strikethrough when set."
              >
                <div className="relative">
                  <Input
                    id="comparePrice"
                    name="comparePrice"
                    type="number"
                    min="0"
                    defaultValue={product?.comparePrice ?? ''}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    EGP
                  </span>
                </div>
              </Field>
            </div>
          </Section>

          {/* Variants */}
          <Section title="Sizes" subtitle="Toggle the sizes you stock.">
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const active = product?.sizes?.includes(size)
                return (
                  <label
                    key={size}
                    className={
                      'cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-colors ' +
                      (active
                        ? 'border-foreground bg-foreground text-background'
                        : 'hover:border-foreground')
                    }
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      defaultChecked={active}
                    />
                    {size}
                  </label>
                )
              })}
            </div>
          </Section>
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
                defaultChecked={product?.isActive ?? true}
              />
            </label>
          </Section>

          <Section title="Organization" compact>
            <div className="grid gap-4">
              <Field label="Category" htmlFor="category">
                <Select defaultValue={product?.category.slug}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="SKU" htmlFor="sku">
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku}
                  placeholder="CS-SH-001"
                />
              </Field>
              <Field
                label="Tag"
                htmlFor="tag"
                hint="e.g. Bestseller, New, Low Stock"
              >
                <Input id="tag" name="tag" defaultValue={product?.tag ?? ''} />
              </Field>
            </div>
          </Section>

          <Section title="Inventory" compact>
            <Field label="Stock" htmlFor="stock">
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={product?.stock ?? 0}
                required
              />
            </Field>
          </Section>
        </aside>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button asChild type="button" variant="outline">
          <Link to="/admin/products">Cancel</Link>
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4" />
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}

function Section({ title, subtitle, compact, children }) {
  return (
    <section
      className={
        'rounded-lg border bg-background ' + (compact ? 'p-4' : 'p-6')
      }
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
