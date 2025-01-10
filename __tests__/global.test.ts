import { describe, expect, it } from 'vitest'

describe('Global Test 1', () => {
  it('should pass', () => {
    expect(1).toBe(1)
  })

  it('should pass', () => {
    expect(2).toBe(2)
  })
})

describe('Global Test 2', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})
