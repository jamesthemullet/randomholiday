import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  TravelStyleSelector,
  toggleTravelStyle,
  TRAVEL_STYLE_OPTIONS,
} from '@/components/TravelStyleSelector'
import type { TravelStyle } from '@/lib/destinations'

describe('TravelStyleSelector', () => {
  it('renders all travel style options', () => {
    render(<TravelStyleSelector selected={[]} onChange={vi.fn()} />)
    TRAVEL_STYLE_OPTIONS.forEach((option) => {
      expect(screen.getByRole('button', { name: option.label })).toBeInTheDocument()
    })
  })

  it('renders the default label', () => {
    render(<TravelStyleSelector selected={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Travel style')).toBeInTheDocument()
  })

  it('renders a custom label', () => {
    render(<TravelStyleSelector selected={[]} onChange={vi.fn()} label="Pick your vibe" />)
    expect(screen.getByText('Pick your vibe')).toBeInTheDocument()
  })

  it('marks selected options as pressed', () => {
    render(<TravelStyleSelector selected={['beach']} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Beach' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'City' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange adding a style when an unselected option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TravelStyleSelector selected={['beach']} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'City' }))
    expect(onChange).toHaveBeenCalledWith(['beach', 'city'])
  })

  it('calls onChange removing a style when a selected option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TravelStyleSelector selected={['beach', 'city']} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Beach' }))
    expect(onChange).toHaveBeenCalledWith(['city'])
  })

  it('associates the group with the label via aria-labelledby', () => {
    render(<TravelStyleSelector selected={[]} onChange={vi.fn()} />)
    expect(screen.getByRole('group', { name: 'Travel style' })).toBeInTheDocument()
  })
})

describe('toggleTravelStyle', () => {
  it('adds a style that is not yet selected', () => {
    expect(toggleTravelStyle(['beach'], 'city')).toEqual(['beach', 'city'])
  })

  it('removes a style that is already selected', () => {
    expect(toggleTravelStyle(['beach', 'city'], 'beach')).toEqual(['city'])
  })

  it('does not mutate the original array', () => {
    const original: TravelStyle[] = ['beach']
    toggleTravelStyle(original, 'city')
    expect(original).toEqual(['beach'])
  })
})
