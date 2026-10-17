import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorPage from '@/app/error'

describe('Error', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a heading describing the error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorPage error={new Error('boom')} reset={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
  })

  it('logs the error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('boom')
    render(<ErrorPage error={error} reset={vi.fn()} />)
    expect(consoleError).toHaveBeenCalledWith(error)
  })

  it('calls reset when "Try again" is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const reset = vi.fn()
    render(<ErrorPage error={new Error('boom')} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('renders a link back to home', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorPage error={new Error('boom')} reset={vi.fn()} />)
    const link = screen.getByRole('link', { name: 'Back to home' })
    expect(link).toHaveAttribute('href', '/')
  })
})
