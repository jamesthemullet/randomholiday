import { describe, it, expect } from 'vitest'
import { getHub } from '@/lib/hubs'

describe('getHub', () => {
  it('returns a seeded hub by IATA code', () => {
    const doha = getHub('DOH')

    expect(doha).toBeDefined()
    expect(doha?.name).toBe('Doha')
    expect(doha?.coordinates.lat).toBeCloseTo(25.2731)
    expect(doha?.coordinates.lng).toBeCloseTo(51.608)
  })

  it('returns undefined for an unknown code', () => {
    expect(getHub('ZZZ')).toBeUndefined()
  })
})
