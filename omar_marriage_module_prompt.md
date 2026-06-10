# Omar — Marriage Module: Complete Happy Path Prompt
**Based on full codebase review — June 2026**  
**Goal:** A working end-to-end marriage journey for both Guardian and Groom, from registration to nikah

---

## BEHAVIORAL RULES
- Execute all phases in order without pausing
- Never ask for confirmation between steps
- Write complete production-ready code — never truncate
- No new schema migrations needed unless explicitly noted
- Run `npm run build` in both backend/ and frontend/ at the end

---

## THE 7 GAPS THIS PROMPT FIXES

Based on code review, the marriage module has these broken or missing pieces:

1. **Requests page is blind** — `getReceivedRequests` returns sender with `{ id, isVerified }` only. Guardian sees "طلب تواصل" with zero info about the groom.
2. **No "Send Request" button on bride cards** — Groom browses brides but has no way to act from the card itself.
3. **Register redirects are wrong** — GUARDIAN after register goes to /social instead of creating first bride record.
4. **Guardian-initiated proposal missing** — The entire Hafsa story differentiator isn't built. Guardian can't approach a groom first.
5. **No marriage dashboards** — Neither role has an overview of their marriage journey status.
6. **No compatibility score shown** — `aiMatching.service.ts` is built but never displayed anywhere.
7. **No success/closure flow** — No way to mark a successful nikah and close the cycle.

---

## PHASE 1 — Backend: Fix Received Requests (Broken Guardian Inbox)

### 1.1 Fix `getReceivedRequests` in `backend/src/modules/requests/requests.controller.ts`

The current response is blind — guardian can't see who the groom is. Replace the function:

```typescript
export const getReceivedRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.contactRequest.findMany({
      where: { receiverId: req.userId },
      include: {
        // Full groom profile — guardian needs to know who is asking
        sender: {
          select: {
            id: true,
            isVerified: true,
            createdAt: true,
            profile: {
              select: {
                id: true,
                displayName: true,
                age: true,
                city: true,
                nationality: true,
                residenceGovernorate: true,
                occupation: true,
                education: true,
                maritalStatus: true,
                madhab: true,
                prayerCommitment: true,
                quranMemorization: true,
                selfIntroduction: true,
                photos: { where: { isPrimary: true }, take: 1 },
                aiReviewScore: true,
                status: true,
              },
            },
          },
        },
        // Which bride record this request is for
        bride: {
          select: {
            id: true,
            age: true,
            residenceGovernorate: true,
            maritalStatus: true,
            prayerCommitment: true,
            hijabType: true,
          },
        },
        conversation: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(requests);
  } catch (error) {
    console.error('Get received requests error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to get received requests' });
  }
};
```

### 1.2 Fix `getSentRequests` in the same file — include bride and guardian info for groom:

```typescript
export const getSentRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.contactRequest.findMany({
      where: { senderId: req.userId },
      include: {
        profile: {
          select: {
            id: true,
            displayName: true,
            age: true,
            city: true,
            nationality: true,
            photos: { where: { isPrimary: true }, take: 1 },
          },
        },
        bride: {
          select: {
            id: true,
            age: true,
            residenceGovernorate: true,
            maritalStatus: true,
            prayerCommitment: true,
            hijabType: true,
          },
        },
        receiver: {
          select: {
            id: true,
            profile: {
              select: { displayName: true, photos: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        conversation: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to get sent requests' });
  }
};
```

---

## PHASE 2 — Backend: Guardian-Initiated Proposal (The Differentiator)

This is the Hafsa bint Umar feature. A guardian browses groom profiles and can send a "تقدم من ولي الأمر" to the groom on behalf of their ward.

### 2.1 Add schema — add `initiatedBy` and `guardianNote` to `ContactRequest`

Open `backend/prisma/schema.prisma`. Add to the `ContactRequest` model:
```prisma
model ContactRequest {
  // ... existing fields ...
  initiatedBy  String   @default("GROOM")  // "GROOM" | "GUARDIAN"
  guardianNote String?  @db.Text            // Guardian's message to groom
}
```

Run migration:
```bash
cd backend && npx prisma migrate dev --name add_guardian_proposal && npx prisma generate
```

### 2.2 Add `guardianPropose` endpoint to `backend/src/modules/requests/requests.controller.ts`

