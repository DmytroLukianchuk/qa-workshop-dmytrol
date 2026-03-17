import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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

describe('App', () => {
  it('shows loading state initially', () => {
    render(<App />)
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...')
  })

  it('renders a checkbox for each todo with correct data-testid', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    mockTodos.forEach(({ id }) => {
      expect(screen.getByTestId(`todo-checkbox-${id}`)).toBeInTheDocument()
    })
  })

  it('renders exactly 10 checkboxes', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(10)
  })

  it('reflects completed state from API on each checkbox', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    mockTodos.forEach(({ id, completed }) => {
      const checkbox = screen.getByTestId(`todo-checkbox-${id}`)
      expect((checkbox as HTMLInputElement).checked).toBe(completed)
    })
  })

  it('toggles a checkbox on click', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    const checkbox = screen.getByTestId('todo-checkbox-1') as HTMLInputElement
    const initial = checkbox.checked
    await userEvent.click(checkbox)
    expect(checkbox.checked).toBe(!initial)
  })

  it('shows error message when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false })
    )

    render(<App />)
    await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument())
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch todos')
  })

  it('silently ignores AbortError and does not show an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    )

    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())
    expect(screen.queryByTestId('error')).toBeNull()
  })

  it('shows timeout message after 5 seconds of loading', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    render(<App />)
    expect(screen.queryByTestId('timeout-message')).toBeNull()

    await act(async () => { vi.advanceTimersByTime(5000) })

    expect(screen.getByTestId('timeout-message')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
