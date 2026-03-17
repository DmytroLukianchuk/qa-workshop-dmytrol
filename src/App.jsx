import { useState, useEffect } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [checked, setChecked] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch todos')
        return res.json()
      })
      .then((data) => {
        setTodos(data)
        setChecked(Object.fromEntries(data.map((t) => [t.id, t.completed])))
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) {
    return <p data-testid="loading">Loading...</p>
  }

  if (error) {
    return <p data-testid="error">{error}</p>
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !checked[t.id]))
  }

  const completedCount = todos.filter((t) => checked[t.id]).length

  return (
    <main data-testid="app">
      <h1>Todos</h1>
      <p data-testid="completion-counter">{completedCount}/{todos.length} completed</p>
      <button data-testid="clear-completed-btn" onClick={clearCompleted}>
        Clear Completed
      </button>
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
