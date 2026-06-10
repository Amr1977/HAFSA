import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database', () => ({
  prisma: {
    contactRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    bride: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn(), update: vi.fn() },
    profile: { findUnique: vi.fn(), findMany: vi.fn() },
    brideExposure: { findMany: vi.fn(), count: vi.fn() },
    conversation: { findUnique: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock('../config/firebase-admin', () => ({
  adminMessaging: { sendEachForMulticast: vi.fn() },
}));

vi.mock('../services/notification.service', () => ({
  notifyContactRequest: vi.fn(),
  notifyRequestAccepted: vi.fn(),
  createNotification: vi.fn(),
}));

import { prisma } from '../config/database';

const mockReq = (overrides: any = {}) => ({
  userId: 'guardian-1',
  body: {},
  params: {},
  ...overrides,
});

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('guardianPropose logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects when groomProfileId is missing', async () => {
    const { guardianPropose } = await import('../modules/requests/requests.controller');
    const req = mockReq({ body: { brideId: 'bride-1' } });
    const res = mockRes();

    await guardianPropose(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'VALIDATION' })
    );
  });

  it('rejects when bride does not belong to guardian', async () => {
    vi.mocked(prisma.bride.findFirst).mockResolvedValue(null);

    const { guardianPropose } = await import('../modules/requests/requests.controller');
    const req = mockReq({ body: { groomProfileId: 'groom-profile-1', brideId: 'bride-1' } });
    const res = mockRes();

    await guardianPropose(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'FORBIDDEN' })
    );
  });

  it('rejects when groom profile is not found', async () => {
    vi.mocked(prisma.bride.findFirst).mockResolvedValue({
      id: 'bride-1',
      guardianId: 'guardian-1',
      iddahComplete: true,
      iddahEndsAt: null,
    } as any);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

    const { guardianPropose } = await import('../modules/requests/requests.controller');
    const req = mockReq({ body: { groomProfileId: 'groom-profile-1', brideId: 'bride-1' } });
    const res = mockRes();

    await guardianPropose(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('rejects duplicate proposals', async () => {
    vi.mocked(prisma.bride.findFirst).mockResolvedValue({
      id: 'bride-1',
      guardianId: 'guardian-1',
      iddahComplete: true,
      iddahEndsAt: null,
    } as any);
    vi.mocked(prisma.profile.findUnique).mockResolvedValue({
      id: 'groom-profile-1',
      status: 'APPROVED',
      user: { id: 'groom-user-1', isActive: true },
    } as any);
    vi.mocked(prisma.contactRequest.findFirst).mockResolvedValue({ id: 'existing' } as any);

    const { guardianPropose } = await import('../modules/requests/requests.controller');
    const req = mockReq({ body: { groomProfileId: 'groom-profile-1', brideId: 'bride-1' } });
    const res = mockRes();

    await guardianPropose(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'DUPLICATE' })
    );
  });
});

describe('getReceivedRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns requests with full groom and bride info', async () => {
    const mockRequests = [
      {
        id: 'req-1',
        senderId: 'groom-1',
        status: 'PENDING',
        message: 'Hello',
        createdAt: new Date(),
        sender: {
          id: 'groom-1',
          isVerified: true,
          createdAt: new Date(),
          profile: {
            id: 'profile-1',
            displayName: 'Groom Ahmed',
            age: 28,
            city: 'Cairo',
            nationality: 'مصري',
            residenceGovernorate: 'Cairo',
            occupation: 'مهندس',
            education: 'كلية',
            maritalStatus: 'SINGLE',
            madhab: 'HANAFI',
            prayerCommitment: 'ALWAYS',
            quranMemorization: 'HALF',
            selfIntroduction: 'Intro text',
            photos: [{ url: '/uploads/photo.jpg' }],
            aiReviewScore: 85,
            status: 'APPROVED',
          },
        },
        bride: {
          id: 'bride-1',
          age: 22,
          residenceGovernorate: 'Giza',
          maritalStatus: 'SINGLE',
          prayerCommitment: 'ALWAYS',
          hijabType: 'خمار',
        },
        conversation: { id: 'conv-1' },
      },
    ];
    vi.mocked(prisma.contactRequest.findMany).mockResolvedValue(mockRequests as any);

    const { getReceivedRequests } = await import('../modules/requests/requests.controller');
    const req = mockReq({ userId: 'guardian-1' });
    const res = mockRes();

    await getReceivedRequests(req, res);

    expect(res.json).toHaveBeenCalledWith(mockRequests);
    expect(prisma.contactRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { receiverId: 'guardian-1' },
        include: expect.objectContaining({
          sender: expect.objectContaining({
            select: expect.objectContaining({
              profile: expect.objectContaining({
                select: expect.objectContaining({
                  displayName: true,
                  age: true,
                  occupation: true,
                  selfIntroduction: true,
                  photos: expect.any(Object),
                }),
              }),
            }),
          }),
          bride: expect.objectContaining({
            select: expect.objectContaining({
              hijabType: true,
              prayerCommitment: true,
            }),
          }),
        }),
      })
    );
  });
});
