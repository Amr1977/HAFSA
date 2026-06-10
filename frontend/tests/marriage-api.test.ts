import { test, expect } from '@playwright/test';

const API_BASE = process.env.E2E_API_BASE || 'https://commerce-api.et3am.com/hafsa';

test.describe('Marriage Module API — Integration', () => {
  const GUARDIAN_TOKEN = process.env.E2E_GUARDIAN_TOKEN;
  const GROOM_TOKEN = process.env.E2E_GROOM_TOKEN;

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  test.describe('Guardian Inbox (getReceivedRequests)', () => {
    test('returns requests with full groom profile and bride details when token is provided', async ({ request }) => {
      test.skip(!GUARDIAN_TOKEN, 'E2E_GUARDIAN_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/requests/received`, {
        headers: auth(GUARDIAN_TOKEN!),
      });
      expect(resp.ok()).toBeTruthy();
      const data = await resp.json();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        const req = data[0];
        expect(req).toHaveProperty('sender');
        expect(req.sender).toHaveProperty('profile');
        expect(req.sender.profile).toHaveProperty('displayName');
        expect(req).toHaveProperty('bride');
        expect(req).toHaveProperty('conversation');
      }
    });

    test('returns 401 without auth token', async ({ request }) => {
      const resp = await request.get(`${API_BASE}/api/requests/received`);
      expect(resp.status()).toBe(401);
    });
  });

  test.describe('Guardian Dashboard', () => {
    test('returns stats and brides when token is provided', async ({ request }) => {
      test.skip(!GUARDIAN_TOKEN, 'E2E_GUARDIAN_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/requests/guardian-dashboard`, {
        headers: auth(GUARDIAN_TOKEN!),
      });
      expect(resp.ok()).toBeTruthy();
      const data = await resp.json();
      expect(data).toHaveProperty('stats');
      expect(data.stats).toHaveProperty('bridesCount');
      expect(data.stats).toHaveProperty('pendingRequests');
      expect(data).toHaveProperty('brides');
      expect(Array.isArray(data.brides)).toBe(true);
    });

    test('returns 403 for non-guardian role', async ({ request }) => {
      test.skip(!GROOM_TOKEN, 'E2E_GROOM_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/requests/guardian-dashboard`, {
        headers: auth(GROOM_TOKEN!),
      });
      expect(resp.status()).toBe(403);
    });
  });

  test.describe('Groom Dashboard', () => {
    test('returns profile stats and exposures when token is provided', async ({ request }) => {
      test.skip(!GROOM_TOKEN, 'E2E_GROOM_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/requests/groom-dashboard`, {
        headers: auth(GROOM_TOKEN!),
      });
      expect(resp.ok()).toBeTruthy();
      const data = await resp.json();
      expect(data).toHaveProperty('profile');
      expect(data).toHaveProperty('stats');
      expect(data.stats).toHaveProperty('exposedBridesCount');
      expect(data).toHaveProperty('recentExposures');
    });

    test('returns 403 for non-groom role', async ({ request }) => {
      test.skip(!GUARDIAN_TOKEN, 'E2E_GUARDIAN_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/requests/groom-dashboard`, {
        headers: auth(GUARDIAN_TOKEN!),
      });
      expect(resp.status()).toBe(403);
    });
  });

  test.describe('Groom Inbox', () => {
    test('returns received proposals and sent requests when token is provided', async ({ request }) => {
      test.skip(!GROOM_TOKEN, 'E2E_GROOM_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/requests/groom-inbox`, {
        headers: auth(GROOM_TOKEN!),
      });
      expect(resp.ok()).toBeTruthy();
      const data = await resp.json();
      expect(data).toHaveProperty('receivedProposals');
      expect(data).toHaveProperty('sentRequests');
      expect(Array.isArray(data.receivedProposals)).toBe(true);
      expect(Array.isArray(data.sentRequests)).toBe(true);
    });
  });

  test.describe('Guardian Propose', () => {
    test('rejects proposal with missing fields', async ({ request }) => {
      test.skip(!GUARDIAN_TOKEN, 'E2E_GUARDIAN_TOKEN not set');
      const resp = await request.post(`${API_BASE}/api/requests/guardian-propose`, {
        headers: { ...auth(GUARDIAN_TOKEN!), 'Content-Type': 'application/json' },
        data: { brideId: 'bride-1' },
      });
      expect(resp.status()).toBe(400);
      const data = await resp.json();
      expect(data.error).toBe('VALIDATION');
    });

    test('rejects proposal for non-existent groom profile', async ({ request }) => {
      test.skip(!GUARDIAN_TOKEN, 'E2E_GUARDIAN_TOKEN not set');
      const resp = await request.post(`${API_BASE}/api/requests/guardian-propose`, {
        headers: { ...auth(GUARDIAN_TOKEN!), 'Content-Type': 'application/json' },
        data: { groomProfileId: 'non-existent-id', brideId: 'bride-1' },
      });
      expect(resp.status()).toBe(404);
    });
  });

  test.describe('Marriage Success', () => {
    test('returns 401 without auth', async ({ request }) => {
      const resp = await request.post(`${API_BASE}/api/requests/marriage-success`, {
        headers: { 'Content-Type': 'application/json' },
        data: { brideId: 'bride-1' },
      });
      expect(resp.status()).toBe(401);
    });
  });

  test.describe('Visible Brides endpoint', () => {
    test('returns enriched bride data with guardianProfileId', async ({ request }) => {
      test.skip(!GROOM_TOKEN, 'E2E_GROOM_TOKEN not set');
      const resp = await request.get(`${API_BASE}/api/brides/visible`, {
        headers: auth(GROOM_TOKEN!),
      });
      expect(resp.ok()).toBeTruthy();
      const data = await resp.json();
      expect(data).toHaveProperty('brides');
      expect(data).toHaveProperty('pagination');
      if (data.brides.length > 0) {
        const bride = data.brides[0];
        expect(bride).toHaveProperty('guardianProfileId');
        expect(bride).toHaveProperty('requestStatus');
      }
    });
  });
});
