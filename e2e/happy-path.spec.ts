import { test, expect } from '@playwright/test'

test('full happy path: homepage form → results → destination detail → change search', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: /where are you flying from/i }).fill('London')
  await page.getByRole('option', { name: /london/i }).click()

  // Optional filters live under "More options"
  await page.getByText('More options').click()
  await page.getByLabel(/roughly when do you want to go/i).selectOption('6')
  await page.getByRole('button', { name: 'Beach' }).click()

  await page.getByRole('button', { name: /surprise me/i }).click()

  await expect(page).toHaveURL(/\/results\?/)
  const resultsUrl = new URL(page.url())
  expect(resultsUrl.searchParams.get('originId')).toBe('london-uk')
  expect(resultsUrl.searchParams.get('month')).toBe('6')
  expect(resultsUrl.searchParams.get('styles')).toBe('beach')

  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeVisible()

  // Guards against the card wrapper collapsing to zero width, which `toBeVisible` doesn't catch.
  // Measures the name's block-level parent, which spans the card (the h2 itself is only as wide
  // as its text). Polled because the results tree can be re-rendered right after hydration.
  const cardContent = page.locator('main h2').first().locator('xpath=..')
  await expect.poll(async () => (await cardContent.boundingBox())?.width ?? 0).toBeGreaterThan(200)

  const selectButton = page.getByRole('button', { name: /see prices & book/i }).first()
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
  await expect(page.getByRole('button', { name: /see prices & book/i }).first()).toBeVisible()

  // "Change search" reopens the homepage form with the previous answers filled in
  await page.getByRole('link', { name: /change search/i }).click()
  await expect(page).toHaveURL(/\/\?/)
  await expect(page.getByRole('combobox', { name: /where are you flying from/i })).toHaveValue(
    'London'
  )
  await expect(page.getByLabel(/roughly when do you want to go/i)).toHaveValue('6')
  await expect(page.getByRole('button', { name: 'Beach' })).toHaveAttribute('aria-pressed', 'true')
})
