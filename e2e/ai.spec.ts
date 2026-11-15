import { expect, test } from '@playwright/test'

test('Nova is visible across layouts and provides source tools without a provider', async ({
  page,
}, testInfo) => {
  const providerRequests: string[] = []
  page.on('request', (request) => {
    if (/generativelanguage|aiplatform|gemini/i.test(request.url()))
      providerRequests.push(request.url())
  })
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Ask Nova AI' })
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'Nova AI companion' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Telemetry', exact: true }).click()
  await expect(
    dialog.getByRole('link', { name: /Deep Space Network/ }),
  ).toBeVisible()
  await dialog
    .getByLabel('What would you like to explore?')
    .fill('Unknown topic')
  await dialog.getByRole('button', { name: 'Ask source guide' }).click()
  await expect(dialog.getByText(/I don’t have a reviewed answer/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Clear conversation' }).click()
  await expect(dialog.getByRole('list', { name: 'Conversation' })).toBeEmpty()
  await page.keyboard.press('Escape')
  await expect(launcher).toBeFocused()
  for (const route of [
    '/dashboard',
    '/journal',
    '/profile',
    '/achievements',
    '/missions/opportunity',
    '/missions/opportunity/play',
    '/auth',
  ]) {
    await page.goto(route)
    await expect(launcher).toBeVisible()
  }
  await page.goto('/missions/opportunity')
  await launcher.click()
  await dialog.getByRole('button', { name: 'Mission briefing' }).click()
  await expect(dialog.getByRole('combobox')).toHaveValue('opportunity')
  await dialog.getByLabel('Explain simply').check()
  await expect(
    dialog.getByText(/Opportunity was a robot that drove/),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Space glossary' }).click()
  await expect(dialog.getByText('Seismometer', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Live voice' }).click()
  await expect(
    dialog.getByRole('heading', { name: 'Live voice is not available yet' }),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Use source guide' }).click()
  await expect(dialog.getByRole('list', { name: 'Conversation' })).toBeEmpty()
  const box = await dialog.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  await page.screenshot({ path: testInfo.outputPath('nova-companion.png') })
  expect(providerRequests).toEqual([])
})
