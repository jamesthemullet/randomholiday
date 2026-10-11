import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdSlot } from '@/components/AdSlot'

describe('AdSlot', () => {
  it('renders a placeholder labelled Advertisement by default', () => {
    render(<AdSlot format="banner" />)
    expect(screen.getByRole('complementary', { name: 'Advertisement' })).toBeInTheDocument()
  })

  it('renders for a free tier status', () => {
    render(<AdSlot format="rectangle" status="free" />)
    expect(screen.getByRole('complementary', { name: 'Advertisement' })).toBeInTheDocument()
  })

  it('renders nothing for a pro tier status', () => {
    render(<AdSlot format="banner" status="pro" />)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  it.each<['banner' | 'rectangle' | 'leaderboard']>([['banner'], ['rectangle'], ['leaderboard']])(
    'renders the %s format',
    (format) => {
      render(<AdSlot format={format} />)
      expect(screen.getByRole('complementary', { name: 'Advertisement' })).toBeInTheDocument()
    }
  )

  it('applies extra className', () => {
    render(<AdSlot format="banner" className="extra" />)
    expect(screen.getByRole('complementary', { name: 'Advertisement' })).toHaveClass('extra')
  })
})
