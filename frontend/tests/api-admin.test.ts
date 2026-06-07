import { test, expect } from '@playwright/test';

const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';
const FRONTEND = process.env.E2E_BASE_URL || 'https://hafsa-77.web.app';

test.describe('Socket and Admin API (E2E)', () => {
  test('socket proxy responds at /hafsa/socket.io without network error', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/socket.io/?EIO=4&transport=polling`);
    expect(resp.ok()).toBeTruthy();
    const text = await resp.text();
    expect(text).toContain('sid');
    expect(text).toContain('upgrades');
  });

  test('stats API returns all 6 fields', async ({ request }) => {
    const resp = await request.get(`${API_BASE}/api/stats`);
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('profiles');
    expect(data).toHaveProperty('posts');
    expect(data).toHaveProperty('messages');
    expect(data).toHaveProperty('businesses');
    expect(data).toHaveProperty('orders');
  });

  test('landing page renders without crashing', async ({ page }) => {
    await page.goto(FRONTEND);
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/عمر/);
  });

  test('admin dashboard API returns data with valid admin token', async ({ request }) => {
    const token = process.env.E2E_ADMIN_TOKEN;
    if (!token) {
      test.skip(true, 'E2E_ADMIN_TOKEN not set in env');
      return;
    }
    const resp = await request.get(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    expect(data).toHaveProperty('totalUsers');
  });
});
