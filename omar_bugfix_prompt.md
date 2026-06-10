# Omar Platform — Comprehensive Bug Fix Prompt
**Based on full codebase review of main branch, June 2026**

---

## BEHAVIORAL RULES
- Execute every fix in order, no pausing between tasks
- Never stub or truncate — write complete replacement code
- After all backend fixes, run `npm run build` in `backend/` and fix any TypeScript errors
- After all frontend fixes, run `npm run build` in `frontend/` and fix any TypeScript errors
- No schema migrations needed — all fixes are code-only

---

## BUG INVENTORY (35 bugs across 7 severity levels)

---

## 🔴 CRITICAL — Fix first, these break core functionality

---

### BUG-01: Cleanup jobs are never started — expired stories and post views accumulate forever

**File:** `backend/src/server.ts`

`cleanup.service.ts` exports `startCleanupJobs()` but it is never imported or called anywhere. Expired stories stay in the DB. Post views grow without bound.

**Fix:** Add to `backend/src/server.ts`, after all route declarations and before `startServer()`:

```typescript
// Add import at top of file:
import { startCleanupJobs } from './services/cleanup.service';

// Add inside startServer(), after httpServer.listen(...):
startCleanupJobs();
logger.info('Cleanup jobs started');
```

---

### BUG-02: Every user profile is invisible to everyone until manually verified by admin

**File:** `backend/src/modules/social/social.controller.ts` — `getUserProfile` function

`isVerified` defaults to `false` on all new users and can only be set by admin. The current guard:
```typescript
if (!user || (!user.isVerified && user.id !== req.userId) || !user.isActive)
```
…means every new user's social profile returns 404 to everyone except themselves. All follow links, user cards, and PeopleSearch results are broken for 100% of users until an admin clicks "verify".

`isVerified` on this platform means "identity verified" (marriage context). It should not gate social profile visibility.

**Fix:** Remove the `isVerified` check from `getUserProfile`. Replace the guard with:
```typescript
if (!user || !user.isActive) {
  return res.status(404).json({ error: 'NOT_FOUND' });
}
```

---

### BUG-03: `viewCount` increments on every request, not just on first view by a user

**File:** `backend/src/modules/social/social.controller.ts` — `getPost` function

The current code:
```typescript
prisma.postView.upsert({
  where: { postId_userId: { postId: post.id, userId: req.userId } },
  update: {},
  create: { postId: post.id, userId: req.userId },
}).then(() => {
  prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
}).catch(() => {});
```
`upsert` fires `increment: 1` whether the view was NEW (create branch) or EXISTING (update branch). The same user viewing a post 100 times increments `viewCount` 100 times.

**Fix:** Replace the view tracking block with:
```typescript
if (req.userId && req.userId !== post.userId) {
  prisma.postView.upsert({
    where: { postId_userId: { postId: post.id, userId: req.userId } },
    update: { viewedAt: new Date() },
    create: { postId: post.id, userId: req.userId },
  }).then(async (result) => {
    // Only increment on actual create (first view by this user)
    // Check by comparing viewedAt — if it was just set to now, it's new
    // Use a simpler approach: count distinct views
    const viewCount = await prisma.postView.count({ where: { postId: post.id } });
    prisma.post.update({ where: { id: post.id }, data: { viewCount } }).catch(() => {});
  }).catch(() => {});
}
```

---

### BUG-04: Deleted posts leave media files on VPS disk forever

**File:** `backend/src/modules/social/social.controller.ts` — `deletePost` and `updatePost` functions

`deletePost` deletes the DB record but never calls `deleteFile()` on `post.mediaUrls`. `updatePost` when `mediaUrls` changes leaves orphaned files from the old version.

**Fix — `deletePost`:**
```typescript
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: id(req) },
      select: { id: true, userId: true, mediaUrls: true },
    });
    if (!post || post.userId !== req.userId) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not your post' });
    }
    await prisma.post.delete({ where: { id: id(req) } });
    // Clean up media files from disk
    post.mediaUrls.forEach(url => deleteFile(url));
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to delete post' });
  }
};
```

Add import at top of `social.controller.ts`:
```typescript
import { deleteFile } from '../../config/upload';
```

