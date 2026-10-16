import { test, expect } from '@playwright/test'

test('full happy path: landing → discover wizard → results → destination detail', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: /find my holiday/i }).click()
  await expect(page).toHaveURL(/\/discover/)

  // Step 1: departure city
  await page.getByLabel(/where are you flying from/i).fill('London')
  await page.getByRole('option', { name: /london/i }).click()
  await page.getByRole('button', { name: /^next$/i }).click()

  // Step 2: budget (default value is fine for this flow)
  await page.getByRole('button', { name: /^next$/i }).click()

  // Step 3: travel timing
  await page.getByLabel(/roughly when do you want to go/i).selectOption('6')
  await page.getByRole('button', { name: /^next$/i }).click()

  // Step 4: travel style
  await page.getByRole('button', { name: 'Beach' }).click()
  await page.getByRole('button', { name: /^next$/i }).click()

  // Step 5: max distance + group size (defaults are fine)
  await page.getByRole('button', { name: /reveal my holiday/i }).click()

  await expect(page).toHaveURL(/\/results\?/)
  const resultsUrl = new URL(page.url())
  expect(resultsUrl.searchParams.get('originId')).toBe('london-uk')
  expect(resultsUrl.searchParams.get('month')).toBe('6')
  expect(resultsUrl.searchParams.get('styles')).toBe('beach')

  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeVisible()

  const selectButton = page.getByRole('button', { name: /select destination/i }).first()
  await selectButton.waitFor({ state: 'visible' })
  // The card's 3D flip transform overlaps both faces in the hit-testing tree, which confuses
  // Playwright's pointer-coordinate click; dispatch the click event on the element directly.
  await selectButton.dispatchEvent('click')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Cost breakdown')).toBeVisible()
  await expect(dialog.getByRole('link', { name: /skyscanner/i })).toBeVisible()
  await expect(dialog.getByRole('link', { name: /booking\.com/i })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: /shuffle/i }).click()
  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeVisible()
  await expect(page.getByRole('button', { name: /select destination/i }).first()).toBeVisible()
})
