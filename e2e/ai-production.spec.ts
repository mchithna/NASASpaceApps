import { expect, test } from '@playwright/test'

test('production ships the source companion without requiring credentials', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Ask Nova AI' }).click()
  const dialog = page.getByRole('dialog', { name: 'Nova AI companion' })
  await expect(
    dialog.getByText(/live AI chat and voice are not connected/i),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Space glossary' }).click()
  await expect(dialog.getByText('Telemetry', { exact: true })).toBeVisible()
  await expect(
    dialog.getByRole('link', { name: /Deep Space Network/ }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Ask Nova AI' })).toBeFocused()
})
