import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('test-01 renders the todo list after loading', async ({ page }) => {
  await expect(page.getByTestId('todo-list')).toBeVisible()
})

test('test-02 renders at least one todo item', async ({ page }) => {
  await expect(page.getByTestId('todo-list')).toBeVisible()
  const items = page.locator('[data-testid^="todo-item-"]')
  await expect(items.first()).toBeVisible()
})

test('test-03 at least one checkbox is visible', async ({ page }) => {
  const checkbox = page.locator('[data-testid^="todo-checkbox-"]').first()
  await expect(checkbox).toBeVisible()
})

test('fourth test - check all todos, click Clear Completed, list disappears and empty state appears', async ({ page }) => {
  await expect(page.getByTestId('todo-list')).toBeVisible()
  const checkboxes = page.locator('[data-testid^="todo-checkbox-"]')
  const count = await checkboxes.count()
  for (let i = 0; i < count; i++) {
    const checkbox = checkboxes.nth(i)
    if (!(await checkbox.isChecked())) {
      await checkbox.click()
    }
  }
  await page.getByTestId('clear-completed-btn').click()
  await expect(page.getByTestId('todo-list')).not.toBeVisible()
  await expect(page.getByTestId('empty-state')).toBeVisible()
  await expect(page.getByTestId('empty-state')).toHaveText('No todos found.')
})
