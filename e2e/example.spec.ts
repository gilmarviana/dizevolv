import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dizevolv/i);
});

test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Dizevolv').first()).toBeVisible();
});
