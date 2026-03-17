import { useState, useEffect } from 'react'
import { useTheme } from './useTheme'

const LOADING_TIMEOUT_MS = 5000

function App() {
  const { theme, toggle } = useTheme()
  const [todos, setTodos] = useState([])
  const [checked, setChecked] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => setIsTimedOut(true), LOADING_TIMEOUT_MS)

    fetch('https://jsonplaceholder.typicode.com/todos', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch todos')
        return res.json()
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Unexpected response from server')
        setTodos(data)
        const initialChecked = {}
        data.forEach((t) => { initialChecked[t.id] = t.completed })
        setChecked(initialChecked)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        clearTimeout(timeout)
        setIsLoading(false)
      })

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [])

  function toggle_todo(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function ThemeToggleBtn() {
    return (
      <button
        className="theme-toggle"
        data-testid="theme-toggle"
        onClick={toggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    )
  }

  if (isLoading) {
    return (
      <div className="app-wrapper">
        <div className="app-header">
          <h1>Todos</h1>
          <ThemeToggleBtn />
        </div>
        <div className="loading-container" data-testid="loading">
          <div className="spinner" data-testid="spinner" />
          <p className="loading-text">Loading...</p>
          {isTimedOut && (
            <div className="timeout-message" data-testid="timeout-message">
              <p>This is taking longer than expected.</p>
              <button data-testid="retry-btn" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-wrapper">
        <div className="app-header">
          <h1>Todos</h1>
          <ThemeToggleBtn />
        </div>
        <p className="error-message" data-testid="error">{error}</p>
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      <div className="app-header">
        <h1>Todos</h1>
        <ThemeToggleBtn />
      </div>
      <main className="app-main" data-testid="app">
        <ul className="todo-list" data-testid="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item" data-testid={`todo-item-${todo.id}`}>
              <label className="todo-label" data-testid={`todo-label-${todo.id}`}>
                <input
                  type="checkbox"
                  data-testid={`todo-checkbox-${todo.id}`}
                  checked={checked[todo.id] ?? false}
                  onChange={() => toggle_todo(todo.id)}
                />
                {todo.title}
              </label>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App
