/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-undef */
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
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
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories'

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const startAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const startEdit = (cat) => {
    setEditing(cat)
    setFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
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
            {categories.length} categories total
          </p>
        </div>
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <li
            key={c.id}
            className="group overflow-hidden rounded-lg border bg-background"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-secondary">
              <img
                src={c.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-foreground/60 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-background">
                <p className="font-display text-xl font-bold">{c.name}</p>
                <p className="text-xs opacity-80">
                  {c._count?.products ?? 0} products
                </p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {c.description || (
                  <span className="italic opacity-60">No description</span>
                )}
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
                    onClick={() => setConfirmDelete(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {categories.length === 0 ? (
        <p className="rounded-lg border bg-background p-10 text-center text-sm text-muted-foreground">
          No categories yet. Create one to get started.
        </p>
      ) : null}

      <CategoryDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />

      <DeleteCategoryDialog
        category={confirmDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function CategoryDialog({ open, onOpenChange, category }) {
  const isEdit = Boolean(category)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const submitting = createMutation.isPending || updateMutation.isPending

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Sync form when dialog opens/category changes
  useEffect(() => {
    if (!open) return
    setName(category?.name ?? '')
    setDescription(category?.description ?? '')
    setImageFile(null)
    setPreviewUrl(null)
  }, [open, category])

  // Manage blob URL lifecycle so we don't leak memory
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
          id: category.id,
          name: name !== category.name ? name : undefined,
          description:
            description !== (category.description ?? '')
              ? description
              : undefined,
          imageFile: imageFile ?? undefined,
        })
      } else {
        if (!imageFile) return // the server requires an image on create; mirror that on the client
        await createMutation.mutateAsync({ name, description, imageFile })
      }
      onOpenChange(false)
    } catch {
      // error toast handled by the hook
    }
  }

  const displayedImage = previewUrl || category?.imageUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shirts"
              required
            />
            <p className="text-xs text-muted-foreground">
              Slug will be generated from the name.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown on the category page."
            />
          </div>

          <div className="grid gap-2">
            <Label>Cover image {isEdit ? '(optional)' : ''}</Label>
            <div className="relative h-40 overflow-hidden rounded-md border bg-secondary">
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Create category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteCategoryDialog({ category, onClose }) {
  const deleteMutation = useDeleteCategory()

  const onConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(category.id)
      onClose()
    } catch {
      // error toast handled by hook; keep dialog open so user can read reason
    }
  }

  return (
    <Dialog open={Boolean(category)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete category?</DialogTitle>
          <DialogDescription>
            You\u2019re about to delete{' '}
            <span className="font-semibold">{category?.name}</span>. This action
            can\u2019t be undone. Categories with products can\u2019t be
            deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
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
  )
}
