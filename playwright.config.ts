import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const installedChrome =
  process.platform === 'win32' &&
  existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    browserName: 'chromium',
    channel:
      process.env.PLAYWRIGHT_CHANNEL ||
      (installedChrome ? 'chrome' : undefined),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174',
      reuseExistingServer: false,
      env: {
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_PUBLISHABLE_KEY: '',
        VITE_SUPABASE_ANON_KEY: '',
      },
    },
    {
      command: 'npm run preview -- --host 127.0.0.1 --port 4175 --strictPort',
      url: 'http://127.0.0.1:4175',
      reuseExistingServer: false,
    },
  ],
  projects: [
    ...[
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1280 },
    ].map(({ name, width }) => ({
      name,
      testIgnore: /production\.spec\.ts/,
      use: {
        viewport: { width, height: 900 },
        reducedMotion: 'reduce' as const,
      },
    })),
    {
      name: 'production',
      testMatch: /production\.spec\.ts/,
      use: {
        baseURL: 'http://127.0.0.1:4175',
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
})
