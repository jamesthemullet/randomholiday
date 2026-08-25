import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UpgradePrompt } from '@/components/UpgradePrompt'

describe('UpgradePrompt', () => {
  it('renders the feature label', () => {
    render(<UpgradePrompt feature="save-trip" />)
    expect(screen.getByText(/Save your favourite trips/)).toBeInTheDocument()
  })

  it('renders a Pro badge', () => {
    render(<UpgradePrompt feature="save-trip" />)
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('does not render an upgrade button when onUpgrade is omitted', () => {
    render(<UpgradePrompt feature="save-trip" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders an upgrade button when onUpgrade is provided', () => {
    render(<UpgradePrompt feature="save-trip" onUpgrade={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeInTheDocument()
  })

  it('calls onUpgrade when the upgrade button is clicked', () => {
    const onUpgrade = vi.fn()
    render(<UpgradePrompt feature="unlimited-shuffles" onUpgrade={onUpgrade} />)
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Pro' }))
    expect(onUpgrade).toHaveBeenCalledOnce()
  })

  it('applies extra className', () => {
    render(<UpgradePrompt feature="save-trip" className="extra" />)
    expect(screen.getByRole('status')).toHaveClass('extra')
  })

  it('has role status for screen reader announcement', () => {
    render(<UpgradePrompt feature="save-trip" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
