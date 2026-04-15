import { StarRating } from './StarRating'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/common/EmptyState'
import { MessageSquare } from 'lucide-react'

export function Reviews({ reviews = [], rating = 0, total = 0 }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to share your thoughts on this piece."
        action={<Button>Write a review</Button>}
      />
    )
  }

  return (
    <div className="grid gap-10 md:grid-cols-[260px_1fr]">
      {/* Summary */}
      <div className="space-y-4">
        <div>
          <p className="font-display text-5xl font-bold leading-none">
            {rating.toFixed(1)}
          </p>
          <StarRating value={rating} size={18} className="mt-2" />
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {total} reviews
          </p>
        </div>
        <Button variant="outline" className="w-full">
          Write a review
        </Button>
      </div>

      {/* List */}
      <ul className="space-y-6">
        {reviews.map((r, i) => (
          <li key={r.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  {r.user.firstName} {r.user.lastName}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={r.rating} size={12} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            {r.comment ? (
              <p className="mt-3 text-sm text-foreground/80">{r.comment}</p>
            ) : null}
            {i < reviews.length - 1 ? <Separator className="mt-6" /> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
