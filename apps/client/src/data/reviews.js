export const REVIEWS_BY_PRODUCT = {
  'shirts-1': [
    {
      id: 'rv-1',
      user: { firstName: 'Youssef', lastName: 'A.' },
      rating: 5,
      comment:
        'Heavyweight is no joke — this is a real tee. Washed it three times, no shrinkage, no fade. Got compliments on it in Zamalek.',
      createdAt: '2025-04-02T08:14:00Z',
    },
    {
      id: 'rv-2',
      user: { firstName: 'Mona', lastName: 'S.' },
      rating: 4,
      comment:
        'Fit runs a little boxy (which I love) but if you want fitted go down a size. Overall great quality for the price.',
      createdAt: '2025-03-21T19:30:00Z',
    },
    {
      id: 'rv-3',
      user: { firstName: 'Karim', lastName: 'E.' },
      rating: 5,
      comment:
        'Finally an Egyptian brand that actually makes heavyweight tees that don’t look like pajamas. Buying two more.',
      createdAt: '2025-03-12T14:45:00Z',
    },
  ],
  'jeans-1': [
    {
      id: 'rv-4',
      user: { firstName: 'Adham', lastName: 'R.' },
      rating: 5,
      comment:
        'Selvedge for this price is unreal. Took a month to break in and now they fit like a glove.',
      createdAt: '2025-03-18T12:00:00Z',
    },
    {
      id: 'rv-5',
      user: { firstName: 'Habiba', lastName: 'F.' },
      rating: 4,
      comment: 'Love the weight of the denim. Could be slightly longer for tall builds.',
      createdAt: '2025-02-25T09:10:00Z',
    },
  ],
  'sweaters-1': [
    {
      id: 'rv-6',
      user: { firstName: 'Ziad', lastName: 'M.' },
      rating: 5,
      comment:
        'Cairo winters aren’t that cold but this is perfect for chilly evenings out. Fit is clean.',
      createdAt: '2025-01-30T20:22:00Z',
    },
  ],
}

export const getReviewsForProduct = (id) => REVIEWS_BY_PRODUCT[id] || []
