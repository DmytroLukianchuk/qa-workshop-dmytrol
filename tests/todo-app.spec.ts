import { test, expect } from '@playwright/test'

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows loading state before list renders', async ({ page }) => {
    await expect(page.getByTestId('loading')).toBeVisible()
    await expect(page.getByTestId('todo-list')).toBeVisible()
  })

  test('renders exactly 10 todo items', async ({ page }) => {
    await expect(page.getByTestId('todo-list')).toBeVisible()
    const items = page.locator('[data-testid^="todo-item-"]')
    await expect(items).toHaveCount(10)
  })

  test('renders exactly 10 checkboxes', async ({ page }) => {
    await expect(page.getByTestId('todo-list')).toBeVisible()
    const checkboxes = page.locator('[data-testid^="todo-checkbox-"]')
    await expect(checkboxes).toHaveCount(10)
  })

  test('toggles a checkbox on click', async ({ page }) => {
    await expect(page.getByTestId('todo-list')).toBeVisible()
    const checkbox = page.locator('[data-testid^="todo-checkbox-"]').first()
    const initial = await checkbox.isChecked()
    await checkbox.click()
    expect(await checkbox.isChecked()).toBe(!initial)
  })
})
