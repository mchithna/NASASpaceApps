import { expect, test } from '@playwright/test'

test('production refuses dev routes and does not offer mock modes', async ({
  page,
}) => {
  await page.goto('/?acceptance=training')
  await expect(
    page.getByRole('heading', { level: 1, name: 'NovaExplorer' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /isolated acceptance environment/i }),
  ).toHaveCount(0)
  for (const path of [
    '/dev/training-simulator',
    '/dev/components',
    '/missions/training-simulator/play',
  ]) {
    await page.goto(path)
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible()
  }
  await page.goto('/auth')
  await expect(
    page.getByRole('button', { name: 'Fill Demo Account Credentials' }),
  ).toHaveCount(0)
})