**Fix — `updatePost`:** After the `prisma.post.update(...)` call, add:
```typescript
// Delete old media files that are no longer referenced
if (mediaUrls !== undefined) {
  const removedUrls = post.mediaUrls.filter((u: string) => !(mediaUrls as string[]).includes(u));
  removedUrls.forEach((url: string) => deleteFile(url));
}
```
Fetch the post with `mediaUrls` before the update:
```typescript
const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true, mediaUrls: true, privacy: true } });
```

---

### BUG-05: Deleted stories leave media files on VPS disk

**File:** `backend/src/modules/social/social.controller.ts` — `deleteStory`

**Fix:**
```typescript
export const deleteStory = async (req: AuthRequest, res: Response) => {
  try {
    const storyId = req.params.storyId as string;
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story || story.userId !== req.userId) return res.status(403).json({ error: 'FORBIDDEN' });
    await prisma.story.delete({ where: { id: storyId } });
    deleteFile(story.mediaUrl);  // ADD THIS
    return res.json({ message: 'Story deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'INTERNAL' });
  }
};
```

---

### BUG-06: Cleanup job deletes story DB records but never deletes the media files

**File:** `backend/src/services/cleanup.service.ts` — `cleanupExpiredStories`

**Fix:** Replace the entire function:
```typescript
export const cleanupExpiredStories = async () => {
  try {
    // Fetch mediaUrls BEFORE deleting so we can clean up files
    const expired = await prisma.story.findMany({
      where: { expiresAt: { lt: new Date() } },
      select: { id: true, mediaUrl: true },
    });

    if (expired.length === 0) return;

    const result = await prisma.story.deleteMany({
      where: { id: { in: expired.map(s => s.id) } },
    });

    // Delete media files from disk
    expired.forEach(s => deleteFile(s.mediaUrl));

    console.log(`Cleanup: deleted ${result.count} expired stories and their media files`);
  } catch (error) {
    console.error('Cleanup expired stories error:', error);
  }
};
```

Add import at top of `cleanup.service.ts`:
```typescript
import { deleteFile } from '../config/upload';
```

---

## 🟠 HIGH — Functional bugs that break important features

---

### BUG-07: `startDirectConversation` can match the wrong conversation

**File:** `backend/src/modules/messaging/direct.controller.ts`

The query `participants: { some: { userId: { in: [req.userId!, recipientId] } } }` returns any DIRECT conversation where at least ONE of the two users is a participant — not necessarily BOTH. This can return a conversation between `req.userId` and a third party.

**Fix:** Replace the `existing` lookup:
```typescript
// Find a DIRECT conversation that has BOTH users as participants
const existing = await prisma.conversation.findFirst({
  where: {
    type: 'DIRECT',
    AND: [
      { participants: { some: { userId: req.userId! } } },
      { participants: { some: { userId: recipientId } } },
    ],
  },
  include: { participants: true },
});

if (existing) {
  const pIds = existing.participants.map(p => p.userId);
  if (pIds.includes(req.userId!) && pIds.includes(recipientId) && existing.participants.length === 2) {
    return res.json(existing);
  }
}
```

---

### BUG-08: `deleteComment` — post owner cannot delete comments on their own post

**File:** `backend/src/modules/social/social.controller.ts` — `deleteComment`

Only the comment author can delete a comment. Post owners should be able to moderate their own posts.

**Fix:**
```typescript
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId as string;
    const postId = req.params.id as string;

    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      include: { post: { select: { userId: true } } },
    });
    if (!comment) return res.status(404).json({ error: 'NOT_FOUND' });

    const isCommentAuthor = comment.userId === req.userId;
    const isPostOwner = comment.post?.userId === req.userId;

    if (!isCommentAuthor && !isPostOwner) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not your comment or post' });
    }

    await prisma.postComment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to delete comment' });
  }
};
```

---

### BUG-09: `toggleBlock` is not atomic — follow deletion + block creation can partially fail

**File:** `backend/src/modules/social/social.controller.ts` — `toggleBlock`

Two sequential DB writes without a transaction. If `block.create` fails, follows are already deleted.

