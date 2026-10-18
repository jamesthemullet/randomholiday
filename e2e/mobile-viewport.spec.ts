import { test, expect } from '@playwright/test'

// A pinned `destination` keeps the result deterministic, matching the pattern used in
// e2e/accessibility.spec.ts.
const resultsUrl =
  '/results?originId=london-uk&budget=1500&distance=5000&nights=7&groupSize=2&month=6&styles=beach&destination=barcelona-spain'

test.use({ viewport: { width: 360, height: 740 } })

const pages = [
  { name: 'home', path: '/' },
  { name: 'results', path: resultsUrl },
  { name: 'pricing', path: '/pricing' },
]

for (const { name, path } of pages) {
  test(`${name} page has no horizontal overflow at a narrow viewport`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('#main-content')).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth)
  })
}

test('the homepage form → results flow works on a narrow viewport', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('combobox', { name: /where are you flying from/i }).fill('London')
  await page.getByRole('option', { name: /london/i }).click()
  await page.getByRole('button', { name: 'Surprise me' }).click()

  await expect(page).toHaveURL(/\/results\?/)
  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeVisible()
})

test('the destination detail modal is usable on a narrow viewport', async ({ page }) => {
  await page.goto(resultsUrl)

  const selectButton = page.getByRole('button', { name: /see prices & book/i }).first()
  await selectButton.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Cost breakdown')).toBeVisible()

  const dialogBox = await dialog.boundingBox()
  const viewportWidth = await page.evaluate(() => window.innerWidth)
  expect(dialogBox?.width).toBeLessThanOrEqual(viewportWidth)
})
