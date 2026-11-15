import { expect, test } from '@playwright/test'

test('landing navigation, assets, keyboard menu and image fallback', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Some Missions End.',
  )
  const nav = page.getByRole('navigation', { name: 'Main Navigation' })
  const toggle = nav.getByRole('button', { name: 'Open navigation menu' })
  if (await toggle.isVisible()) {
    await toggle.click()
    await page
      .locator('#landing-menu')
      .getByRole('link', { name: 'About', exact: true })
      .focus()
    await page.keyboard.press('Escape')
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await page
      .locator('#landing-menu')
      .getByRole('link', { name: 'Explore Missions', exact: true })
      .click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  } else {
    await nav.getByRole('link', { name: 'Explore Missions' }).click()
  }
  await expect(page.locator('#featured-missions')).toBeFocused()
  await expect(page.locator('.lp-mission-card')).toHaveCount(5)
  for (const image of await page.locator('.lp-card-image img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    expect(
      await image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    ).toBe(true)
  }
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }
  await page.screenshot({
    path: testInfo.outputPath('landing-page.png'),
    fullPage: true,
  })
  await page.getByRole('link', { name: /Explore Opportunity:/ }).click()
  await expect(page).toHaveURL(/\/missions\/opportunity$/)
  await page.goto('/')
  await page.getByRole('link', { name: 'Begin Your Journey' }).click()
  await expect(page).toHaveURL(/\/onboarding$/)
  await page.route('**/landing/opportunity-*.webp', (route) => route.abort())
  await page.goto('/')
  await page.locator('#featured-missions').scrollIntoViewIfNeeded()
  await expect(page.getByText('Image unavailable')).toBeVisible()
  await page.getByRole('link', { name: /Explore Opportunity:/ }).click()
  await expect(page).toHaveURL(/\/missions\/opportunity$/)
})
