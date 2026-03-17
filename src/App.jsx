import { useState, useEffect } from 'react'

const LOADING_TIMEOUT_MS = 5000

function App() {
  const [todos, setTodos] = useState([])
  const [checked, setChecked] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulated never-resolving fetch
    new Promise(() => {})

    const timeout = setTimeout(() => setIsTimedOut(true), LOADING_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [])

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) {
    return (
      <div className="loading-container" data-testid="loading">
        <div className="spinner" data-testid="spinner" />
        <p className="loading-text">Loading todos...</p>
        {isTimedOut && (
          <div className="timeout-message" data-testid="timeout-message">
            <p>This is taking longer than expected.</p>
            <button data-testid="retry-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return <p data-testid="error">{error}</p>
  }

  return (
    <main data-testid="app">
      <h1>Todos</h1>
      <ul data-testid="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} data-testid={`todo-item-${todo.id}`}>
            <label data-testid={`todo-label-${todo.id}`}>
              <input
                type="checkbox"
                data-testid={`todo-checkbox-${todo.id}`}
                checked={checked[todo.id] ?? false}
                onChange={() => toggle(todo.id)}
              />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
