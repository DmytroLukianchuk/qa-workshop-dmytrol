import { render, screen, waitFor } from '@testing-library/react'
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

  it('renders the Clear Completed button', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    expect(screen.getByTestId('clear-completed-btn')).toBeInTheDocument()
  })

  it('removes completed todos when Clear Completed is clicked', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    const completedIds = mockTodos.filter((t) => t.completed).map((t) => t.id)
    const uncompletedIds = mockTodos.filter((t) => !t.completed).map((t) => t.id)

    await userEvent.click(screen.getByTestId('clear-completed-btn'))

    completedIds.forEach((id) => {
      expect(screen.queryByTestId(`todo-item-${id}`)).not.toBeInTheDocument()
    })
    uncompletedIds.forEach((id) => {
      expect(screen.getByTestId(`todo-item-${id}`)).toBeInTheDocument()
    })
  })

  it('shows correct initial completion counter', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    const initialCompleted = mockTodos.filter((t) => t.completed).length
    expect(screen.getByTestId('completion-counter')).toHaveTextContent(
      `${initialCompleted}/${mockTodos.length} completed`
    )
  })

  it('updates counter when a checkbox is toggled', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    const initialCompleted = mockTodos.filter((t) => t.completed).length

    // todo-checkbox-2 starts uncompleted — clicking it adds 1 to the count
    await userEvent.click(screen.getByTestId('todo-checkbox-2'))
    expect(screen.getByTestId('completion-counter')).toHaveTextContent(
      `${initialCompleted + 1}/${mockTodos.length} completed`
    )

    // clicking again removes it
    await userEvent.click(screen.getByTestId('todo-checkbox-2'))
    expect(screen.getByTestId('completion-counter')).toHaveTextContent(
      `${initialCompleted}/${mockTodos.length} completed`
    )
  })

  it('shows empty state when API returns no todos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })
    )

    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    expect(screen.getByTestId('empty-state')).toHaveTextContent('No todos found.')
    expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument()
  })

  it('cleans up checked state for removed todos after Clear Completed', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    await userEvent.click(screen.getByTestId('clear-completed-btn'))

    // Only uncompleted todos remain — counter must show 0/5
    expect(screen.getByTestId('completion-counter')).toHaveTextContent('0/5 completed')
  })


  it('toggles a checkbox on click', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    const checkbox = screen.getByTestId('todo-checkbox-1') as HTMLInputElement
    const initial = checkbox.checked
    await userEvent.click(checkbox)
    expect(checkbox.checked).toBe(!initial)
  })
})
