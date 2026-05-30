import { describe, it, expect } from 'vitest'
import slugify from '../../../src/utils/slugify.js'

describe('slugify', () => {
  // ---------- happy path ----------
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('handles a single word', () => {
    expect(slugify('Shoes')).toBe('shoes')
  })

  it('preserves digits', () => {
    expect(slugify('Air Max 90')).toBe('air-max-90')
  })

  // ---------- normalization ----------
  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello')
  })

  it('collapses multiple spaces into one hyphen', () => {
    expect(slugify('hello    world')).toBe('hello-world')
  })

  it('collapses multiple hyphens into one', () => {
    expect(slugify('hello---world')).toBe('hello-world')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello')
  })

  // ---------- character stripping ----------
  it('removes punctuation', () => {
    expect(slugify("Women's T-Shirt!")).toBe('womens-t-shirt')
  })

  it('removes non-ASCII letters (current behavior)', () => {
    // \w only matches [A-Za-z0-9_], so accented chars get dropped.
    // Documenting current behavior — if we ever want unicode slugs,
    // this test will fail and force the conversation.
    expect(slugify('Café')).toBe('caf')
  })

  it('keeps underscores (because \\w includes them)', () => {
    expect(slugify('hello_world')).toBe('hello_world')
  })

  // ---------- edge cases ----------
  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(slugify('   ')).toBe('')
  })

  it('coerces non-string input via toString()', () => {
    expect(slugify(42)).toBe('42')
  })
})
