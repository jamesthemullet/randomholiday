import { test, expect } from '@playwright/test'

test('homepage loads with the trip search form inline', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /your next adventure/i })).toBeVisible()
  await expect(page.getByRole('form', { name: /find your holiday/i })).toBeVisible()
})

test('the retired /discover page redirects to the homepage form', async ({ page }) => {
  await page.goto('/discover')

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('form', { name: /find your holiday/i })).toBeVisible()
})
