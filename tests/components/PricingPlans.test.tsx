import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PricingPlans } from '@/components/PricingPlans'

describe('PricingPlans', () => {
  it('renders the pricing heading', () => {
    render(<PricingPlans />)
    expect(screen.getByRole('heading', { name: 'Simple, honest pricing' })).toBeInTheDocument()
  })

  it('renders both plan names', () => {
    render(<PricingPlans />)
    expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument()
  })

  it('renders the free plan price', () => {
    render(<PricingPlans />)
    expect(screen.getByText('£0')).toBeInTheDocument()
  })

  it('renders the pro plan price', () => {
    render(<PricingPlans />)
    expect(screen.getByText('£4.99')).toBeInTheDocument()
  })

  it('renders all pro feature labels', () => {
    render(<PricingPlans />)
    expect(screen.getByText('Save your favourite trips')).toBeInTheDocument()
    expect(screen.getByText('Unlimited destination shuffles')).toBeInTheDocument()
    expect(screen.getByText('Ad-free browsing')).toBeInTheDocument()
    expect(screen.getByText('Priority support')).toBeInTheDocument()
  })

  it('renders an upgrade button', () => {
    render(<PricingPlans />)
    expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeInTheDocument()
  })

  it('calls onUpgrade when the upgrade button is clicked', () => {
    const onUpgrade = vi.fn()
    render(<PricingPlans onUpgrade={onUpgrade} />)
    fireEvent.click(screen.getByRole('button', { name: 'Upgrade to Pro' }))
    expect(onUpgrade).toHaveBeenCalledOnce()
  })
})
