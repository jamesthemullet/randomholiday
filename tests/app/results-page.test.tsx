import { describe, it, expect } from 'vitest'
import { metadata } from '@/app/results/page'

describe('results page metadata', () => {
  it('excludes the page from search indexing', () => {
    expect(metadata.robots).toEqual({ index: false })
  })

  it('has its own title and description instead of inheriting the homepage ones', () => {
    expect(metadata.title).toBe('Your Match — RandomHoliday')
    expect(metadata.description).toBe('See your personalised holiday destination match.')
  })
})
