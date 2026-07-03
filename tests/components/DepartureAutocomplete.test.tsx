import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DepartureAutocomplete } from '@/components/DepartureAutocomplete'
import { departureCities } from '@/lib/departureCities'

describe('DepartureAutocomplete', () => {
  const defaultProps = {
    id: 'departure',
    label: 'Departure city',
    value: '',
    onChange: vi.fn(),
    onSelect: vi.fn(),
  }

  it('renders label and combobox input', () => {
    render(<DepartureAutocomplete {...defaultProps} />)
    expect(screen.getByLabelText('Departure city')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('does not show the listbox when closed', () => {
    render(<DepartureAutocomplete {...defaultProps} value="Paris" />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the listbox on focus and shows matching cities', () => {
    render(<DepartureAutocomplete {...defaultProps} value="Par" />)
    fireEvent.focus(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Paris')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows a no-results message when nothing matches', () => {
    render(<DepartureAutocomplete {...defaultProps} value="zzznotarealcity" />)
    fireEvent.focus(screen.getByRole('combobox'))
    expect(screen.getByRole('status')).toHaveTextContent('No cities found')
  })

  it('calls onChange with the typed value and opens the listbox', () => {
    const onChange = vi.fn()
    render(<DepartureAutocomplete {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'lon' } })
    expect(onChange).toHaveBeenCalledWith('lon')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('selects a city on click, calling onSelect and onChange', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    render(
      <DepartureAutocomplete
        {...defaultProps}
        value="Par"
        onChange={onChange}
        onSelect={onSelect}
      />
    )
    fireEvent.focus(screen.getByRole('combobox'))
    const listbox = screen.getByRole('listbox')
    fireEvent.mouseDown(listbox)
    fireEvent.click(screen.getByText('Paris'))

    expect(onChange).toHaveBeenCalledWith('Paris')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Paris' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the listbox on blur', () => {
    render(<DepartureAutocomplete {...defaultProps} value="Par" />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.blur(input)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the listbox on Escape', () => {
    render(<DepartureAutocomplete {...defaultProps} value="Par" />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('highlights the next option on ArrowDown, wrapping around', () => {
    render(<DepartureAutocomplete {...defaultProps} />)
    const input = screen.getByRole('combobox')
    const first = departureCities[0]
    const second = departureCities[1]

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getByRole('option', { name: new RegExp(first.name) })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(input).toHaveAttribute('aria-activedescendant', `${defaultProps.id}-option-0`)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getByRole('option', { name: new RegExp(second.name) })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('highlights the previous option on ArrowUp, wrapping to the last item', () => {
    render(<DepartureAutocomplete {...defaultProps} />)
    const input = screen.getByRole('combobox')
    const last = departureCities[departureCities.length - 1]

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(screen.getByRole('option', { name: new RegExp(last.name) })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('highlights the previous option on ArrowUp from a positive index', () => {
    render(<DepartureAutocomplete {...defaultProps} />)
    const input = screen.getByRole('combobox')
    const first = departureCities[0]

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })

    expect(screen.getByRole('option', { name: new RegExp(first.name) })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('selects the highlighted option on Enter', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    render(<DepartureAutocomplete {...defaultProps} onChange={onChange} onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    const first = departureCities[0]

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(first.name)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: first.id }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does nothing on Enter when no option is highlighted', () => {
    const onSelect = vi.fn()
    render(<DepartureAutocomplete {...defaultProps} onSelect={onSelect} />)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does nothing on ArrowUp/ArrowDown when there are no matches', () => {
    render(<DepartureAutocomplete {...defaultProps} value="zzznotarealcity" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('ignores unhandled keys', () => {
    render(<DepartureAutocomplete {...defaultProps} />)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'a' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders without error state by default', () => {
    render(<DepartureAutocomplete {...defaultProps} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-describedby')
  })

  it('renders error message with ARIA attributes', () => {
    render(<DepartureAutocomplete {...defaultProps} error="Please choose a city" />)
    const errorEl = screen.getByRole('alert')
    expect(errorEl).toHaveTextContent('Please choose a city')
    expect(errorEl).toHaveAttribute('id', `${defaultProps.id}-error`)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', `${defaultProps.id}-error`)
  })

  it('renders the placeholder', () => {
    render(<DepartureAutocomplete {...defaultProps} placeholder="e.g. London" />)
    expect(screen.getByPlaceholderText('e.g. London')).toBeInTheDocument()
  })
})
