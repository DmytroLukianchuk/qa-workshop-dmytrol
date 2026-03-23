import { useState, useEffect, useRef } from 'react'

const LOADING_TIMEOUT_MS = 5000

function App() {
  const [todos, setTodos] = useState([])
  const [checked, setChecked] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [userName, setUserName] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then((res) => res.json())
      .then((data) => setUserName(data.name))
      .catch(() => {})
  }, [])

  const dragIndex = useRef(null)

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleDragStart(index) {
    dragIndex.current = index
  }

  function handleDrop(index) {
    if (dragIndex.current === null || dragIndex.current === index) return
    setTodos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex.current, 1)
      next.splice(index, 0, moved)
      return next
    })
    dragIndex.current = null
  }

  function clearCompleted() {
    const completedIds = new Set(todos.filter((t) => checked[t.id]).map((t) => t.id))
    setTodos((prev) => prev.filter((t) => !completedIds.has(t.id)))
    setChecked((prev) => {
      const next = { ...prev }
      completedIds.forEach((id) => delete next[id])
      return next
    })
  }

  const completedCount = todos.filter((t) => checked[t.id]).length

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
    return (
      <div className="error-card" data-testid="error-state">
        <h2 data-testid="error-title">Something went wrong</h2>
        <p data-testid="error-message">{error}</p>
        <button data-testid="retry-btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    )
  }

  if (todos.length === 0) {
    return <p data-testid="empty-state">No todos found.</p>
  }

  const filtered = todos.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <main className="app" data-testid="app">
      <h1>Todos</h1>
      <p data-testid="completion-counter">{completedCount}/{todos.length} completed</p>
      {userName && <p data-testid="logged-in-as">Logged in as {userName}</p>}
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
      <button data-testid="clear-completed-btn" onClick={clearCompleted}>
        Clear Completed
      </button>
      <input
        type="text"
        data-testid="search-input"
        placeholder="Search todos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul data-testid="todo-list">
        {filtered.map((todo, index) => (
          <li
            key={todo.id}
            data-testid={`todo-item-${todo.id}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
          >
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