```typescript
// Guardian sends a proposal TO a groom ON BEHALF of a specific bride
export const guardianPropose = async (req: AuthRequest, res: Response) => {
  try {
    const { groomProfileId, brideId, guardianNote } = req.body;

    if (!groomProfileId || !brideId) {
      return res.status(400).json({
        error: 'VALIDATION',
        messageAr: 'يجب تحديد ملف العريس وسجل العروس',
        messageEn: 'groomProfileId and brideId are required',
      });
    }

    // Verify guardian owns the bride record
    const bride = await prisma.bride.findFirst({
      where: { id: brideId, guardianId: req.userId! },
    });
    if (!bride) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        messageAr: 'هذا السجل لا ينتمي لك',
        messageEn: 'Bride record not found or not yours',
      });
    }

    // Verify bride iddah is complete
    if (!bride.iddahComplete && bride.iddahEndsAt) {
      const daysRemaining = Math.ceil(
        (bride.iddahEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return res.status(403).json({
        error: 'IDDAH_INCOMPLETE',
        messageAr: `لا يمكن إرسال التقدم — العدة لم تنته بعد (متبقي ${daysRemaining} يوم تقريباً)`,
        iddahEndsAt: bride.iddahEndsAt,
      });
    }

    // Verify groom profile exists and is approved
    const groomProfile = await prisma.profile.findUnique({
      where: { id: groomProfileId },
      include: { user: { select: { id: true, isActive: true } } },
    });
    if (!groomProfile || groomProfile.status !== 'APPROVED' || !groomProfile.user.isActive) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        messageAr: 'ملف العريس غير موجود أو غير معتمد',
        messageEn: 'Groom profile not found or not approved',
      });
    }

    // Prevent duplicate proposals (same guardian → same groom for same bride)
    const existing = await prisma.contactRequest.findFirst({
      where: {
        senderId: req.userId!,
        profileId: groomProfileId,
        brideId,
        initiatedBy: 'GUARDIAN',
      },
    });
    if (existing) {
      return res.status(409).json({
        error: 'DUPLICATE',
        messageAr: 'لقد أرسلت تقدماً لهذا العريس عن هذه الموليه مسبقاً',
        messageEn: 'You have already proposed to this groom for this bride',
      });
    }

    // Check if groom already sent a request to this guardian for this bride
    const reverseRequest = await prisma.contactRequest.findFirst({
      where: {
        senderId: groomProfile.user.id,
        receiverId: req.userId!,
        brideId,
        initiatedBy: 'GROOM',
      },
    });
    if (reverseRequest) {
      return res.status(409).json({
        error: 'REVERSE_EXISTS',
        messageAr: 'العريس أرسل لك طلباً بالفعل عن هذه الموليه — راجع صندوق الطلبات',
        messageEn: 'Groom already sent you a request for this bride — check your inbox',
        existingRequestId: reverseRequest.id,
      });
    }

    // Guardian's own profile (needed for the request)
    const guardianProfile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      select: { id: true, displayName: true },
    });

    // Create the proposal: sender = guardian, receiver = groom
    const proposal = await prisma.contactRequest.create({
      data: {
        senderId: req.userId!,              // guardian
        profileId: groomProfileId,          // groom's profile
        receiverId: groomProfile.user.id,   // groom user
        brideId,
        initiatedBy: 'GUARDIAN',
        guardianNote: guardianNote?.trim() || null,
        message: guardianNote?.trim() || null,
      },
      include: {
        bride: { select: { id: true, age: true, residenceGovernorate: true } },
        profile: { select: { displayName: true } },
      },
    });

    // Notify the groom
    const guardianName = guardianProfile?.displayName || 'ولي أمر';
    createNotification({
      userId: groomProfile.user.id,
      type: 'guardian_proposal',
      titleAr: 'تقدم ولي أمر',
      titleEn: 'Guardian Proposal',
      bodyAr: `${guardianName} يرغب في التعريف بموليته`,
      bodyEn: `${guardianName} would like to introduce their ward`,
      data: { proposalId: proposal.id, guardianName, brideId, groomProfileId },
    });

    return res.status(201).json(proposal);
  } catch (error) {
    console.error('Guardian propose error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to send proposal' });
  }
};
```

Also add `createNotification` import at top:
```typescript
import { notifyContactRequest, notifyRequestAccepted, createNotification } from '../../services/notification.service';
```

### 2.3 Add `getGroomInbox` — groom sees both his sent requests AND guardian proposals to him

```typescript
// Groom's full inbox: proposals from guardians + his own sent requests
export const getGroomInbox = async (req: AuthRequest, res: Response) => {
  try {
    // Proposals FROM guardians TO this groom
    const receivedProposals = await prisma.contactRequest.findMany({
      where: { receiverId: req.userId, initiatedBy: 'GUARDIAN' },
      include: {
        sender: {
          select: {
            id: true,
            isVerified: true,
            profile: {
              select: {
                displayName: true,
                age: true,
                photos: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        bride: {
          select: {
            id: true,
            age: true,
            residenceGovernorate: true,
            maritalStatus: true,
            prayerCommitment: true,
            hijabType: true,
            skinColor: true,
            education: true,
            wantChildren: true,
            acceptPolygamy: true,
          },
        },
        conversation: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Requests groom sent to guardians
    const sentRequests = await prisma.contactRequest.findMany({
      where: { senderId: req.userId, initiatedBy: 'GROOM' },
      include: {
        receiver: {
          select: {
            id: true,
            profile: { select: { displayName: true, photos: { where: { isPrimary: true }, take: 1 } } },
          },
        },
        bride: {
          select: {
            id: true,
            age: true,
            residenceGovernorate: true,
            maritalStatus: true,
            prayerCommitment: true,
            hijabType: true,
          },
        },
        conversation: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ receivedProposals, sentRequests });
  } catch (error) {
    console.error('Get groom inbox error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to get groom inbox' });
  }
};
```

### 2.4 Add marriage dashboard endpoints

Add `getGuardianDashboard` and `getGroomDashboard`:

