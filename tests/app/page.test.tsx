import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function moreOptionsToggle() {
  return screen.getByRole('button', { name: /more options/i })
}

describe('HomePage', () => {
  it('prefills the form from a string-valued search param', async () => {
    render(await HomePage({ searchParams: Promise.resolve({ budget: '3000' }) }))

    expect(screen.getByRole('slider', { name: 'Budget per person' })).toHaveAttribute(
      'aria-valuenow',
      '3000'
    )
  })

  it('drops an array-valued search param instead of passing it through to the form', async () => {
    render(await HomePage({ searchParams: Promise.resolve({ styles: ['beach', 'city'] }) }))

    // parseTripQuery never sees `styles` (toURLSearchParams only keeps string values), so no
    // initial value is set and the form stays collapsed instead of auto-opening "More options"
    // the way it would for a real prefilled value.
    expect(moreOptionsToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps a string value while dropping an array value from the same search params', async () => {
    render(
      await HomePage({
        searchParams: Promise.resolve({ budget: '2500', styles: ['beach', 'city'] }),
      })
    )

    expect(screen.getByRole('slider', { name: 'Budget per person' })).toHaveAttribute(
      'aria-valuenow',
      '2500'
    )
    expect(moreOptionsToggle()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Beach' })).toHaveAttribute('aria-pressed', 'false')
  })
})
