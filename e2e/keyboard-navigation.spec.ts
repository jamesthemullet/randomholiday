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

test('complete the search form and open/close the destination modal using only the keyboard', async ({
  page,
}) => {
  await page.goto('/')

  // Departure city — type, then pick the first match with the arrow keys.
  // Scoped to the combobox role: focusing it opens a listbox sharing the same aria-label,
  // which would otherwise make `getByLabel` ambiguous.
  const departureInput = page.getByRole('combobox', { name: /where are you flying from/i })
  await tabUntilFocused(page, departureInput)
  await page.keyboard.type('London')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')

  // Budget and trip length defaults are fine. Open "More options" from the keyboard.
  const moreOptions = page.getByText('More options')
  await tabUntilFocused(page, moreOptions)
  await page.keyboard.press('Enter')

  // Travel month — a focused, closed <select> moves to the next option on ArrowDown
  const monthSelect = page.getByLabel(/roughly when do you want to go/i)
  await tabUntilFocused(page, monthSelect)
  await page.keyboard.press('ArrowDown')

  // Travel style — toggle "Beach" on with the keyboard, which must not submit the form
  const beachOption = page.getByRole('button', { name: 'Beach' })
  await tabUntilFocused(page, beachOption)
  await page.keyboard.press('Enter')
  await expect(beachOption).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/\/$/)

  const submitButton = page.getByRole('button', { name: /surprise me/i })
  await tabUntilFocused(page, submitButton)
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/results\?/)
  await expect(page.getByRole('heading', { name: 'Your Match' })).toBeVisible()

  const selectButton = page.getByRole('button', { name: /see prices & book/i }).first()
  await tabUntilFocused(page, selectButton)
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(selectButton).toBeFocused()
})
