import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test('client fills out intake and admin sees submission', async ({ browser }) => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'admin creds required');

  // --- Admin creates a client and grabs the intake URL ---
  const adminCtx = await browser.newContext();
  const adminPage = await adminCtx.newPage();
  await adminPage.goto('/login');
  await adminPage.getByLabel('Email').fill(ADMIN_EMAIL);
  await adminPage.getByLabel('Password').fill(ADMIN_PASSWORD);
  await adminPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(adminPage).toHaveURL(/\/dashboard/);

  await adminPage.getByRole('button', { name: 'New client' }).click();
  const clientName = `E2E Intake ${Date.now()}`;
  await adminPage.getByLabel('Client name').fill(clientName);
  await adminPage.getByRole('button', { name: 'Create' }).click();

  await expect(adminPage.getByText('Intake link ready')).toBeVisible();
  const intakeUrl = await adminPage.locator('input[readonly]').inputValue();
  expect(intakeUrl).toMatch(/\/intake\/[0-9a-f-]{36}$/);

  // --- Client opens the link in a new context and submits ---
  const clientCtx = await browser.newContext();
  const clientPage = await clientCtx.newPage();
  await clientPage.goto(intakeUrl);

  await expect(clientPage.getByRole('heading', { name: new RegExp(`Welcome, ${clientName}`) })).toBeVisible();

  await clientPage.getByLabel('About your project / business').fill('Test project description.');
  await clientPage.getByLabel('A website you like (for reference)').fill('https://stripe.com');

  // Upload one small test image
  const tmpPath = path.join(process.cwd(), 'tests', 'e2e', 'pixel.png');
  if (!fs.existsSync(tmpPath)) {
    // 1x1 transparent PNG
    const buf = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626000000000050001a5f645400000000049454e44ae426082', 'hex');
    fs.writeFileSync(tmpPath, buf);
  }
  await clientPage.locator('input[type=file]').first().setInputFiles(tmpPath);

  await clientPage.getByRole('button', { name: 'Submit' }).click();
  await expect(clientPage).toHaveURL(/\/intake\/[0-9a-f-]{36}\/success/);
  await expect(clientPage.getByRole('heading', { name: /Thank you/ })).toBeVisible();

  // --- Admin refreshes and sees the client as 'submitted' ---
  await adminPage.goto('/dashboard');
  const row = adminPage.getByRole('row', { name: new RegExp(clientName) });
  await expect(row.getByText(/submitted/i)).toBeVisible();
});
