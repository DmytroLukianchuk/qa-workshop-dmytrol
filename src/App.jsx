import { useState, useEffect } from 'react'

const LOADING_TIMEOUT_MS = 5000

function App() {
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

  const [newTitle, setNewTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function addTodo() {
    const title = newTitle.trim()
    if (!title) return
    setNewTitle('')
    setIsSubmitting(true)

    fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add todo')
        return res.json()
      })
      .then((created) => {
        setTodos((prev) => [...prev, created])
        setChecked((prev) => ({ ...prev, [created.id]: false }))
      })
      .finally(() => setIsSubmitting(false))
  }

  if (isLoading) {
    return (
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
    )
  }

  if (error) {
    return <p data-testid="error">{error}</p>
  }

  return (
    <main data-testid="app">
      <h1>Todos</h1>
      <form
        data-testid="add-todo-form"
        onSubmit={(e) => { e.preventDefault(); addTodo() }}
      >
        <input
          type="text"
          data-testid="new-todo-input"
          placeholder="New todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" data-testid="add-todo-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </form>
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
