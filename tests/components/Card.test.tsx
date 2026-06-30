import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('has no role when no onClick', () => {
    render(<Card>Content</Card>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has no tabIndex when no onClick', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    expect(card).not.toHaveAttribute('tabindex')
  })

  it('has role=button and tabIndex=0 when onClick provided', () => {
    render(<Card onClick={vi.fn()}>Content</Card>)
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabindex', '0')
  })

  it('applies hoverable class when hoverable=true', () => {
    render(<Card hoverable>Content</Card>)
    const card = screen.getByText('Content')
    expect(card.className).toContain('hoverable')
  })

  it('does not apply hoverable class when hoverable=false', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    expect(card.className).not.toContain('hoverable')
  })

  it('applies clickable class when onClick provided', () => {
    render(<Card onClick={vi.fn()}>Content</Card>)
    expect(screen.getByRole('button').className).toContain('clickable')
  })

  it('applies extra className', () => {
    render(<Card className="custom">Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('custom')
  })

  it('calls onClick on click', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Content</Card>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Content</Card>)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onClick on Space key', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Content</Card>)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick on other keys', () => {
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Content</Card>)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'a' })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('no keyDown handler when no onClick', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    // Should not throw
    fireEvent.keyDown(card, { key: 'Enter' })
  })
})
