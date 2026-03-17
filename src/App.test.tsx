import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

const mockTodos = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Todo ${i + 1}`,
  completed: i % 2 === 0,
}))

const mockUser = { id: 1, name: 'Leanne Graham' }

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/users/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUser) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTodos) })
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

  it('displays logged-in-as indicator with user name', async () => {
    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    expect(screen.getByTestId('logged-in-as')).toHaveTextContent('Logged in as Leanne Graham')
  })

  it('does not show logged-in-as indicator when user fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/users/')) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTodos) })
      })
    )

    render(<App />)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())

    expect(screen.queryByTestId('logged-in-as')).not.toBeInTheDocument()
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
