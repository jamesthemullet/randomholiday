import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DestinationCard } from '@/components/DestinationCard'
import type { Destination } from '@/components/DestinationCard'

const baseDest: Destination = {
  name: 'Bali',
  country: 'Indonesia',
}

describe('DestinationCard', () => {
  it('renders destination name and country on front', () => {
    render(<DestinationCard destination={baseDest} />)
    expect(screen.getAllByText('Bali').length).toBeGreaterThan(0)
    expect(screen.getByText('Indonesia')).toBeInTheDocument()
  })

  it('is not flipped initially (aria-pressed=false)', () => {
    render(<DestinationCard destination={baseDest} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('flips to back on click (aria-pressed=true)', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips back to front on second click', () => {
    render(<DestinationCard destination={baseDest} />)
    const card = screen.getByRole('button')
    fireEvent.click(card)
    fireEvent.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'false')
  })

  it('flips on Enter key', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on Space key', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not flip on other keys', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' })
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders image when imageUrl provided', () => {
    render(
      <DestinationCard destination={{ ...baseDest, imageUrl: 'https://example.com/bali.jpg' }} />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/bali.jpg')
    expect(img).toHaveAttribute('alt', 'Bali, Indonesia')
  })

  it('does not render image when no imageUrl', () => {
    render(<DestinationCard destination={baseDest} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders climate on back when provided', () => {
    render(<DestinationCard destination={{ ...baseDest, climate: 'Tropical' }} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Tropical')).toBeInTheDocument()
  })

  it('does not render climate when not provided', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByText(/tropical/i)).not.toBeInTheDocument()
  })

  it('renders description on back when provided', () => {
    render(<DestinationCard destination={{ ...baseDest, description: 'A beautiful island' }} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('A beautiful island')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByText(/beautiful/i)).not.toBeInTheDocument()
  })

  it('renders activities list when activities non-empty', () => {
    render(<DestinationCard destination={{ ...baseDest, activities: ['Surfing', 'Yoga'] }} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Surfing')).toBeInTheDocument()
    expect(screen.getByText('Yoga')).toBeInTheDocument()
  })

  it('does not render activities list when activities is empty array', () => {
    render(<DestinationCard destination={{ ...baseDest, activities: [] }} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('does not render activities list when activities is undefined', () => {
    render(<DestinationCard destination={{ ...baseDest, activities: undefined }} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders select button when onSelect provided', () => {
    render(<DestinationCard destination={baseDest} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /bali/i }))
    expect(screen.getByRole('button', { name: 'Select Destination' })).toBeInTheDocument()
  })

  it('does not render select button when no onSelect', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('button', { name: 'Select Destination' })).not.toBeInTheDocument()
  })

  it('calls onSelect and stops propagation when select clicked', () => {
    const onSelect = vi.fn()
    render(<DestinationCard destination={baseDest} onSelect={onSelect} />)
    // Flip to back
    fireEvent.click(screen.getByRole('button', { name: /bali/i }))
    // Click select button
    fireEvent.click(screen.getByRole('button', { name: 'Select Destination' }))
    expect(onSelect).toHaveBeenCalledOnce()
    // Card should still be in flipped state (click did not toggle)
    expect(screen.getByRole('button', { name: /bali/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies flipped class when flipped', () => {
    render(<DestinationCard destination={baseDest} />)
    fireEvent.click(screen.getByRole('button'))
    // Find the inner card div
    const scene = screen.getByRole('button')
    const inner = scene.querySelector('div')
    expect(inner?.className).toContain('flipped')
  })

  it('does not apply flipped class initially', () => {
    render(<DestinationCard destination={baseDest} />)
    const scene = screen.getByRole('button')
    const inner = scene.querySelector('div')
    expect(inner?.className).not.toContain('flipped')
  })
})
