import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProGate } from '@/components/ProGate'

describe('ProGate', () => {
  it('renders children when status is pro', () => {
    render(
      <ProGate status="pro" feature="save-trip">
        <p>Unlocked content</p>
      </ProGate>
    )
    expect(screen.getByText('Unlocked content')).toBeInTheDocument()
  })

  it('renders an UpgradePrompt instead of children when status is free', () => {
    render(
      <ProGate status="free" feature="save-trip">
        <p>Unlocked content</p>
      </ProGate>
    )
    expect(screen.queryByText('Unlocked content')).not.toBeInTheDocument()
    expect(screen.getByText(/Save your favourite trips/)).toBeInTheDocument()
  })

  it('passes onUpgrade through to the UpgradePrompt', () => {
    const onUpgrade = vi.fn()
    render(
      <ProGate status="free" feature="save-trip" onUpgrade={onUpgrade}>
        <p>Unlocked content</p>
      </ProGate>
    )
    expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeInTheDocument()
  })
})
