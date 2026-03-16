import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App'

const mockTodos = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Todo ${i + 1}`,
  completed: i % 2 === 0,
}))

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTodos),
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows loading state initially', () => {
    render(<App />)
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...')
  })

  it('renders a checkbox for each todo with correct data-testid', async () => {
    render(<App />)
    await screen.findByTestId('todo-list')

    mockTodos.forEach(({ id }) => {
      expect(screen.getByTestId(`todo-checkbox-${id}`)).toBeInTheDocument()
    })
  })

  it('renders exactly 10 checkboxes', async () => {
    render(<App />)
    await screen.findByTestId('todo-list')

    expect(screen.getAllByRole('checkbox')).toHaveLength(10)
  })

  it('reflects completed state from API on each checkbox', async () => {
    render(<App />)
    await screen.findByTestId('todo-list')

    mockTodos.forEach(({ id, completed }) => {
      const checkbox = screen.getByTestId(`todo-checkbox-${id}`)
      if (completed) {
        expect(checkbox).toBeChecked()
      } else {
        expect(checkbox).not.toBeChecked()
      }
    })
  })

  it('toggles a checkbox on click and restores on second click', async () => {
    render(<App />)
    await screen.findByTestId('todo-list')

    const checkbox = screen.getByTestId('todo-checkbox-1')
    const initial = (checkbox as HTMLInputElement).checked

    await userEvent.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(!initial)

    await userEvent.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(initial)
  })

  it('shows error state when API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      })
    )

    render(<App />)
    await screen.findByTestId('error')
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch todos')
  })
})
