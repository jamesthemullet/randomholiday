import { test, expect, type Locator, type Page } from '@playwright/test'

/** Presses Tab until `locator` is the focused element, so the flow never clicks directly. */
async function tabUntilFocused(page: Page, locator: Locator, maxPresses = 40): Promise<void> {
  for (let i = 0; i < maxPresses; i++) {
    const isFocused = await locator.evaluate((el) => el === document.activeElement)
    if (isFocused) return
    await page.keyboard.press('Tab')
  }
  throw new Error('Target element was never reached via Tab')
}

test('complete the full wizard and open/close the destination modal using only the keyboard', async ({
  page,
}) => {
  await page.goto('/')

  await tabUntilFocused(page, page.getByRole('link', { name: /find my holiday/i }))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/discover/)

  // Step 1: departure city — type, then pick the first match with the arrow keys.
  // Scoped to the combobox role: focusing it opens a listbox sharing the same aria-label,
  // which would otherwise make `getByLabel` ambiguous.
  const departureInput = page.getByRole('combobox', { name: /where are you flying from/i })
  await tabUntilFocused(page, departureInput)
  await page.keyboard.type('London')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  await tabUntilFocused(page, page.getByRole('button', { name: /^next$/i }))
  await page.keyboard.press('Enter')

  // Step 2: budget slider — default value is fine, just move on
  await tabUntilFocused(page, page.getByRole('button', { name: /^next$/i }))
  await page.keyboard.press('Enter')

  // Step 3: travel timing — a focused, closed <select> moves to the next option on ArrowDown
  const monthSelect = page.getByLabel(/roughly when do you want to go/i)
  await tabUntilFocused(page, monthSelect)
  await page.keyboard.press('ArrowDown')
  await tabUntilFocused(page, page.getByRole('button', { name: /^next$/i }))
  await page.keyboard.press('Enter')

  // Step 4: travel style — toggle "Beach" on with the keyboard
  const beachOption = page.getByRole('button', { name: 'Beach' })
  await tabUntilFocused(page, beachOption)
  await page.keyboard.press('Enter')
  await expect(beachOption).toHaveAttribute('aria-pressed', 'true')
  await tabUntilFocused(page, page.getByRole('button', { name: /^next$/i }))
  await page.keyboard.press('Enter')

  // Step 5: distance + group size — defaults are fine, submit the wizard
  const submitButton = page.getByRole('button', { name: /reveal my holiday/i })
  await tabUntilFocused(page, submitButton)
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/results\?/)
  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeVisible()

  const selectButton = page.getByRole('button', { name: /select destination/i }).first()
  await tabUntilFocused(page, selectButton)
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(selectButton).toBeFocused()
})
