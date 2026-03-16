import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    actionTimeout: 15000,
  },
  expect: {
    timeout: 15000,
  },
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})
