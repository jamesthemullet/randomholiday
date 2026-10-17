import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// A pinned `destination` keeps the result deterministic (bypassing the engine's weighted
// randomisation), so both the markup and screenshots stay stable across runs.
const resultsUrl =
  '/results?originId=london-uk&budget=1500&distance=5000&nights=7&groupSize=2&month=6&styles=beach&destination=barcelona-spain'

const pages = [
  { name: 'home', path: '/' },
  { name: 'results', path: resultsUrl },
  { name: 'pricing', path: '/pricing' },
]

for (const { name, path } of pages) {
  test(`${name} page has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path)
    await expect(page.locator('#main-content')).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#main-content')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
}

test('destination detail modal has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.goto(resultsUrl)
  const selectButton = page.getByRole('button', { name: /see prices & book/i }).first()
  await selectButton.waitFor({ state: 'visible' })
  // The card's 3D flip transform keeps both faces overlapping in the hit-testing tree, which
  // confuses Playwright's (and the browser's) pointer-coordinate click; dispatch the click
  // event on the element directly instead.
  await selectButton.dispatchEvent('click')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
