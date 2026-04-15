import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/data/categories'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function ProductFilters() {
  const [selectedCat, setSelectedCat] = useState('all')
  const [selectedSizes, setSelectedSizes] = useState([])

  const toggleSize = (s) =>
    setSelectedSizes((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    )

  return (
    <aside className="space-y-6 text-sm">
      <Section title="Category">
        <ul className="space-y-1.5">
          {[{ slug: 'all', name: 'All products' }, ...CATEGORIES].map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setSelectedCat(c.slug)}
                className={
                  'flex w-full items-center justify-between rounded-sm px-2 py-1 text-left transition-colors hover:bg-secondary ' +
                  (selectedCat === c.slug
                    ? 'font-semibold'
                    : 'text-muted-foreground')
                }
              >
                {c.name}
                {c.productCount ? (
                  <span className="text-xs tabular opacity-60">
                    {c.productCount}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Separator />

      <Section title="Price (EGP)">
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Min" min="0" />
          <span className="text-muted-foreground">—</span>
          <Input type="number" placeholder="Max" min="0" />
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full">
          Apply
        </Button>
      </Section>

      <Separator />

      <Section title="Size">
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={
                'h-9 rounded-md border text-xs font-semibold transition-colors ' +
                (selectedSizes.includes(s)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Availability">
        <ul className="space-y-2">
          <CheckboxRow label="In stock" />
          <CheckboxRow label="On sale" />
          <CheckboxRow label="New arrivals" />
        </ul>
      </Section>
    </aside>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]">
        {title}
      </h4>
      {children}
    </div>
  )
}

function CheckboxRow({ label }) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-foreground"
        />
        <span>{label}</span>
      </label>
    </li>
  )
}
