import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'chapter.browser.ts',
  workers: 1,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: 'list',
  outputDir: '../../../test-results/ingenuity',
  use: {
    baseURL: 'http://127.0.0.1:4186',
    browserName: 'chromium',
    channel: 'chrome',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-reduced',
      use: { viewport: { width: 375, height: 900 }, reducedMotion: 'reduce' },
    },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4186 --strictPort',
    cwd: '../../../',
    url: 'http://127.0.0.1:4186',
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_PUBLISHABLE_KEY: '',
      VITE_SUPABASE_ANON_KEY: '',
    },
  },
})