**Fix:** Wrap in a Prisma transaction:
```typescript
// In the else (blocking) branch, replace the two sequential calls with:
await prisma.$transaction([
  prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: req.userId!, followingId: blockedId },
        { followerId: blockedId, followingId: req.userId! },
      ],
    },
  }),
  prisma.block.create({ data: { blockerId: req.userId!, blockedId } }),
]);
return res.json({ blocked: true });
```

---

### BUG-10: `sendConnectionRequest` crashes with 500 if `receiverId` doesn't exist

**File:** `backend/src/modules/connections/connections.controller.ts`

No validation that `receiverId` refers to a real user. A foreign key constraint violation causes an unhandled 500.

**Fix:** Add before `prisma.connectionRequest.create`:
```typescript
const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, isActive: true } });
if (!receiver || !receiver.isActive) {
  return res.status(404).json({ error: 'NOT_FOUND', messageAr: 'المستخدم غير موجود', messageEn: 'User not found' });
}
```

---

### BUG-11: `express.json` limit is 50MB — DoS vector

**File:** `backend/src/server.ts`

```typescript
app.use(express.json({ limit: '50mb' }));
```
Media is now disk-stored (multer). No API endpoint legitimately needs a 50MB JSON body. Any unauthenticated client can send 50MB requests and exhaust server memory.

**Fix:**
```typescript
app.use(express.json({ limit: '2mb' }));
```

---

### BUG-12: `getFollowers` / `getFollowing` have no pagination — returns all rows

**File:** `backend/src/modules/social/social.controller.ts`

A user with thousands of followers triggers a query returning thousands of rows.

**Fix — replace both `getFollowers` and `getFollowing`:**

```typescript
export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.params.userId as string) || req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: { select: { id: true, roles: true, subscriptionPlan: true, isOnline: true, profile: { select: { displayName: true, photos: { where: { isPrimary: true }, take: 1 } } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);
    res.json({ followers: followers.map(f => ({ ...f.follower, followedAt: f.createdAt })), total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to get followers' });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.params.userId as string) || req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: { select: { id: true, roles: true, subscriptionPlan: true, isOnline: true, profile: { select: { displayName: true, photos: { where: { isPrimary: true }, take: 1 } } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);
    res.json({ following: following.map(f => ({ ...f.following, followedAt: f.createdAt })), total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to get following' });
  }
};
```

---

### BUG-13: Socket presence broadcasts to ALL connected users — expensive at scale

**File:** `backend/src/services/socket.ts`

```typescript
io.emit('user_online', { userId });  // Sends to ALL connected sockets
io.emit('user_offline', { userId, lastSeenAt: new Date() });
```

Every connect/disconnect event is broadcast to all clients simultaneously.

**Fix:** Only notify users who follow this user:
```typescript
// In disconnect handler and the async connection block, replace io.emit with:

// Helper (add once near top of setupSocket):
const notifyFollowers = async (userId: string, event: string, data: any) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });
    followers.forEach(f => {
      io.to(`user:${f.followerId}`).emit(event, data);
    });
  } catch {}
};

// Replace io.emit('user_online', ...) with:
notifyFollowers(userId, 'user_online', { userId });

// Replace io.emit('user_offline', ...) with:
notifyFollowers(userId, 'user_offline', { userId, lastSeenAt: new Date() });
```

---

## 🟡 MEDIUM — Logic errors with data integrity or correctness impact

---

### BUG-14: `hashtag.postCount` is never decremented when a post is deleted

**File:** `backend/src/modules/social/social.controller.ts` — `deletePost`

`parseAndSaveHashtags` increments `postCount` on creation. Nothing decrements it on deletion. Trending hashtags show inflated counts after posts are deleted.

**Fix:** Add inside `deletePost`, after fetching the post (add `hashtags` to the select):
```typescript
const post = await prisma.post.findUnique({
  where: { id: id(req) },
  select: { id: true, userId: true, mediaUrls: true, hashtags: { include: { hashtag: true } } },
});
// ... after post.delete():
// Decrement hashtag counts
if (post.hashtags?.length > 0) {
  await prisma.$transaction(
    post.hashtags.map(ph =>
      prisma.hashtag.update({
        where: { id: ph.hashtagId },
        data: { postCount: { decrement: 1 } },
      })
    )
  );
}
```

---

### BUG-15: `parseMentions` does N sequential DB queries (N+1 pattern)

