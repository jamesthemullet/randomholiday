import { test, expect } from '@playwright/test'

test('full happy path: homepage form → results → destination detail → change answers', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: /where are you flying from/i }).fill('London')
  await page.getByRole('option', { name: /london/i }).click()

  // Optional filters live under "More options"
  await page.getByRole('button', { name: /more options/i }).click()
  await page.getByRole('button', { name: 'June' }).click()
  await page.getByRole('button', { name: 'Beach' }).click()

  await page.getByRole('button', { name: 'Surprise me' }).click()

  await expect(page).toHaveURL(/\/results\?/)
  const resultsUrl = new URL(page.url())
  expect(resultsUrl.searchParams.get('originId')).toBe('london-uk')
  expect(resultsUrl.searchParams.get('month')).toBe('6')
  expect(resultsUrl.searchParams.get('styles')).toBe('beach')

  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeAttached()

  // Guards against the postcard collapsing to zero width, which `toBeVisible` doesn't catch.
  // Polled because the results tree can be re-rendered right after hydration.
  const postcard = page.getByRole('article')
  await expect.poll(async () => (await postcard.boundingBox())?.width ?? 0).toBeGreaterThan(200)

  await page.getByRole('button', { name: /see prices & book/i }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Cost breakdown')).toBeVisible()
  await expect(dialog.getByRole('link', { name: /skyscanner/i })).toBeVisible()
  await expect(dialog.getByRole('link', { name: /booking\.com/i })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()

  await page.getByRole('button', { name: 'Spin again' }).click()
  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeAttached()
  await expect(page.getByRole('button', { name: /see prices & book/i })).toBeVisible()

  // "Change my answers" reopens the homepage form with the previous answers filled in
  await page.getByRole('link', { name: 'Change my answers' }).click()
  await expect(page).toHaveURL(/\/\?/)
  await expect(page.getByRole('combobox', { name: /where are you flying from/i })).toHaveValue(
    'London'
  )
  await expect(page.getByRole('button', { name: /more options/i })).toHaveAttribute(
    'aria-expanded',
    'true'
  )
  await expect(page.getByRole('button', { name: 'June' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Beach' })).toHaveAttribute('aria-pressed', 'true')
})
