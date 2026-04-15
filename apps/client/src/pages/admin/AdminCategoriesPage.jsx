import { useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CATEGORIES } from '@/data/categories'

export default function AdminCategoriesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const startAdd = () => {
    setEditing(null)
    setOpen(true)
  }
  const startEdit = (cat) => {
    setEditing(cat)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Catalog
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {CATEGORIES.length} categories total
          </p>
        </div>
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => (
          <li
            key={c.id}
            className="group overflow-hidden rounded-lg border bg-background"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
              <img
                src={c.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                <p className="font-display text-xl font-bold">{c.name}</p>
                <p className="text-xs opacity-80">{c.productCount} products</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {c.description}
              </p>
              <div className="flex items-center justify-between border-t pt-3">
                <p className="font-mono text-xs text-muted-foreground">
                  /{c.slug}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(c)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <CategoryDialog
        open={open}
        onOpenChange={setOpen}
        category={editing}
      />
    </div>
  )
}

function CategoryDialog({ open, onOpenChange, category }) {
  const isEdit = Boolean(category)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit category' : 'Add new category'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update this category\u2019s details.'
              : 'Create a new category to organize your products.'}
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
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              defaultValue={category?.name ?? ''}
              placeholder="Shirts"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              defaultValue={category?.slug ?? ''}
              placeholder="shirts"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              rows={3}
              defaultValue={category?.description ?? ''}
              placeholder="Short description shown on the category page."
            />
          </div>
          <div className="grid gap-2">
            <Label>Cover image</Label>
            <div className="aspect-[4/3] overflow-hidden rounded-md border bg-secondary">
              {category?.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <button
                  type="button"
                  className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-secondary/80"
                >
                  <ImagePlus className="h-5 w-5" />
                  Upload cover
                </button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
