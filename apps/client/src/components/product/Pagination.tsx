import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pagination({ page = 1, totalPages = 1, onChange = () => {} }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <PagBtn
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PagBtn>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'grid h-9 w-9 place-items-center rounded-md text-sm tabular transition-colors',
            p === page
              ? 'bg-foreground text-background'
              : 'hover:bg-secondary'
          )}
        >
          {p}
        </button>
      ))}

      <PagBtn
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        ariaLabel="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PagBtn>
    </nav>
  )
}

function PagBtn({ children, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
