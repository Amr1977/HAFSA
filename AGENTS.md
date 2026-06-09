# Project Context — HAFSA

## Stack
- Backend: Node.js/Express + Prisma/PostgreSQL (Neon), Socket.IO
- Frontend: React/Vite + Firebase Hosting
- Media: VPS local disk via multer, served at `/uploads/`
- Domain: commerce-api.et3am.com (nginx proxies `/hafsa/` -> backend port 3001)
- PM2: `hafsa-backend` running `backend/dist/server.js -p 3001`

## Recent Work (Completed June 2026)
Full social media feature set implemented across all layers:

### Schema (Phase 1)
- User: added `bio`, `tagline`, `websiteUrl`, `lastSeenAt`, `isOnline`
- Post: added `isPinned`, `viewCount`, `parentId` to PostComment
- New models: PostCommentLike, PostSave, PostView, Hashtag, PostHashtag, PostMention, PostReport, Block, Story, StoryView, StoryPrivacy enum

### Backend (Phase 2-5)
- `backend/src/config/upload.ts` — VPS disk storage with subdirs (profiles, social, stories, services, stores), size/mime limits
- `backend/src/modules/social/social.controller.ts` — Full social controller: posts CRUD, hashtags, mentions, comments+pagination+replies, comment likes, saves, report, block, user profile/search/suggested, hashtag feed/trending, pin, stories CRUD
- `backend/src/modules/social/social.routes.ts` — All new routes
- `backend/src/modules/admin/admin.controller.ts` — getPostReports, resolvePostReport
- `backend/src/modules/admin/admin.routes.ts` — Report routes
- `backend/src/services/socket.ts` — Presence (online/offline), post_created event (notify followers)

### Frontend (Phase 6-7)
- `frontend/src/pages/social/SocialFeed.tsx` — StoriesBar, bookmark/pin/report, rich text, socket listener, fixed profile links
- `frontend/src/pages/social/PostDetail.tsx` — Fixed profile links, rich text
- `frontend/src/pages/social/UserPublicProfile.tsx` — `/social/user/:userId`
- `frontend/src/pages/social/HashtagFeed.tsx` — `/social/hashtag/:tag`
- `frontend/src/pages/social/PeopleSearch.tsx` — `/social/people`
- `frontend/src/pages/social/StoriesBar.tsx` — Story upload + carousel viewer
- `frontend/src/lib/richText.tsx` — Hashtag/mention -> link renderer
- `frontend/src/lib/api.ts` — Extended social object with all endpoints
- `frontend/src/lib/socket.ts` — onNewPostInFeed, onUserOnline, onUserOffline, emitPostCreated
- `frontend/src/App.tsx` — New routes added
- `frontend/src/components/Layout.tsx` — Social nav link

### Security (Phase 8 - June 2026)
- `frontend/src/pages/auth/Login.tsx` — Added gender confirmation modal for Google auth (Yes/No)
- `frontend/src/pages/auth/Register.tsx` — Added gender confirmation modal for Google auth, button confirmation for email
- Fixed inactive user visibility in `browse.controller.ts`, `social.controller.ts`, `brides.controller.ts`
- Removed duplicate `NotificationPayload` interface in `notification.service.ts`
- Added HSTS and security headers in `server.ts`
- Strengthened Socket.IO CORS (requires `FRONTEND_URL`) and enforced DB verification in `socket.ts`
- Added file path sanitization in `upload.ts`
- Added `socialLimiter` for rate limiting in `social.routes.ts`
- Created `backend/src/services/cleanup.service.ts` for story/post cleanup
- Fixed frontend logger to use `/logs/client/public` for anonymous users

## TypeScript Fixes
- `req.params` values typed as `string | string[]` — use `const x = req.params.x as string` pattern
- `UserAvatar` `size` prop only accepts `'sm' | 'md' | 'lg'` (no 'xl')
- `await` outside async function in socket handler — use IIFE

## Build Commands (both must pass)
```
cd backend && npm run build
cd frontend && npm run build
```

## Deployment
- **Backend**: `cd backend && npm run build && pm2 restart hafsa-backend`
- **Frontend**: `cd frontend && npm run build && firebase deploy --only hosting`
- **Schema**: `cd backend && npx prisma db push && npx prisma generate`
- **Push code**: `git add . && git commit -m "msg" && git push`

## Branch
`main` (current working branch)
