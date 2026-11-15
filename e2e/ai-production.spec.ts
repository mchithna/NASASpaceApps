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
