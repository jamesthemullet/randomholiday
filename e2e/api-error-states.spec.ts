import { test, expect } from '@playwright/test'

// A pinned `destination` keeps the result deterministic, matching the pattern used in
// e2e/accessibility.spec.ts.
const resultsUrl =
  '/results?originId=london-uk&budget=1500&distance=5000&nights=7&groupSize=2&month=6&styles=beach&destination=barcelona-spain'

async function openDestinationModal(page: import('@playwright/test').Page) {
  await page.goto(resultsUrl)
  const selectButton = page.getByRole('button', { name: /select destination/i }).first()
  await selectButton.waitFor({ state: 'visible' })
  // The card's 3D flip transform overlaps both faces in the hit-testing tree, which confuses
  // Playwright's pointer-coordinate click; dispatch the click event on the element directly.
  await selectButton.dispatchEvent('click')
  return page.getByRole('dialog')
}

test('falls back to a static weather message when the weather API returns an error', async ({
  page,
}) => {
  await page.route('**/api/weather**', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
  )

  const dialog = await openDestinationModal(page)
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Weather estimate unavailable right now.')).toBeVisible()

  // The rest of the modal still renders normally despite the weather failure.
  await expect(dialog.getByText('Cost breakdown')).toBeVisible()
  await expect(dialog.getByRole('link', { name: /skyscanner/i })).toBeVisible()
})

test('falls back to the same message when the weather request is aborted entirely', async ({
  page,
}) => {
  await page.route('**/api/weather**', (route) => route.abort())

  const dialog = await openDestinationModal(page)
  await expect(dialog.getByText('Weather estimate unavailable right now.')).toBeVisible()
})