**File:** `backend/src/modules/social/social.controller.ts` — `parseMentions`

For 10 @mentions, this runs 10 separate `prisma.profile.findFirst()` calls sequentially.

**Fix:** Replace the `parseMentions` function body:
```typescript
const parseMentions = async (postId: string, content: string, authorId: string): Promise<void> => {
  const mentionMatches = content.match(/@[\u0600-\u06FFa-zA-Z0-9_]+/g) || [];
  const names = [...new Set(mentionMatches.map(m => m.slice(1)))].slice(0, 10);
  if (names.length === 0) return;

  // Single query for all mentioned names
  const profiles = await prisma.profile.findMany({
    where: {
      displayName: { in: names, mode: 'insensitive' },
      userId: { not: authorId },
    },
    select: { userId: true, displayName: true },
  });

  if (profiles.length === 0) return;

  const authorName = await getUserDisplayName(authorId);

  await Promise.allSettled(profiles.map(async (profile) => {
    await prisma.postMention.upsert({
      where: { postId_userId: { postId, userId: profile.userId } },
      update: {},
      create: { postId, userId: profile.userId },
    });
    createNotification({
      userId: profile.userId,
      type: 'post_mention',
      titleAr: 'تم ذكرك في منشور',
      titleEn: 'You were mentioned in a post',
      bodyAr: `ذكرك ${authorName} في منشور`,
      bodyEn: `${authorName} mentioned you in a post`,
      data: { postId, authorId },
    });
  }));
};
```

---

### BUG-16: `cleanupOldPostViews` batch loop is broken — deletes everything on first iteration

**File:** `backend/src/services/cleanup.service.ts` — `cleanupOldPostViews`

The loop runs `Math.ceil(count / BATCH_SIZE)` times but `deleteMany` without `take` deletes ALL matching records on the first call. Subsequent iterations delete 0. The batch logic does nothing.

**Fix:**
```typescript
export const cleanupOldPostViews = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    // Prisma doesn't support 'take' in deleteMany — use cursor-based batch delete
    let deleted = 0;
    while (true) {
      const batch = await prisma.postView.findMany({
        where: { viewedAt: { lt: cutoff } },
        select: { id: true },
        take: 1000,
      });
      if (batch.length === 0) break;
      const result = await prisma.postView.deleteMany({
        where: { id: { in: batch.map(b => b.id) } },
      });
      deleted += result.count;
      if (batch.length < 1000) break;
    }
    console.log(`Cleanup: deleted ${deleted} old post views`);
  } catch (error) {
    console.error('Cleanup old post views error:', error);
  }
};
```

---

### BUG-17: `@mention` links in `richText.tsx` are not clickable — they render as `<span>` with no navigation

**File:** `frontend/src/lib/richText.tsx`

`@username` renders as a styled `<span>` with no `onClick` handler and no link target. Clicking does nothing.

The issue: we don't have the user's ID when rendering — only the display name. The correct fix is to resolve mentions server-side and return IDs in the post's `mentions` field.

**Fix — richText.tsx:** Pass the post's `mentions` array to the renderer:

```tsx
import { Link } from 'react-router-dom';

interface Mention {
  userId: string;
  user?: { profile?: { displayName?: string } };
}

export const renderRichText = (content: string, mentions?: Mention[]): React.ReactNode => {
  if (!content) return null;

  // Build a name→userId lookup from the mentions array
  const mentionMap = new Map<string, string>();
  mentions?.forEach(m => {
    const name = m.user?.profile?.displayName;
    if (name) mentionMap.set(name.toLowerCase(), m.userId);
  });

  const parts = content.split(/(#[\u0600-\u06FFa-zA-Z0-9_]+|@[\u0600-\u06FFa-zA-Z0-9_]+)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('#')) {
      const tag = part.slice(1).toLowerCase();
      return <Link key={i} to={`/social/hashtag/${tag}`} className="text-[var(--color-primary)] hover:underline font-medium" onClick={e => e.stopPropagation()}>{part}</Link>;
    }
    if (part.startsWith('@')) {
      const name = part.slice(1).toLowerCase();
      const userId = mentionMap.get(name);
      if (userId) {
        return <Link key={i} to={`/social/user/${userId}`} className="text-blue-500 font-medium hover:underline" onClick={e => e.stopPropagation()}>{part}</Link>;
      }
      return <span key={i} className="text-blue-500 font-medium">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};
```

