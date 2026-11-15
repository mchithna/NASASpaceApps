import { expect, test } from '@playwright/test'

test('production pages and the companion render without a missing AI provider', async ({
  page,
}) => {
  test.setTimeout(120000)
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  for (const route of [
    '/',
    '/auth',
    '/dashboard',
    '/profile',
    '/journal',
    '/achievements',
    '/missions/opportunity',
    '/missions/opportunity/play',
  ]) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByText('Unexpected Application Error!')).toHaveCount(0)
    await expect(page.getByText(/useNovaAi must be used within/)).toHaveCount(0)

    const launcher = page.getByRole('button', { name: 'Ask Nova AI' })
    await expect(launcher).toHaveCount(1)
    await launcher.click()
    await expect(launcher).toHaveAttribute('aria-expanded', 'true')
    const dialog = page.getByRole('dialog', { name: 'Nova AI chat' })
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByText('NASA missions guide', { exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(launcher).toHaveAttribute('aria-expanded', 'false')
    await expect(launcher).toBeFocused()
  }

  expect(runtimeErrors).toEqual([])
})

test('page prompts share the chat, display sources and recover from an AI outage', async ({
  page,
}) => {
  await page.route('**/api/ai/health', (route) =>
    route.fulfill({
      json: { isConfigured: true, provider: 'Test provider' },
    }),
  )
  await page.route('**/api/ai/chat', (route) =>
    route.fulfill({
      contentType: 'text/event-stream',
      body: [
        'data: {"chunk":"Shared browser test answer"}',
        'data: {"done":true,"model":"test-model","sources":[{"title":"NASA","url":"https://www.nasa.gov/"}]}',
        '',
      ].join('\n\n'),
    }),
  )
  await page.goto('/')
  await page
    .getByRole('button', { name: 'How does NovaExplorer work?', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Nova AI chat' })
  await expect(dialog).toHaveClass(/open/)
  await expect(
    dialog.getByText('Shared browser test answer', { exact: true }),
  ).toBeVisible()
  await expect(
    dialog.getByRole('link', { name: 'NASA', exact: true }),
  ).toHaveAttribute('href', 'https://www.nasa.gov/')
  await dialog.getByRole('button', { name: 'New chat', exact: true }).click()
  await expect(
    dialog.getByText('Shared browser test answer', { exact: true }),
  ).toHaveCount(0)

  await page.route('**/api/ai/chat', (route) =>
    route.fulfill({ status: 503, json: { error: 'Test outage' } }),
  )
  await dialog
    .getByRole('textbox', { name: 'Ask about a mission' })
    .fill('What is telemetry?')
  await dialog.getByRole('button', { name: 'Send question' }).click()
  await expect(
    dialog.getByText('Source guide answer — live AI is unavailable.'),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Ask Nova AI' })).toBeFocused()
})
