import { describe, it, expect } from 'vitest'
import AppError from '../../../src/utils/AppError.js'

describe('AppError', () => {
  it('is an instance of Error', () => {
    const err = new AppError('boom', 500)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })

  it('exposes the message passed in', () => {
    const err = new AppError('not found', 404)
    expect(err.message).toBe('not found')
  })

  it('exposes the statusCode passed in', () => {
    const err = new AppError('bad request', 400)
    expect(err.statusCode).toBe(400)
  })

  it('marks 4xx errors as "fail"', () => {
    expect(new AppError('x', 400).status).toBe('fail')
    expect(new AppError('x', 404).status).toBe('fail')
    expect(new AppError('x', 422).status).toBe('fail')
  })

  it('marks 5xx errors as "error"', () => {
    expect(new AppError('x', 500).status).toBe('error')
    expect(new AppError('x', 503).status).toBe('error')
  })

  it('sets isOperational to true (used by the global error handler)', () => {
    const err = new AppError('x', 500)
    expect(err.isOperational).toBe(true)
  })

  it('captures a stack trace', () => {
    const err = new AppError('x', 500)
    expect(err.stack).toBeDefined()
    expect(err.stack).toContain('AppError')
  })

  it('can be caught by a try/catch like any Error', () => {
    let caught
    try {
      throw new AppError('caught me', 418)
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(AppError)
    expect(caught.statusCode).toBe(418)
  })
})