```typescript
export const getGuardianDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const guardianId = req.userId!;

    const [bridesCount, activeExposures, pendingRequests, activeConversations, matchedBrides] = await Promise.all([
      prisma.bride.count({ where: { guardianId, status: 'ACTIVE' } }),
      prisma.brideExposure.count({ where: { bride: { guardianId }, isActive: true } }),
      prisma.contactRequest.count({ where: { receiverId: guardianId, status: 'PENDING' } }),
      prisma.conversation.count({
        where: { participants: { some: { userId: guardianId } } },
      }),
      prisma.bride.count({ where: { guardianId, status: 'MATCHED' } }),
    ]);

    // Recent requests with groom info
    const recentRequests = await prisma.contactRequest.findMany({
      where: { receiverId: guardianId, status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { displayName: true, age: true, photos: { where: { isPrimary: true }, take: 1 } } },
          },
        },
        bride: { select: { id: true, age: true, residenceGovernorate: true } },
      },
    });

    // My brides with their exposure counts
    const brides = await prisma.bride.findMany({
      where: { guardianId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { exposures: true, contactRequests: true } },
      },
    });

    return res.json({
      stats: { bridesCount, activeExposures, pendingRequests, activeConversations, matchedBrides },
      recentRequests,
      brides,
    });
  } catch (error) {
    console.error('Guardian dashboard error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to get guardian dashboard' });
  }
};

export const getGroomDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const groomId = req.userId!;

    const profile = await prisma.profile.findUnique({
      where: { userId: groomId },
      select: { id: true, status: true, displayName: true, aiReviewScore: true, viewCount: true, requestCount: true },
    });

    const [exposedBridesCount, sentRequestsCount, pendingProposals, activeConversations] = await Promise.all([
      prisma.brideExposure.count({ where: { groomId, isActive: true } }),
      prisma.contactRequest.count({ where: { senderId: groomId } }),
      prisma.contactRequest.count({ where: { receiverId: groomId, status: 'PENDING', initiatedBy: 'GUARDIAN' } }),
      prisma.conversation.count({ where: { participants: { some: { userId: groomId } } } }),
    ]);

    // Recent exposed brides (new ones first)
    const recentExposures = await prisma.brideExposure.findMany({
      where: { groomId, isActive: true },
      take: 5,
      orderBy: { exposedAt: 'desc' },
      include: {
        bride: {
          select: {
            id: true,
            age: true,
            residenceGovernorate: true,
            maritalStatus: true,
            prayerCommitment: true,
            hijabType: true,
          },
        },
      },
    });

    return res.json({
      profile,
      stats: { exposedBridesCount, sentRequestsCount, pendingProposals, activeConversations },
      recentExposures,
      profileComplete: !!profile && profile.status === 'APPROVED',
    });
  } catch (error) {
    console.error('Groom dashboard error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to get groom dashboard' });
  }
};
```

### 2.5 Add success/closure endpoint

```typescript
export const markMarriageSuccess = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, brideId } = req.body;

    // Update bride status to MATCHED
    if (brideId) {
      const bride = await prisma.bride.findFirst({
        where: { id: brideId, guardianId: req.userId },
      });
      if (bride) {
        await prisma.bride.update({
          where: { id: brideId },
          data: { status: 'MATCHED' },
        });
      }
    }

    // Find groom's profile and mark it
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });
      if (conversation) {
        const otherParticipantId = conversation.participants
          .find(p => p.userId !== req.userId)?.userId;
        if (otherParticipantId) {
          // Notify the other party
          createNotification({
            userId: otherParticipantId,
            type: 'marriage_success',
            titleAr: 'مبارك عليكم 🌸',
            titleEn: 'Marriage Success',
            bodyAr: 'تم تسجيل الزواج بحمد الله — بارك الله لكم وبارك عليكم وجمع بينكم في خير',
            bodyEn: 'Marriage registered successfully — may Allah bless your union',
            data: { conversationId },
          });
        }
      }
    }

    return res.json({
      message: 'بارك الله لكم وبارك عليكم وجمع بينكم في خير',
    });
  } catch (error) {
    console.error('Marriage success error:', error);
    return res.status(500).json({ error: 'INTERNAL', message: 'Failed to mark success' });
  }
};
```

### 2.6 Update `backend/src/modules/requests/requests.routes.ts`

Add the new endpoints:
```typescript
import {
  sendRequest, getSentRequests, getReceivedRequests,
  acceptRequest, rejectRequest,
  guardianPropose, getGroomInbox,
  getGuardianDashboard, getGroomDashboard,
  markMarriageSuccess,
} from './requests.controller';
import { requireGuardian, requireGroom } from '../../middleware/roleGuard';

// Add these routes:
router.post('/guardian-propose', authenticate, requireGuardian, guardianPropose);
router.get('/groom-inbox', authenticate, requireGroom, getGroomInbox);
router.get('/guardian-dashboard', authenticate, requireGuardian, getGuardianDashboard);
router.get('/groom-dashboard', authenticate, requireGroom, getGroomDashboard);
router.post('/marriage-success', authenticate, markMarriageSuccess);
```

---

## PHASE 3 — Frontend: Fix Register Redirect Flow

### 3.1 Fix `frontend/src/pages/auth/Register.tsx` — navigate correctly per role

Replace the final navigate lines in both `handleSubmit` and `confirmGoogleRegister`:

In `handleSubmit`, replace:
```typescript
navigate(user.roles.length > 1 ? '/profile/setup' : '/social');
```
With:
```typescript
const hasGroom = (user.roles as string[]).includes('GROOM');
const hasGuardian = (user.roles as string[]).includes('GUARDIAN');
if (hasGroom) {
  navigate('/profile/setup');
} else if (hasGuardian) {
  navigate('/guardian/brides/new?onboarding=1');
} else {
  navigate('/social');
}
```

In `confirmGoogleRegister`, do the same replacement using `userData.roles`.

---

## PHASE 4 — Frontend: Fix Requests Page (Guardian Inbox)

