import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import photoIds from '@/lib/data/destination-photos.json'
import { catalogue } from '@/lib/catalogue'
import { createHeroPicker, formatPlace, getHeroPhoto, ukDayNumber } from '@/lib/heroPhoto'

const entries = [
  { id: 'rome-italy', name: 'Rome', country: 'Italy' },
  { id: 'paris-france', name: 'Paris', country: 'France' },
  { id: 'jersey-jersey', name: 'Jersey', country: 'Jersey' },
  { id: 'oslo-norway', name: 'Oslo', country: 'Norway' },
]

describe('destination-photos.json', () => {
  it('lists exactly the photos in public/destinations (run `yarn data:photos` if this fails)', () => {
    const files = readdirSync(join(process.cwd(), 'public', 'destinations'))
      .filter((file) => file.endsWith('.jpg'))
      .map((file) => file.slice(0, -'.jpg'.length))
      .sort()
    expect(photoIds).toEqual(files)
  })

  it('only names destinations in the route data', () => {
    const ids = new Set(catalogue.map((entry) => entry.id))
    expect(photoIds.filter((id) => !ids.has(id))).toEqual([])
  })
})

describe('formatPlace', () => {
  it('joins the place and country', () => {
    expect(formatPlace({ name: 'Santorini', country: 'Greece' })).toBe('Santorini, Greece')
  })

  it('drops the country when it repeats the place name', () => {
    expect(formatPlace({ name: 'Jersey', country: 'Jersey' })).toBe('Jersey')
  })
})

describe('ukDayNumber', () => {
  it('rolls over at UK midnight in winter (GMT)', () => {
    expect(ukDayNumber(new Date('2026-01-10T23:59:00Z'))).toBe(
      ukDayNumber(new Date('2026-01-10T00:00:00Z'))
    )
    expect(ukDayNumber(new Date('2026-01-11T00:00:00Z'))).toBe(
      ukDayNumber(new Date('2026-01-10T00:00:00Z')) + 1
    )
  })

  it('rolls over at UK midnight in summer (BST)', () => {
    // 23:30 UTC on 10 July is 00:30 on 11 July in London.
    expect(ukDayNumber(new Date('2026-07-10T23:30:00Z'))).toBe(
      ukDayNumber(new Date('2026-07-11T12:00:00Z'))
    )
  })
})

describe('createHeroPicker', () => {
  const pick = createHeroPicker(entries, ['rome-italy', 'paris-france', 'jersey-jersey'])
  const day = (offset: number) => new Date(Date.UTC(2026, 10, 19 + offset, 12))

  it('gives the same photo all day', () => {
    expect(pick(new Date('2026-11-19T00:30:00Z'))).toEqual(pick(new Date('2026-11-19T23:30:00Z')))
  })

  it('only uses destinations that have a photo', () => {
    const srcs = [0, 1, 2, 3, 4, 5].map((offset) => pick(day(offset)).src)
    expect(srcs).not.toContain('/destinations/oslo-norway.jpg')
  })

  it('shows every photo once before repeating', () => {
    const srcs = [0, 1, 2].map((offset) => pick(day(offset)).src)
    expect(new Set(srcs).size).toBe(3)
    expect(pick(day(3))).toEqual(pick(day(0)))
  })

  it('labels the photo with the place name', () => {
    const labels = [0, 1, 2].map((offset) => pick(day(offset)).label).sort()
    expect(labels).toEqual(['Jersey', 'Paris, France', 'Rome, Italy'])
  })

  it('throws when no destination has a photo', () => {
    expect(() => createHeroPicker(entries, [])).toThrow(/No destination photos/)
  })
})

describe('getHeroPhoto', () => {
  it('picks a real photo from the route data', () => {
    const { src } = getHeroPhoto(new Date())
    expect(photoIds.map((id) => `/destinations/${id}.jpg`)).toContain(src)
  })
})