**Fix — update all call sites** that use `renderRichText(post.content)` to pass mentions:
```tsx
{renderRichText(post.content, post.mentions)}
```
Update in: `SocialFeed.tsx` (line in the content render), `PostDetail.tsx` (same).

---

### BUG-18: `onNewPostInFeed` silently fails if socket isn't connected yet at mount time

**File:** `frontend/src/lib/socket.ts` and `frontend/src/pages/social/SocialFeed.tsx`

```typescript
export const onNewPostInFeed = (cb: ...) => {
  if (!socket) return;  // returns undefined — listener never registered
  socket.on('new_post_in_feed', cb);
  return () => socket?.off('new_post_in_feed', cb);
};
```

If `connectSocket()` hasn't resolved yet when `SocialFeed` mounts, the listener is silently not registered. Real-time feed never works for users on slow connections.

**Fix — `frontend/src/lib/socket.ts`:** Add a pending listener queue:

```typescript
// Add near top of file:
const pendingListeners: { event: string; cb: (...args: any[]) => void }[] = [];

// Update connectSocket to flush pending listeners after connect:
socket.on('connect', () => {
  console.log('Socket connected');
  pendingListeners.forEach(({ event, cb }) => socket!.on(event, cb));
  pendingListeners.length = 0;
});

// Update onNewPostInFeed:
export const onNewPostInFeed = (cb: (data: { postId: string; authorId: string }) => void) => {
  if (socket?.connected) {
    socket.on('new_post_in_feed', cb);
  } else {
    pendingListeners.push({ event: 'new_post_in_feed', cb });
  }
  return () => {
    socket?.off('new_post_in_feed', cb);
    const idx = pendingListeners.findIndex(l => l.cb === cb);
    if (idx !== -1) pendingListeners.splice(idx, 1);
  };
};
```

---

### BUG-19: `handleLike` in `SocialFeed.tsx` uses inconsistent `liked` state representation

**File:** `frontend/src/pages/social/SocialFeed.tsx` — `handleLike`

The API returns `likes: [{ userId: '...' }]` (array). `handleLike` optimistically sets `liked: true/false` (boolean). The render checks both `post.liked?.[0]` and `post.liked`, which works by accident but breaks after the second toggle because `true[0] === undefined`.

**Fix — `handleLike`:**
```typescript
const handleLike = async (postId: string) => {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const isLiked = !!(post.likes?.[0]);
  await api.social.toggleLike(postId);
  setPosts(prev => prev.map(p => p.id === postId ? {
    ...p,
    likes: isLiked ? [] : [{ userId: currentUserId }],
    _count: { ...p._count, likes: isLiked ? p._count.likes - 1 : p._count.likes + 1 },
  } : p));
};
```

**Fix — render:** Change the like button fill condition from:
```tsx
fill={post.liked?.[0] || post.liked ? 'currentColor' : 'none'}
```
To:
```tsx
fill={post.likes?.[0] ? 'currentColor' : 'none'}
```
And the className condition:
```tsx
className={`... ${post.likes?.[0] ? 'text-red-500' : 'text-[var(--color-muted)] hover:text-red-500'}`}
```

---

### BUG-20: `handleCreatePost` doesn't refresh feed when user is on page > 1

**File:** `frontend/src/pages/social/SocialFeed.tsx` — `handleCreatePost`

```typescript
setPage(1);
if (page === 1) fetchPosts(false, 1);
```

At the time `page === 1` is checked, `page` still holds the current state value (say, 3). So `if (3 === 1)` is false and the feed is never refreshed. The `setPage(1)` triggers a re-render but `fetchPosts` in the `useEffect` won't fire correctly because the state setter is async.

**Fix:**
```typescript
const handleCreatePost = async () => {
  if (!canPublish) return;
  setSubmitting(true);
  try {
    const shared = await api.social.createPost({ content: newPost, privacy: postPrivacy, mediaUrls });
    emitPostCreated(shared.id);
    setNewPost('');
    setMediaUrls([]);
    setMediaPreviews([]);
    setUploadError('');
    // Always fetch fresh regardless of current page
    fetchPosts(false, 1);
    setPage(1);
  } catch (e) {
    console.error('Create post failed:', e);
  } finally {
    setSubmitting(false);
  }
};
```

