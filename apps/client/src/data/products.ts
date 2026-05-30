const img = (seed, w = 600, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

const galleryOf = (slug) => [
  img(`${slug}-a`, 1200, 1600),
  img(`${slug}-b`, 1200, 1600),
  img(`${slug}-c`, 1200, 1600),
  img(`${slug}-d`, 1200, 1600),
]

// --- Shirts ---
const shirts = [
  {
    name: 'Tahrir Heavyweight Tee',
    slug: 'tahrir-heavyweight-tee',
    price: 650,
    comparePrice: 850,
    stock: 42,
    tag: 'Bestseller',
  },
  {
    name: 'Nile Boxy Tee',
    slug: 'nile-boxy-tee',
    price: 720,
    comparePrice: null,
    stock: 18,
    tag: 'New',
  },
  {
    name: 'Maadi Long-Sleeve',
    slug: 'maadi-long-sleeve',
    price: 890,
    comparePrice: null,
    stock: 6,
    tag: 'Low Stock',
  },
  {
    name: 'Downtown Graphic Tee',
    slug: 'downtown-graphic-tee',
    price: 680,
    comparePrice: 780,
    stock: 24,
    tag: null,
  },
  {
    name: 'Zamalek Overshirt',
    slug: 'zamalek-overshirt',
    price: 1450,
    comparePrice: null,
    stock: 11,
    tag: 'New',
  },
  {
    name: 'Alexandria Striped Polo',
    slug: 'alexandria-striped-polo',
    price: 950,
    comparePrice: null,
    stock: 0,
    tag: 'Sold Out',
  },
]

// --- Jeans ---
const jeans = [
  {
    name: 'Raw Selvedge 501',
    slug: 'raw-selvedge-501',
    price: 2450,
    comparePrice: null,
    stock: 8,
    tag: 'Bestseller',
  },
  {
    name: 'Stone Wash Straight',
    slug: 'stone-wash-straight',
    price: 1850,
    comparePrice: 2200,
    stock: 15,
    tag: null,
  },
  {
    name: 'Black Slim Denim',
    slug: 'black-slim-denim',
    price: 1950,
    comparePrice: null,
    stock: 22,
    tag: null,
  },
  {
    name: 'Carpenter Loose Fit',
    slug: 'carpenter-loose-fit',
    price: 2100,
    comparePrice: null,
    stock: 9,
    tag: 'New',
  },
]

// --- Sweaters ---
const sweaters = [
  {
    name: 'Cairo Crew Sweatshirt',
    slug: 'cairo-crew-sweatshirt',
    price: 1250,
    comparePrice: null,
    stock: 33,
    tag: 'Bestseller',
  },
  {
    name: 'Helwan Cable Knit',
    slug: 'helwan-cable-knit',
    price: 1850,
    comparePrice: 2100,
    stock: 12,
    tag: null,
  },
  {
    name: 'Giza Heavyweight Hoodie',
    slug: 'giza-heavyweight-hoodie',
    price: 1650,
    comparePrice: null,
    stock: 20,
    tag: 'New',
  },
  {
    name: 'Khan Zip Hoodie',
    slug: 'khan-zip-hoodie',
    price: 1750,
    comparePrice: null,
    stock: 4,
    tag: 'Low Stock',
  },
]

const categoryBySlug = {
  shirts: { id: 'cat-1', name: 'Shirts', slug: 'shirts' },
  jeans: { id: 'cat-2', name: 'Jeans', slug: 'jeans' },
  sweaters: { id: 'cat-3', name: 'Sweaters', slug: 'sweaters' },
}

function expand(list, catSlug) {
  const cat = categoryBySlug[catSlug]
  return list.map((p, i) => ({
    id: `${catSlug}-${i + 1}`,
    ...p,
    description:
      'Pre-washed heavyweight cotton, boxy street fit, reinforced collar. Cut and sewn in Egypt. A staple built to take a beating — then wear in beautifully.',
    sku: `CS-${catSlug.slice(0, 2).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
    imageUrl: img(p.slug, 600, 800),
    images: galleryOf(p.slug),
    isActive: p.stock !== null,
    category: cat,
    categoryId: cat.id,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4 + Math.random(),
    reviewCount: Math.floor(8 + Math.random() * 40),
    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
  }))
}

export const PRODUCTS = [
  ...expand(shirts, 'shirts'),
  ...expand(jeans, 'jeans'),
  ...expand(sweaters, 'sweaters'),
]

export const getProductBySlug = (slug) =>
  PRODUCTS.find((p) => p.slug === slug)

export const getProductsByCategory = (slug) =>
  PRODUCTS.filter((p) => p.category.slug === slug)

export const getFeaturedProducts = (n = 8) =>
  PRODUCTS.filter((p) => p.tag === 'Bestseller' || p.tag === 'New').slice(0, n)

export const getRelatedProducts = (product, n = 4) =>
  PRODUCTS.filter(
    (p) => p.category.slug === product.category.slug && p.id !== product.id
  ).slice(0, n)
