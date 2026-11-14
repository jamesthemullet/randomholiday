import { describe, it, expect } from 'vitest'
import { getSafetyOverride, getSafetyStatus } from '@/lib/travelAdvisory'

describe('getSafetyOverride', () => {
  it('returns the override record for a destination with a seeded warning', () => {
    const override = getSafetyOverride('tel-aviv-israel')

    expect(override).toBeDefined()
    expect(override?.status).toBe('warn')
    expect(override?.reason.length).toBeGreaterThan(0)
    expect(override?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns undefined for a destination with no override', () => {
    expect(getSafetyOverride('paris-france')).toBeUndefined()
  })
})

describe('getSafetyStatus', () => {
  it('returns "warn" for destinations seeded with FCDO regional warnings', () => {
    expect(getSafetyStatus('beirut-lebanon')).toBe('warn')
    expect(getSafetyStatus('erbil-iraq')).toBe('warn')
    expect(getSafetyStatus('tel-aviv-israel')).toBe('warn')
  })

  it('returns "ok" for a destination with no override', () => {
    expect(getSafetyStatus('paris-france')).toBe('ok')
  })

  it('returns "ok" for an unknown destination id', () => {
    expect(getSafetyStatus('not-a-real-destination')).toBe('ok')
  })
})