### 4.1 Replace `frontend/src/pages/Requests.tsx` entirely:

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, photoUrl } from '../lib/api';
import UserAvatar from '../components/UserAvatar';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res: any = await api.requests.received();
      setRequests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.requests.accept(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await api.requests.reject(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">قيد الانتظار</span>;
      case 'ACCEPTED': return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">مقبول</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">مرفوض</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto py-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100 mb-6">طلبات التواصل الواردة</h1>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-[#DAA520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-[#6B7280] dark:text-gray-400">لا توجد طلبات تواصل بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => {
            const groom = req.sender;
            const groomProfile = groom?.profile;
            const bride = req.bride;

            return (
              <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar photo={groomProfile?.photos?.[0]?.url} size="lg" />
                    <div>
                      <p className="font-bold text-[#1B4332] dark:text-gray-100">
                        {groomProfile?.displayName || `عريس #${groom?.id?.slice(-5)}`}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {groomProfile?.age} سنة
                        {groomProfile?.residenceGovernorate ? ` · ${groomProfile.residenceGovernorate}` : ''}
                        {groom?.isVerified ? ' · ✓ موثق' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(req.status)}
                    <span className="text-xs text-[#6B7280]">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                {/* Groom profile details */}
                {groomProfile && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {groomProfile.occupation && <span>العمل: <strong className="text-[#1B4332] dark:text-gray-200">{groomProfile.occupation}</strong></span>}
                    {groomProfile.education && <span>المؤهل: <strong className="text-[#1B4332] dark:text-gray-200">{groomProfile.education}</strong></span>}
                    {groomProfile.maritalStatus && <span>الحالة: <strong className="text-[#1B4332] dark:text-gray-200">{groomProfile.maritalStatus}</strong></span>}
                    {groomProfile.prayerCommitment && <span>الصلاة: <strong className="text-[#1B4332] dark:text-gray-200">{groomProfile.prayerCommitment}</strong></span>}
                    {groomProfile.madhab && <span>المذهب: <strong className="text-[#1B4332] dark:text-gray-200">{groomProfile.madhab}</strong></span>}
                    {groomProfile.nationality && <span>الجنسية: <strong className="text-[#1B4332] dark:text-gray-200">{groomProfile.nationality}</strong></span>}
                  </div>
                )}

                {/* Which bride */}
                {bride && (
                  <div className="border border-[#DAA520]/30 bg-[#DAA520]/5 dark:bg-[#DAA520]/10 rounded-xl p-3 mb-4">
                    <p className="text-xs font-medium text-[#DAA520] mb-1">يطلب التعريف بموليتك:</p>
                    <div className="flex gap-4 text-xs text-[#1B4332] dark:text-gray-200">
                      <span>السن: <strong>{bride.age}</strong></span>
                      <span>المحافظة: <strong>{bride.residenceGovernorate || '-'}</strong></span>
                      <span>الحالة: <strong>{bride.maritalStatus || '-'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Message */}
                {req.message && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-[#6B7280] mb-1">رسالة العريس:</p>
                    <p className="text-sm text-[#1B4332] dark:text-gray-200">{req.message}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {req.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="flex-1 py-2.5 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl text-sm font-bold hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] transition-colors"
                      >
                        قبول وفتح المحادثة
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex-1 py-2.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        رفض
                      </button>
                    </>
                  )}
                  {req.status === 'ACCEPTED' && req.conversation && (
                    <Link
                      to={`/messages/${req.conversation.id}`}
                      className="flex-1 py-2.5 bg-[#DAA520] text-[#1B4332] rounded-xl text-sm font-bold text-center hover:bg-[#F5E6B8] transition-colors"
                    >
                      فتح المحادثة
                    </Link>
                  )}
                  {groomProfile?.id && (
                    <Link
                      to={`/browse/${groomProfile.id}`}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-[#6B7280] dark:text-gray-400 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      ملف كامل
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 5 — Frontend: Groom Inbox (Received Guardian Proposals + Sent Requests)

### 5.1 Create `frontend/src/pages/GroomInbox.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function GroomInbox() {
  const [data, setData] = useState<{ receivedProposals: any[]; sentRequests: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'proposals' | 'sent'>('proposals');

  useEffect(() => {
    api.requests.groomInbox().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id: string) => {
    await api.requests.accept(id);
    api.requests.groomInbox().then(setData);
  };

  const handleReject = async (id: string) => {
    if (!confirm('هل أنت متأكد من الرفض؟')) return;
    await api.requests.reject(id);
    api.requests.groomInbox().then(setData);
  };

  const BrideCard = ({ bride }: { bride: any }) => (
    <div className="border border-[#DAA520]/30 bg-[#DAA520]/5 dark:bg-[#DAA520]/10 rounded-xl p-3 my-3">
      <p className="text-xs font-medium text-[#DAA520] mb-1">بيانات الموليه:</p>
      <div className="grid grid-cols-2 gap-1 text-xs text-[#1B4332] dark:text-gray-200">
        <span>السن: <strong>{bride.age}</strong></span>
        <span>المحافظة: <strong>{bride.residenceGovernorate || '-'}</strong></span>
        <span>الحالة: <strong>{bride.maritalStatus || '-'}</strong></span>
        <span>الصلاة: <strong>{bride.prayerCommitment || '-'}</strong></span>
        <span>الحجاب: <strong>{bride.hijabType || '-'}</strong></span>
        {bride.wantChildren && <span>الإنجاب: <strong>{bride.wantChildren}</strong></span>}
        {bride.acceptPolygamy && <span>التعدد: <strong>{bride.acceptPolygamy}</strong></span>}
      </div>
    </div>
  );

  const statusBadge = (status: string) => {
    const map: Record<string, [string, string]> = {
      PENDING: ['bg-amber-100 text-amber-700', 'قيد الانتظار'],
      ACCEPTED: ['bg-green-100 text-green-700', 'مقبول'],
      REJECTED: ['bg-red-100 text-red-600', 'مرفوض'],
    };
    const [cls, label] = map[status] || ['bg-gray-100 text-gray-600', status];
    return <span className={`px-2 py-0.5 ${cls} rounded-full text-xs font-medium`}>{label}</span>;
  };

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;

  const proposals = data?.receivedProposals || [];
  const sentReqs = data?.sentRequests || [];

  return (
    <div className="max-w-3xl mx-auto py-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100 mb-4">صندوق التعارف</h1>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('proposals')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'proposals' ? 'bg-white dark:bg-gray-800 text-[#1B4332] dark:text-[#DAA520] shadow-sm' : 'text-[#6B7280]'}`}
        >
          تقدمات لي ({proposals.filter(p => p.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'sent' ? 'bg-white dark:bg-gray-800 text-[#1B4332] dark:text-[#DAA520] shadow-sm' : 'text-[#6B7280]'}`}
        >
          طلباتي المرسلة ({sentReqs.length})
        </button>
      </div>

      {tab === 'proposals' && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <p className="text-lg mb-2">لا توجد تقدمات بعد</p>
              <p className="text-sm">عندما يتقدم إليك ولي أمر ستصلك إشعار هنا</p>
            </div>
          ) : proposals.map((proposal: any) => (
            <div key={proposal.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-[#1B4332] dark:text-gray-100">
                    {proposal.sender?.profile?.displayName || 'ولي أمر'}
                  </p>
                  <p className="text-xs text-[#6B7280]">تقدم بتاريخ {new Date(proposal.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                {statusBadge(proposal.status)}
              </div>

              {proposal.guardianNote && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                  <p className="text-xs text-[#6B7280] mb-1">رسالة ولي الأمر:</p>
                  <p className="text-sm text-[#1B4332] dark:text-gray-200">{proposal.guardianNote}</p>
                </div>
              )}

              {proposal.bride && <BrideCard bride={proposal.bride} />}

              <div className="flex gap-3 mt-4">
                {proposal.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleAccept(proposal.id)} className="flex-1 py-2.5 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl text-sm font-bold hover:bg-[#2D6A4F] transition-colors">
                      قبول
                    </button>
                    <button onClick={() => handleReject(proposal.id)} className="flex-1 py-2.5 border-2 border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                      رفض
                    </button>
                  </>
                )}
                {proposal.status === 'ACCEPTED' && proposal.conversation && (
                  <Link to={`/messages/${proposal.conversation.id}`} className="flex-1 py-2.5 bg-[#DAA520] text-[#1B4332] rounded-xl text-sm font-bold text-center">
                    فتح المحادثة
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sent' && (
        <div className="space-y-4">
          {sentReqs.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]">
              <p className="text-lg mb-2">لم ترسل طلبات بعد</p>
              <p className="text-sm">تصفح السجلات المتاحة وأرسل طلب تواصل</p>
              <Link to="/brides/visible" className="mt-4 inline-block px-6 py-2.5 bg-[#DAA520] text-[#1B4332] rounded-xl text-sm font-bold">
                تصفح السجلات المتاحة
              </Link>
            </div>
          ) : sentReqs.map((req: any) => (
            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-[#1B4332] dark:text-gray-100">
                    ولي الأمر: {req.receiver?.profile?.displayName || '-'}
                  </p>
                  <p className="text-xs text-[#6B7280]">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                {statusBadge(req.status)}
              </div>
              {req.bride && <BrideCard bride={req.bride} />}
              {req.status === 'ACCEPTED' && req.conversation && (
                <Link to={`/messages/${req.conversation.id}`} className="block mt-3 py-2.5 bg-[#DAA520] text-[#1B4332] rounded-xl text-sm font-bold text-center">
                  فتح المحادثة
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 6 — Frontend: Add "Send Request" Button to Bride Cards

### 6.1 Update `frontend/src/pages/browse/GroomBrowseBrides.tsx` — add request button in bride detail modal

In the `GroomBrowseBrides` component, add state for request sending and a button in the `selectedBride` modal:

Add at top of component:
```tsx
const [sendingRequest, setSendingRequest] = useState(false);
const [requestSent, setRequestSent] = useState<string | null>(null); // brideId
const [requestMessage, setRequestMessage] = useState('');

const handleSendRequest = async (bride: any) => {
  if (!bride.guardianProfileId) {
    alert('لا يمكن إرسال الطلب — ملف ولي الأمر غير متاح');
    return;
  }
  setSendingRequest(true);
  try {
    await api.requests.send({
      profileId: bride.guardianProfileId,
      brideId: bride.id,
      message: requestMessage.trim() || undefined,
    });
    setRequestSent(bride.id);
    setRequestMessage('');
  } catch (err: any) {
    alert(err.message || 'فشل إرسال الطلب');
  } finally {
    setSendingRequest(false);
  }
};
```

In `getVisibleBrides` backend response, we need `guardianProfileId`. Update the `getVisibleBrides` query in `backend/src/modules/brides/brides.controller.ts` to include guardian's profile ID:

```typescript
// In getVisibleBrides, update the prisma.bride.findMany include:
const [brides, total] = await Promise.all([
  prisma.bride.findMany({
    where,
    skip,
    take: limitNum,
    orderBy,
    include: {
      guardian: {
        select: {
          id: true,
          profile: { select: { id: true, displayName: true } },
        },
      },
      exposures: {
        where: { groomId, isActive: true },
        select: { exposedAt: true },
        take: 1,
      },
      contactRequests: {
        where: { senderId: groomId },
        select: { id: true, status: true },
        take: 1,
      },
    },
  }),
  prisma.bride.count({ where }),
]);

// Map to add guardianProfileId and requestStatus for frontend
const enriched = brides.map(b => ({
  ...b,
  guardianProfileId: (b as any).guardian?.profile?.id || null,
  requestStatus: (b as any).contactRequests?.[0]?.status || null,
  exposedAt: (b as any).exposures?.[0]?.exposedAt || null,
}));

return res.json({ brides: enriched, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
```

In `GroomBrowseBrides.tsx`, update the selected bride detail modal — add before the closing `</div>` of the modal:

```tsx
{/* Send Contact Request */}
<div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
  {requestSent === selectedBride?.id ? (
    <div className="text-center py-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
      <p className="text-green-700 dark:text-green-400 font-medium text-sm">✓ تم إرسال طلب التواصل</p>
      <p className="text-xs text-[#6B7280] mt-1">سيتواصل معك ولي الأمر إذا قبل الطلب</p>
    </div>
  ) : selectedBride?.requestStatus ? (
    <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
      <p className="text-blue-700 dark:text-blue-400 text-sm">
        {selectedBride.requestStatus === 'PENDING' ? 'طلبك قيد المراجعة' :
         selectedBride.requestStatus === 'ACCEPTED' ? '✓ تم قبول طلبك' :
         'تم رفض طلبك'}
      </p>
    </div>
  ) : (
    <>
      <p className="text-sm font-medium text-[#1B4332] dark:text-gray-200 mb-2">أرسل طلب تواصل لولي الأمر</p>
      <textarea
        value={requestMessage}
        onChange={e => setRequestMessage(e.target.value)}
        placeholder="تعريف موجز بنفسك (اختياري)..."
        rows={3}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm resize-none focus:outline-none focus:border-[#DAA520] mb-3"
      />
      <button
        onClick={() => handleSendRequest(selectedBride)}
        disabled={sendingRequest || !selectedBride?.guardianProfileId}
        className="w-full py-3 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl text-sm font-bold hover:bg-[#2D6A4F] disabled:opacity-50 transition-colors"
      >
        {sendingRequest ? 'جاري الإرسال...' : 'إرسال طلب التواصل'}
      </button>
    </>
  )}
</div>
```

---

## PHASE 7 — Frontend: Marriage Dashboard Pages

### 7.1 Create `frontend/src/pages/GuardianDashboard.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function GuardianDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.requests.guardianDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;

  const { stats, recentRequests, brides } = data || {};

  return (
    <div className="max-w-4xl mx-auto py-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100 mb-6">لوحة تحكم ولي الأمر</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'سجلات العرائس', value: stats?.bridesCount || 0, color: 'text-[#1B4332]', icon: '👥' },
          { label: 'عرضوا مرشحين', value: stats?.activeExposures || 0, color: 'text-purple-600', icon: '👁' },
          { label: 'طلبات منتظرة', value: stats?.pendingRequests || 0, color: 'text-amber-600', icon: '📩' },
          { label: 'محادثات نشطة', value: stats?.activeConversations || 0, color: 'text-blue-600', icon: '💬' },
          { label: 'تم التوفيق', value: stats?.matchedBrides || 0, color: 'text-green-600', icon: '💍' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color} dark:opacity-90`}>{s.value}</div>
            <div className="text-xs text-[#6B7280] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Link to="/guardian/brides/new" className="flex items-center gap-3 p-4 bg-[#DAA520] text-[#1B4332] rounded-xl font-bold hover:bg-[#F5E6B8] transition-colors">
          <span className="text-xl">➕</span>
          <span>إضافة سجل عروس</span>
        </Link>
        <Link to="/browse" className="flex items-center gap-3 p-4 bg-[#1B4332] dark:bg-[#1B4332]/80 text-white rounded-xl font-bold hover:bg-[#2D6A4F] transition-colors">
          <span className="text-xl">🔍</span>
          <span>تصفح العرسان</span>
        </Link>
        <Link to="/requests" className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-colors ${stats?.pendingRequests > 0 ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#1B4332] dark:text-gray-100 hover:bg-gray-50'}`}>
          <span className="text-xl">📩</span>
          <span>الطلبات الواردة {stats?.pendingRequests > 0 ? `(${stats.pendingRequests})` : ''}</span>
        </Link>
      </div>

      {/* Recent pending requests */}
      {recentRequests?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-lg font-bold text-[#1B4332] dark:text-gray-100 mb-4">آخر الطلبات</h2>
          <div className="space-y-3">
            {recentRequests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B4332] dark:text-gray-200">
                    {req.sender?.profile?.displayName || 'عريس'} — {req.sender?.profile?.age} سنة
                  </p>
                  {req.bride && (
                    <p className="text-xs text-[#6B7280]">عن موليتك — {req.bride.age} سنة · {req.bride.residenceGovernorate}</p>
                  )}
                </div>
                <Link to="/requests" className="px-3 py-1.5 bg-[#DAA520] text-[#1B4332] rounded-lg text-xs font-bold hover:bg-[#F5E6B8]">
                  استعراض
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My brides */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1B4332] dark:text-gray-100">سجلاتي</h2>
          <Link to="/guardian/brides" className="text-sm text-[#DAA520] hover:underline">عرض الكل</Link>
        </div>
        {!brides?.length ? (
          <div className="text-center py-6 text-[#6B7280]">
            <p className="mb-3">لا توجد سجلات بعد</p>
            <Link to="/guardian/brides/new" className="px-4 py-2 bg-[#DAA520] text-[#1B4332] rounded-lg text-sm font-bold">إضافة أول سجل</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {brides.slice(0, 5).map((bride: any) => (
              <div key={bride.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B4332] dark:text-gray-200">عروس #{bride.id.slice(-5)} · {bride.age} سنة · {bride.residenceGovernorate || '-'}</p>
                  <p className="text-xs text-[#6B7280]">
                    {bride._count?.exposures || 0} إتاحات · {bride._count?.contactRequests || 0} طلبات
                    {bride.status === 'MATCHED' ? ' · 💍 تم التوفيق' : ''}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bride.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : bride.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {bride.status === 'ACTIVE' ? 'نشط' : bride.status === 'MATCHED' ? 'توفيق' : bride.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 7.2 Create `frontend/src/pages/GroomDashboard.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const profileStatusInfo: Record<string, { label: string; color: string; next: string; nextLink: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-600', next: 'أكمل ملفك الشخصي', nextLink: '/profile/setup' },
  PENDING_AI_REVIEW: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700', next: 'ملفك قيد المراجعة — انتظر قليلاً', nextLink: '' },
  APPROVED: { label: 'معتمد ✓', color: 'bg-green-100 text-green-700', next: 'تصفح السجلات المتاحة', nextLink: '/brides/visible' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-600', next: 'راجع ملفك وأعد التقديم', nextLink: '/profile/my' },
};

export default function GroomDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.requests.groomDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;

  const { profile, stats, recentExposures } = data || {};
  const statusInfo = profileStatusInfo[profile?.status] || profileStatusInfo['DRAFT'];

  return (
    <div className="max-w-4xl mx-auto py-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100 mb-6">لوحة تحكم العريس</h1>

      {/* Profile status */}
      <div className={`rounded-xl border p-5 mb-6 ${profile?.status === 'APPROVED' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-[#1B4332] dark:text-gray-100">حالة ملفك الشخصي</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
        {profile ? (
          <p className="text-sm text-[#6B7280]">
            {profile.displayName} · الملف شوهد {profile.viewCount} مرة
            {profile.aiReviewScore ? ` · نقاط الجودة: ${Math.round(profile.aiReviewScore)}%` : ''}
          </p>
        ) : (
          <p className="text-sm text-[#6B7280]">لم تنشئ ملفك الشخصي بعد</p>
        )}
        {statusInfo.nextLink && (
          <Link to={statusInfo.nextLink} className="mt-3 inline-block px-4 py-2 bg-[#DAA520] text-[#1B4332] rounded-lg text-sm font-bold hover:bg-[#F5E6B8]">
            {statusInfo.next}
          </Link>
        )}
        {!statusInfo.nextLink && <p className="mt-2 text-xs text-[#6B7280]">{statusInfo.next}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'سجلات متاحة لي', value: stats?.exposedBridesCount || 0, icon: '👁', link: '/brides/visible' },
          { label: 'طلباتي المرسلة', value: stats?.sentRequestsCount || 0, icon: '📤', link: '/requests/sent' },
          { label: 'تقدمات إلي', value: stats?.pendingProposals || 0, icon: '📩', link: '/groom-inbox' },
          { label: 'محادثات نشطة', value: stats?.activeConversations || 0, icon: '💬', link: '/messages' },
        ].map(s => (
          <Link key={s.label} to={s.link} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center hover:border-[#DAA520] transition-colors">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520]">{s.value}</div>
            <div className="text-xs text-[#6B7280] mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent exposed brides */}
      {recentExposures?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1B4332] dark:text-gray-100">آخر السجلات المتاحة لك</h2>
            <Link to="/brides/visible" className="text-sm text-[#DAA520] hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3">
            {recentExposures.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#1B4332] dark:text-gray-200">
                    عروس #{exp.brideId?.slice(-5)} · {exp.bride?.age} سنة · {exp.bride?.residenceGovernorate || '-'}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {exp.bride?.maritalStatus} · {exp.bride?.prayerCommitment}
                    · متاح منذ {new Date(exp.exposedAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <Link to="/brides/visible" className="px-3 py-1.5 bg-[#DAA520] text-[#1B4332] rounded-lg text-xs font-bold hover:bg-[#F5E6B8]">
                  استعراض
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 8 — Frontend: Guardian Proposal Page (Browse + Propose)

### 8.1 Update `frontend/src/pages/browse/Browse.tsx` — add "تقدم بموليتي" button on groom cards

In the Browse page, after the existing profile card, add a "تقدم لهذا العريس" button that opens a modal to select which bride to propose for.

Add state at top:
```tsx
const [proposingToProfile, setProposingToProfile] = useState<any>(null);
const [myBrides, setMyBrides] = useState<any[]>([]);
const [selectedBrideForProposal, setSelectedBrideForProposal] = useState('');
const [proposalNote, setProposalNote] = useState('');
const [proposalSending, setProposalSending] = useState(false);

useEffect(() => {
  // Load guardian's brides for the proposal modal
  api.brides.list().then(setMyBrides).catch(() => {});
}, []);

const handleGuardianPropose = async () => {
  if (!selectedBrideForProposal || !proposingToProfile) return;
  setProposalSending(true);
  try {
    await api.requests.guardianPropose({
      groomProfileId: proposingToProfile.id,
      brideId: selectedBrideForProposal,
      guardianNote: proposalNote.trim() || undefined,
    });
    setProposingToProfile(null);
    setSelectedBrideForProposal('');
    setProposalNote('');
    alert('تم إرسال التقدم للعريس بنجاح');
  } catch (err: any) {
    alert(err.message || 'فشل الإرسال');
  } finally {
    setProposalSending(false);
  }
};
```

On each profile card, add this button (below existing card content):
```tsx
<button
  onClick={() => setProposingToProfile(profile)}
  className="mt-3 w-full py-2 bg-[#DAA520] text-[#1B4332] rounded-lg text-sm font-bold hover:bg-[#F5E6B8] transition-colors"
>
  تقدم بموليتي لهذا العريس
</button>
```

Add proposal modal at bottom of component JSX (before closing `</div>`):
```tsx
{proposingToProfile && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setProposingToProfile(null)}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()} dir="rtl">
      <h2 className="text-xl font-bold text-[#1B4332] dark:text-gray-100 mb-2">تقدم للعريس</h2>
      <p className="text-sm text-[#6B7280] mb-5">
        أنت تتقدم للعريس: <strong className="text-[#1B4332] dark:text-gray-200">{proposingToProfile.displayName}</strong>
      </p>

      {myBrides.filter(b => b.status === 'ACTIVE' && b.iddahComplete).length === 0 ? (
        <div className="text-center py-4">
          <p className="text-[#6B7280] text-sm mb-3">لا توجد سجلات نشطة قابلة للتقدم</p>
          <a href="/guardian/brides/new" className="text-[#DAA520] text-sm hover:underline">إضافة سجل جديد</a>
        </div>
      ) : (
        <>
          <label className="block text-sm font-medium text-[#6B7280] mb-2">اختر موليتك</label>
          <select
            value={selectedBrideForProposal}
            onChange={e => setSelectedBrideForProposal(e.target.value)}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-white dark:bg-gray-700 text-sm text-[#1B4332] dark:text-gray-100"
          >
            <option value="">اختر...</option>
            {myBrides
              .filter(b => b.status === 'ACTIVE' && b.iddahComplete)
              .map((b: any) => (
                <option key={b.id} value={b.id}>
                  عروس #{b.id.slice(-5)} · {b.age} سنة · {b.residenceGovernorate || '-'}
                </option>
              ))}
          </select>

          <label className="block text-sm font-medium text-[#6B7280] mb-2">كلمة لولي أمر العريس (اختياري)</label>
          <textarea
            value={proposalNote}
            onChange={e => setProposalNote(e.target.value)}
            placeholder="تعريف موجز بالموليه أو أي ملاحظة..."
            rows={3}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-white dark:bg-gray-700 text-sm resize-none focus:outline-none focus:border-[#DAA520]"
          />

          <div className="flex gap-3">
            <button
              onClick={handleGuardianPropose}
              disabled={proposalSending || !selectedBrideForProposal}
              className="flex-1 py-3 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl text-sm font-bold hover:bg-[#2D6A4F] disabled:opacity-50 transition-colors"
            >
              {proposalSending ? 'جاري الإرسال...' : 'إرسال التقدم'}
            </button>
            <button onClick={() => setProposingToProfile(null)} className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-[#6B7280] hover:bg-gray-50 dark:hover:bg-gray-700">
              إلغاء
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}
```

---

## PHASE 9 — Frontend: Update `api.ts` and `App.tsx`

### 9.1 Add new API methods to `frontend/src/lib/api.ts`

In the `requests` object, add:
```typescript
requests: {
  // ... existing methods ...
  groomInbox: () => request('/requests/groom-inbox'),
  guardianDashboard: () => request('/requests/guardian-dashboard'),
  groomDashboard: () => request('/requests/groom-dashboard'),
  guardianPropose: (data: any) => request('/requests/guardian-propose', { method: 'POST', body: JSON.stringify(data) }),
  marriageSuccess: (data: any) => request('/requests/marriage-success', { method: 'POST', body: JSON.stringify(data) }),
},
```

### 9.2 Update `frontend/src/App.tsx` — add new routes

Add imports:
```tsx
import GroomInbox from './pages/GroomInbox';
import GuardianDashboard from './pages/GuardianDashboard';
import GroomDashboard from './pages/GroomDashboard';
```

Add routes:
```tsx
<Route path="groom-inbox" element={<ProtectedRoute roles={['GROOM', 'ADMIN']}><GroomInbox /></ProtectedRoute>} />
<Route path="guardian-dashboard" element={<ProtectedRoute roles={['GUARDIAN', 'ADMIN']}><GuardianDashboard /></ProtectedRoute>} />
<Route path="groom-dashboard" element={<ProtectedRoute roles={['GROOM', 'ADMIN']}><GroomDashboard /></ProtectedRoute>} />
```

### 9.3 Update `frontend/src/components/Layout.tsx` navigation

Add role-aware nav links. For GUARDIAN role show:
- لوحة التحكم → `/guardian-dashboard`
- سجلاتي → `/guardian/brides`
- تصفح العرسان → `/browse`
- الطلبات الواردة → `/requests`
- الرسائل → `/messages`

For GROOM role show:
- لوحة التحكم → `/groom-dashboard`
- السجلات المتاحة → `/brides/visible`
- صندوق التعارف → `/groom-inbox`
- الرسائل → `/messages`

In Layout.tsx, check `user?.roles` to render the correct navigation items.

---

## PHASE 10 — Build & Verify

```bash
# Backend
cd backend
npx prisma migrate dev --name add_guardian_proposal
npx prisma generate
npm run build

# Frontend
cd ../frontend
npm run build
```

### Marriage module smoke test:

**Guardian flow:**
- [ ] Register as GUARDIAN → redirects to /guardian/brides/new
- [ ] Create bride record → appears in /guardian/brides
- [ ] Go to /browse → see groom profiles → click "تقدم بموليتي" → select bride → send proposal
- [ ] Go to /guardian-dashboard → see bride count, pending requests, recent activity
- [ ] Go to /requests → see pending requests WITH full groom details AND which bride
- [ ] Accept request → conversation opens → navigate to /messages

**Groom flow:**
- [ ] Register as GROOM → redirects to /profile/setup
- [ ] Complete profile → submitted for review
- [ ] Profile approved → see it on /groom-dashboard with APPROVED status
- [ ] Guardian exposes bride → groom sees it on /brides/visible
- [ ] Click bride card → view details → send request button works
- [ ] Guardian's proposal arrives → shows in /groom-inbox under "تقدمات لي"
- [ ] Accept proposal → conversation opens

**Guardian-initiated proposal (Hafsa story):**
- [ ] Guardian visits /browse → finds suitable groom → sends proposal with guardianNote
- [ ] Groom receives notification
- [ ] Groom checks /groom-inbox → sees proposal with bride details
- [ ] Groom accepts → conversation created between guardian and groom
- [ ] Both can chat in /messages

**Success flow:**
- [ ] After successful nikah, guardian clicks "تم الزواج" in the conversation
- [ ] Bride record status changes to MATCHED
- [ ] Other party receives congratulatory notification
- [ ] Guardian dashboard shows matchedBrides count +1
