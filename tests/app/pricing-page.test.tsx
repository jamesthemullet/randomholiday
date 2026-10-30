import { describe, it, expect } from 'vitest'
import { metadata } from '@/app/pricing/page'

describe('pricing page metadata', () => {
  it('has its own title and description', () => {
    expect(metadata.title).toBe('Pricing — RandomHoliday')
    expect(metadata.description).toBe('Compare RandomHoliday Free and Pro plans.')
  })

  it('has its own canonical URL', () => {
    expect(metadata.alternates).toEqual({ canonical: '/pricing' })
  })

  it('has its own openGraph title and description instead of inheriting the homepage copy', () => {
    expect(metadata.openGraph).toEqual({
      title: 'Pricing — RandomHoliday',
      description: 'Compare RandomHoliday Free and Pro plans.',
      type: 'website',
    })
  })

  it('has its own twitter card title and description', () => {
    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title: 'Pricing — RandomHoliday',
      description: 'Compare RandomHoliday Free and Pro plans.',
    })
  })
})
