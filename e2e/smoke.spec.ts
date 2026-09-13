import { test, expect } from '@playwright/test'

test('homepage loads and links to the discover flow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /your next adventure/i })).toBeVisible()

  await page.getByRole('link', { name: /find my holiday/i }).click()
  await expect(page).toHaveURL(/\/discover/)
})
