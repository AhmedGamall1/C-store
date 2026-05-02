import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('the test runner is wired up', () => {
    expect(1 + 1).toBe(2)
  })

  it('async tests work', async () => {
    const value = await Promise.resolve('ok')
    expect(value).toBe('ok')
  })
})
