import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/components/Modal'

afterEach(() => {
  document.body.removeAttribute('data-modal-open')
})

describe('Modal', () => {
  it('renders nothing when isOpen=false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when isOpen=true', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test dialog">
        Body content
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test dialog')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('has aria-modal=true', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test">
        Content
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-labelledby pointing to title', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="My Modal">
        Content
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    const titleId = dialog.getAttribute('aria-labelledby')
    expect(titleId).toBeTruthy()
    expect(document.getElementById(titleId!)).toHaveTextContent('My Modal')
  })

  it('sets body data-modal-open when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test">
        Content
      </Modal>
    )
    expect(document.body).toHaveAttribute('data-modal-open', 'true')
  })

  it('does not set body attribute when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    )
    expect(document.body).not.toHaveAttribute('data-modal-open')
  })

  it('removes body attribute when modal closes (rerender)', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="Test">
        Content
      </Modal>
    )
    expect(document.body).toHaveAttribute('data-modal-open', 'true')
    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    )
    expect(document.body).not.toHaveAttribute('data-modal-open')
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        Content
      </Modal>
    )
    const backdrop = screen.getByRole('dialog').previousElementSibling!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        Content
      </Modal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        Content
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on other keys', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        Content
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not listen for keys when closed', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={false} onClose={onClose} title="Test">
        Content
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('wraps focus forward: Tab from last focuses first', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        <button>Extra</button>
      </Modal>
    )
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' })
    const extraBtn = screen.getByRole('button', { name: 'Extra' })

    extraBtn.focus()
    expect(document.activeElement).toBe(extraBtn)

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(closeBtn)
  })

  it('wraps focus backward: Shift+Tab from first focuses last', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        <button>Extra</button>
      </Modal>
    )
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' })
    const extraBtn = screen.getByRole('button', { name: 'Extra' })

    closeBtn.focus()
    expect(document.activeElement).toBe(closeBtn)

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(extraBtn)
  })

  it('does not prevent default Tab for middle elements', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test">
        <button>Middle</button>
        <button>Last</button>
      </Modal>
    )
    const middleBtn = screen.getByRole('button', { name: 'Middle' })
    middleBtn.focus()

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    const preventSpy = vi.spyOn(tabEvent, 'preventDefault')
    document.dispatchEvent(tabEvent)
    expect(preventSpy).not.toHaveBeenCalled()
  })

  it('ignores non-Tab key in handler', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Test">
        <button>Btn</button>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'ArrowDown' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