---

### BUG-21: Missing `/admin/donations` route in `App.tsx`

**File:** `frontend/src/App.tsx`

`AdminDonations` component is imported but no route is registered for it. The page is unreachable.

**Fix:** Add inside `<Route path="/" element={<Layout />}>`, with the other admin routes:
```tsx
<Route path="admin/donations" element={<ProtectedRoute roles={['ADMIN']}><AdminDonations /></ProtectedRoute>} />
```

---

## 🟢 LOW — Correctness and polish issues

---

### BUG-22: `socialLimiter` rate-limits all social routes including high-frequency reads

**File:** `backend/src/modules/social/social.routes.ts`

`router.use(socialLimiter)` applies after `authenticate`, limiting feed reads, post views, comment fetches — all the high-frequency read endpoints that should be generous. Only writes (create, like, comment) need tight rate limiting.

**Fix:** Remove `router.use(socialLimiter)` from the global position and apply it only to write operations:
```typescript
// Remove: router.use(socialLimiter);

// Add socialLimiter only to mutation endpoints:
router.post('/posts', socialLimiter, createPost);
router.post('/posts/:id/like', socialLimiter, toggleLike);
router.post('/posts/:id/comments', socialLimiter, addComment);
router.post('/posts/:id/comments/:commentId/replies', socialLimiter, addReply);
router.post('/posts/:id/share', socialLimiter, sharePost);
router.post('/follow/:userId', socialLimiter, toggleFollow);
// Leave GET routes unlimitered (general limiter still applies)
```

---

### BUG-23: Socket `catch {}` in online presence update silently swallows DB errors

**File:** `backend/src/services/socket.ts`

```typescript
(async () => {
  try {
    await prisma.user.update(...);
    ...
  } catch {}  // completely silent
})();
```

**Fix:**
```typescript
(async () => {
  try {
    await prisma.user.update({ where: { id: userId }, data: { isOnline: true, lastSeenAt: new Date() } });
    notifyFollowers(userId, 'user_online', { userId });
  } catch (err) {
    console.error(`[SOCKET] Failed to set online status for userId=${userId}:`, err);
  }
})();
```

---

### BUG-24: `HashtagFeed.tsx` doesn't show hashtag name in title when hashtag doesn't exist in DB

**File:** `frontend/src/pages/social/HashtagFeed.tsx`

When a hashtag URL is visited but has no posts (hashtag not in DB), the title just shows `#tag` from `useParams` but `data?.hashtag` is null, so postCount is undefined.

**Fix:** The component already uses `{tag}` from `useParams` for the heading — it's fine. But the `postCount` display:
```tsx
{data?.hashtag && <p ...>{data.hashtag.postCount} منشور</p>}
```
When hashtag doesn't exist, the `data` object returned is `{ posts: [], total: 0, page: 1, totalPages: 0 }` with no `hashtag` key. The check `data?.hashtag &&` already guards this. BUT the whole data object check is missing — if `data` is null (before first load resolves), it crashes.

**Fix:**
```tsx
{data && <p className="text-sm text-[var(--color-muted)] mt-1">{data.hashtag?.postCount ?? 0} منشور</p>}
```

---

### BUG-25: `renderRichText` returns `null` for empty string but callers render it inside `<p>` creating empty paragraphs

**File:** `frontend/src/lib/richText.tsx`

When `content` is `''` (empty string for share-only posts), `renderRichText` returns `null`. This is correct, but call sites always render it inside a `<p>` tag regardless, creating `<p></p>` in the DOM.

**Fix in `SocialFeed.tsx`:**
```tsx
{post.content && (
  <p className="text-sm text-[var(--color-text)] leading-relaxed mb-3 whitespace-pre-wrap">
    {renderRichText(post.content, post.mentions)}
  </p>
)}
```

---

### BUG-26: `auth.controller.ts` — `formatUser` doesn't include `subscriptionExpiry`, causing type mismatch with authStore

**File:** `backend/src/modules/auth/auth.controller.ts`

