import { describe, it, expect } from 'vitest'
import { parseNumberParam } from '@/lib/queryParams'

describe('parseNumberParam', () => {
  it('returns null when the value is null', () => {
    expect(parseNumberParam(null)).toBeNull()
  })

  it('returns null when the value is not a finite number', () => {
    expect(parseNumberParam('not-a-number')).toBeNull()
    expect(parseNumberParam('Infinity')).toBeNull()
  })

  it('parses a valid integer string', () => {
    expect(parseNumberParam('42')).toBe(42)
  })

  it('parses a valid decimal string', () => {
    expect(parseNumberParam('41.38')).toBe(41.38)
  })

  it('parses a negative number string', () => {
    expect(parseNumberParam('-5')).toBe(-5)
  })
})
