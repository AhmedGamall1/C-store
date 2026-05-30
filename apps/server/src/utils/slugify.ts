const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/[^\w-]+/g, '') // drop anything that isn't a word char or hyphen
    .replace(/--+/g, '-') // collapse repeated hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens

export default slugify