`formatUser` used in `register` and `updateRoles` returns a user object without `subscriptionExpiry`. But `authStore.ts` defines `User` interface with `subscriptionExpiry?: string`. The `getMe` endpoint returns `subscriptionExpiry` correctly, but the token refresh path uses `generateTokens` which doesn't refresh the user object at all — the client never gets the updated `subscriptionExpiry` after it changes.

**Fix — update `formatUser`:**
```typescript
const formatUser = (user: any) => ({
  id: user.id,
  firebaseUid: user.firebaseUid,
  phone: user.phone,
  email: user.email,
  roles: user.roles,
  isVerified: user.isVerified,
  isActive: user.isActive,
  isBanned: user.isBanned,
  subscriptionPlan: user.subscriptionPlan,
  subscriptionExpiry: user.subscriptionExpiry ?? null,
  language: user.language,
});
```

---

### BUG-27: `getMe` response doesn't include `bio`, `tagline`, `isOnline` — social profile fields missing for self

**File:** `backend/src/modules/auth/auth.controller.ts` — `getMe`

After the social module added `bio`, `tagline`, `websiteUrl`, `isOnline` to User, `getMe` still returns the old minimal object. The frontend authStore `User` type doesn't know about these fields.

**Fix — add to `getMe` response:**
```typescript
return res.json({
  id: user.id,
  firebaseUid: user.firebaseUid,
  phone: user.phone,
  email: user.email,
  roles: user.roles,
  isVerified: user.isVerified,
  subscriptionPlan: user.subscriptionPlan,
  subscriptionExpiry: user.subscriptionExpiry,
  language: user.language,
  isActive: user.isActive,
  isBanned: user.isBanned,
  hasProfile: !!user.profile,
  profileId: user.profile?.id,
  profilePhoto: user.profile?.photos?.[0]?.url || null,
  bio: user.bio,
  tagline: user.tagline,
  websiteUrl: user.websiteUrl,
  isOnline: user.isOnline,
  createdAt: user.createdAt,
});
```

Also update the Prisma query in `getMe` to include these fields:
```typescript
const user = await prisma.user.findUnique({
  where: { id: req.userId },
  select: {
    id: true, firebaseUid: true, phone: true, email: true, roles: true,
    isVerified: true, subscriptionPlan: true, subscriptionExpiry: true,
    language: true, isActive: true, isBanned: true, bio: true, tagline: true,
    websiteUrl: true, isOnline: true, createdAt: true,
    profile: { include: { photos: { orderBy: { order: 'asc' }, take: 1 } } },
  },
});
```

---

### BUG-28: `SocialFeed.tsx` — `useEffect` for page changes triggers double-fetch on tab switch

**File:** `frontend/src/pages/social/SocialFeed.tsx`

The single `useEffect([tab, page])` handles both tab switches and page increments. When switching tabs, it calls `setPage(1)` AND the effect re-fires with the new `tab` + `page=1`, causing two fetches. The second fetch is the correct one but the first momentarily shows stale data.

**Fix:** Separate the effects:
```tsx
// Effect 1: When tab changes, reset page and fetch
useEffect(() => {
  setPage(1);
  fetchPosts(false, 1);
}, [tab]);

// Effect 2: When page changes beyond 1 (load more), append
useEffect(() => {
  if (page > 1) fetchPosts(true, page);
}, [page]);
```

Remove the old combined `useEffect([tab, page])` entirely.

---

### BUG-29: `UserPublicProfile.tsx` missing `ProtectedRoute` wrapper — unauthenticated users can access it and crash on API calls

**File:** `frontend/src/App.tsx`

```tsx
<Route path="social/user/:userId" element={<UserPublicProfile />} />
```

No `ProtectedRoute` wrapper. `UserPublicProfile` calls `api.social.getUserProfile()` which requires auth (`authenticate` middleware). Unauthenticated visitors get a 401, the component crashes, and they see a blank page.

**Fix:**
```tsx
<Route path="social/user/:userId" element={<ProtectedRoute><UserPublicProfile /></ProtectedRoute>} />
```

---

### BUG-30: `ExposureManager.tsx` has no route in `App.tsx` — guardian cannot expose bride to groom

