import config from './playwright.config.ts'
export default {
  ...config,
  webServer: undefined,
  outputDir: 'C:/Users/yasin/.codex/visualizations/2026/11/15/01a1ddea-efe2-7652-b322-6ff6faff288d/platform-tests',
  use: { ...config.use, baseURL: 'http://127.0.0.1:4384' },
}
