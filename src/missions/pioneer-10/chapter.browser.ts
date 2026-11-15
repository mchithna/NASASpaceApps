import { expect, test } from '@playwright/test'
import { plaqueMatch, scienceTargets } from './content.ts'

test('Pioneer 10: seven-scene journey, retries, keyboard, resume, journal, 100 XP and replay', async ({
  page,
}, info) => {
  const errors: string[] = []
  const missing: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (
      response.url().includes('/assets/missions/pioneer-10/') &&
      !response.ok()
    )
      missing.push(response.url())
  })
  await page.route(/\/(auth|rest)\/v1\//, (route) => route.abort())
  const button = (name: string | RegExp) =>
    page.getByRole('button', { name, exact: typeof name === 'string' })
  const heading = (name: string) =>
    page.getByRole('heading', { name, level: 2, exact: true })
  const minimize = async () => {
    const control = button('Minimize dev banner')
    if (await control.isVisible()) await control.click()
  }
  const fits = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  await page.goto('/?acceptance=training')
  await minimize()
  await page.getByRole('link', { name: 'Begin Your Journey' }).click()
  await page.getByLabel('Choose Callsign').fill('Cosmic Messenger')
  await button('Save Profile & Enter Mission Control').click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/missions/pioneer-10')
  await minimize()
  await page.getByRole('link', { name: 'Start mission', exact: true }).click()
  await minimize()
  await button('Start').click()
  await expect(heading('The Last Whisper From Deep Space')).toBeVisible()
  await fits()
  await button('Trace the Signal').click()
  for (const name of [
    /^1. High-Gain/,
    /^2. Radioisotope/,
    /^3. Magnetometer/,
    /^4. Scientific Instruments/,
  ]) {
    await button(name).focus()
    await page.keyboard.press('Enter')
  }
  await page
    .getByText('Review NASA’s instrument-location reference', { exact: true })
    .click()
  await expect(
    page.getByAltText(/NASA’s labeled Pioneer 10 scientific/),
  ).toBeVisible()
  await fits()
  await button('Finish spacecraft inspection').click()
  await button('Check order').click()
  await expect(page.getByText(/That order is not right yet/)).toBeVisible()
  await button('Move Beyond Mars up').click()
  await button('Check order').click()
  await button('Run the debris survey').click()
  await page
    .getByLabel(
      'The asteroid belt is a tightly packed wall requiring constant dodging.',
    )
    .check()
  await button('Check choice').click()
  await expect(page.getByText(/That choice is not right yet/)).toBeVisible()
  await page
    .getByLabel(
      'The belt is mostly empty space; measuring dust and debris helped assess spacecraft risks.',
    )
    .check()
  await button('Check choice').click()
  await button('Save asteroid belt findings').click()
  await expect(heading('Jupiter: A Giant Revealed')).toBeVisible()
  await page.reload()
  await minimize()
  await expect(heading('Jupiter: A Giant Revealed')).toBeVisible()
  await button('Begin Jupiter approach').click()
  await button('Enter science encounter').click()
  await page.getByLabel('Imaging photopolarimeter', { exact: true }).check()
  await button('Collect observation').click()
  await expect(page.getByText(/Try another instrument/)).toBeVisible()
  for (const target of scienceTargets) {
    await button(new RegExp(`^${target.title}`)).click()
    await page.getByLabel(target.instrument, { exact: true }).check()
    await button('Collect observation').click()
  }
  await fits()
  await page.screenshot({
    path: info.outputPath('jupiter-flyby.png'),
    fullPage: true,
  })
  await button('Continue beyond Jupiter').click()
  await expect(
    page.getByAltText(/Composite of Pioneer 10 observations/),
  ).toBeVisible()
  await button('Save Jupiter investigation').click()
  await expect(heading('A Message From Humanity')).toBeVisible()
  for (const name of [
    /^1. Hydrogen reference/,
    /^2. Pulsar map/,
    /^3. Human figures/,
    /^4. Solar system/,
  ])
    await button(name).click()
  await expect(
    page.getByAltText(/Authentic Pioneer plaque diagram/),
  ).toBeVisible()
  await button('Zoom selected symbol').click()
  await fits()
  await button('Show full plaque').click()
  await button('Check matches').click()
  await expect(page.getByText(/Those matches are not right yet/)).toBeVisible()
  for (const card of plaqueMatch.evidence) {
    const meaning = plaqueMatch.meanings.find(
      (item) => item.id === card.meaningId,
    )!
    await page
      .getByRole('group', { name: card.label, exact: true })
      .getByRole('button', { name: meaning.label, exact: true })
      .click()
  }
  await button('Check matches').click()
  await page.screenshot({ path: info.outputPath('plaque.png'), fullPage: true })
  await button('Save Pioneer plaque discovery').click()
  await expect(heading('The Faintest Voice Across the Stars')).toBeVisible()
  await page.getByRole('slider').focus()
  await page.keyboard.press('End')
  await expect(page.getByText('11 h 20 min', { exact: true })).toBeVisible()
  await button('January 23, 2003 — Last detected signal').click()
  await button(/^Increasing Distance/).click()
  await button(/^Decreasing Electrical Power/).click()
  await page.getByLabel('Jupiter destroyed the spacecraft in 1973.').check()
  await button('Check choice').click()
  await expect(page.getByText(/That choice is not right yet/)).toBeVisible()
  await page
    .getByLabel(
      'Its available power declined and the already faint signal became undetectable.',
    )
    .check()
  await button('Check choice').click()
  await page
    .getByText('See NASA’s Deep Space Network antennas', { exact: true })
    .click()
  await expect(page.getByAltText(/Large radio dishes/)).toBeVisible()
  await fits()
  await page.screenshot({
    path: info.outputPath('signal-lab.png'),
    fullPage: true,
  })
  await button('Finish communication investigation').click()
  await expect(heading('The Messenger That Never Came Home')).toBeVisible()
  await button('Move 1972 — Launch from Earth up').click()
  await button('Move 1973 — Jupiter flyby up').click()
  await button('Check order').click()
  await button('Complete Pioneer 10 mission').click()
  await expect(
    page.getByText('Chapter complete', { exact: true }),
  ).toBeVisible()
  await button('Start again').click()
  await expect(heading('The Last Whisper From Deep Space')).toBeVisible()
  await button('Next').click()
  await expect(heading('Meet Pioneer 10')).toBeVisible()
  await page.goto('/profile')
  await minimize()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  await page.goto('/journal')
  await minimize()
  await expect(
    page.getByText('The Pioneer Plaque — A Message From Humanity', {
      exact: true,
    }),
  ).toBeVisible()
  await page.goto('/achievements')
  await minimize()
  await expect(
    page.getByText('Pioneer 10 story', { exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
  expect(missing).toEqual([])
})
