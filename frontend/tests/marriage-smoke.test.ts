import { test, expect } from '@playwright/test';

const FRONTEND = process.env.E2E_BASE_URL || 'https://hafsa-77.web.app';

test.describe('Marriage Module — E2E Smoke Tests', () => {
  test.describe('Guardian Dashboard page', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto(`${FRONTEND}/guardian-dashboard`);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Groom Dashboard page', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto(`${FRONTEND}/groom-dashboard`);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Groom Inbox page', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto(`${FRONTEND}/groom-inbox`);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Requests page', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto(`${FRONTEND}/requests`);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Brides visible page', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.goto(`${FRONTEND}/brides/visible`);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Landing page rendering', () => {
    test('home page loads and displays app name', async ({ page }) => {
      await page.goto(FRONTEND);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveTitle(/عمر/);
    });

    test('register page has role selection for GROOM and GUARDIAN', async ({ page }) => {
      await page.goto(`${FRONTEND}/register`);
      await page.waitForLoadState('domcontentloaded');
      const groomOption = page.getByText('راغب في الزواج');
      const guardianOption = page.getByText('ولي أمر');
      await expect(groomOption).toBeVisible();
      await expect(guardianOption).toBeVisible();
    });
  });

  test.describe('API Health', () => {
    test('stats endpoint is healthy', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.get(`${API_BASE}/api/stats`);
      expect(resp.ok()).toBeTruthy();
    });

    test('received requests endpoint returns 401 without token', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.get(`${API_BASE}/api/requests/received`);
      expect(resp.status()).toBe(401);
    });

    test('guardian-dashboard returns 401 without token', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.get(`${API_BASE}/api/requests/guardian-dashboard`);
      expect(resp.status()).toBe(401);
    });

    test('groom-dashboard returns 401 without token', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.get(`${API_BASE}/api/requests/groom-dashboard`);
      expect(resp.status()).toBe(401);
    });

    test('groom-inbox returns 401 without token', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.get(`${API_BASE}/api/requests/groom-inbox`);
      expect(resp.status()).toBe(401);
    });

    test('guardian-propose returns 401 without token', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.post(`${API_BASE}/api/requests/guardian-propose`, {
        headers: { 'Content-Type': 'application/json' },
        data: { groomProfileId: 'test', brideId: 'test' },
      });
      expect(resp.status()).toBe(401);
    });

    test('marriage-success returns 401 without token', async ({ request }) => {
      const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
      const resp = await request.post(`${API_BASE}/api/requests/marriage-success`, {
        headers: { 'Content-Type': 'application/json' },
        data: { brideId: 'test' },
      });
      expect(resp.status()).toBe(401);
    });
  });
});
