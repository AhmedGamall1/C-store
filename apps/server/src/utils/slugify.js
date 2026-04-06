const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/[^\w-]+/g, '') // remove non-word chars
    .replace(/--+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens

export default slugify