**File:** `frontend/src/App.tsx`

The `ExposureManager` component exists and is used within `BrideList.tsx` as a modal — it's not a standalone page route, which is correct. But verify `BrideList.tsx` actually renders the modal properly. No fix needed if it's used inline.

**Action:** Verify `frontend/src/pages/guardian/BrideList.tsx` imports and renders `<ExposureManager>`. If not, add the import and modal trigger button per bride list item.

---

### BUG-31: `StoriesBar.tsx` — no error handling on story upload failure shown to user

**File:** `frontend/src/pages/social/StoriesBar.tsx`

```typescript
} catch (err) {
  console.error('Story upload failed:', err);
}
```

Upload failures are silently logged. Users get no feedback.

**Fix:** Add a state variable for upload errors:
```tsx
const [uploadError, setUploadError] = useState('');

// In catch:
} catch (err: any) {
  setUploadError(err.message || 'فشل رفع القصة');
  setTimeout(() => setUploadError(''), 4000);
}

// In JSX, add below the input:
{uploadError && (
  <div className="text-xs text-red-500 mt-1 px-2">{uploadError}</div>
)}
```

---

### BUG-32: `social.routes.ts` — `GET /users/:userId/profile` is declared after `authenticate` but marked `optionalAuth`

**File:** `backend/src/modules/social/social.routes.ts`

```typescript
router.use(authenticate);  // all routes after this require auth
...
router.get('/users/:userId/profile', optionalAuth, getUserProfile);  // overridden by line above
```

`optionalAuth` is the second middleware after `authenticate`, but since `authenticate` runs first and RETURNS if token is missing (401 response), `optionalAuth` never runs for unauthenticated requests. The route is effectively auth-required.

This is only a problem if you intend anonymous users to view social profiles. For Omar (authenticated platform), this is fine as-is. But `optionalAuth` is misleading.

**Fix:** Remove `optionalAuth` from this route since `authenticate` already covers it:
```typescript
router.get('/users/:userId/profile', getUserProfile);
```

Also for consistency, move the public-accessible post/hashtag routes BEFORE `router.use(authenticate)` if you ever want them unauthenticated:
```typescript
// Before router.use(authenticate):
router.get('/posts/:id', optionalAuth, getPost);
router.get('/hashtag/:tag', optionalAuth, getHashtagFeed);

router.use(authenticate);
router.use(...);
// Everything else...
```
This is already correctly done in the current code. Keep as-is.

---

### BUG-33: No `admin/donations` link in admin navigation

**File:** `frontend/src/pages/admin/AdminDashboard.tsx`

Even after BUG-21 fix adds the route, the admin dashboard nav likely has no link to `/admin/donations`. Verify and add a "التبرعات" link to the admin sidebar/nav that points to `/admin/donations`.

---

## PHASE: Final Verification

After all fixes are applied:

```bash
# Backend
cd backend
npm run build
# Must produce zero TypeScript errors

# Frontend
cd frontend
npm run build
# Must produce zero TypeScript errors
```

### Smoke test checklist:
- [ ] New user registers → can be found via PeopleSearch immediately (BUG-02)
- [ ] Create post with photo → photo accessible at /uploads/social/... (BUG-04 prerequisite)
- [ ] Delete post → photo file no longer exists on disk (BUG-04)
- [ ] Delete story → media file no longer exists on disk (BUG-05)
- [ ] Cleanup job logs appear after server start (BUG-01)
- [ ] View same post 5 times as same user → viewCount = 1 (BUG-03)
- [ ] Like a post → like state toggles correctly on second click (BUG-19)
- [ ] Create post while on page 3 → feed resets to page 1 (BUG-20)
- [ ] Navigate to /admin/donations → page loads (BUG-21)
- [ ] Post with @username → mention is clickable link to correct profile (BUG-17)
- [ ] Delete someone else's comment on your post → allowed (BUG-08)
- [ ] Post with #hashtag → delete post → hashtag postCount decrements (BUG-14)
- [ ] 50MB JSON body to /api/auth → rejected with 413 (BUG-11)
- [ ] Start conversation with userId → second call returns same conversation (BUG-07)
- [ ] Unauthenticated visit to /social/user/:id → redirected to login (BUG-29)
