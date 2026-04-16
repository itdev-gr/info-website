import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test('admin can log in and create a client', async ({ page }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set');

  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('button', { name: 'New client' }).click();
  const name = `E2E Test ${Date.now()}`;
  await page.getByLabel('Client name').fill(name);
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByText('Intake link ready')).toBeVisible();
  const linkInput = page.locator('input[readonly]');
  await expect(linkInput).toHaveValue(/\/intake\/[0-9a-f-]{36}$/);
});
