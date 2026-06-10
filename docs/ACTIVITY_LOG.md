# Activity Log

## 2026-06-09

### Security Fixes
1. **Socket Auth Verification** - Enforced DB verification for Socket.IO connections (removed optional flag)
2. **CORS Security** - Restricted CORS origins, no wildcard fallback
3. **HSTS Headers** - Added security headers including HSTS for production
4. **File Upload Sanitization** - Added path traversal protection in `deleteFile`

### Bug Fixes
1. **Inactive User Listings** - Added `isActive: true` check to all profile/browse queries
   - `browse.controller.ts`: `browseProfiles`, `getAiSuggestions`, `getProfileDetail`
   - `social.controller.ts`: `searchUsers`, `getSuggestedUsers`, `getUserProfile`, `getUserPosts`, `getStoriesFeed`
   - `brides.controller.ts`: `getVisibleBrides`, `exposeBride`
2. **Duplicate Interface** - Removed duplicate `NotificationPayload` in `notification.service.ts`
3. **Frontend Logger Fix** - Fixed API endpoint for anonymous users (`/logs/client/public`)
4. **Error Handling** - Improved error handling in `Requests.tsx`

### Features
1. **Rate Limiting** - Added `socialLimiter` for social module endpoints
2. **Cleanup Service** - Created `cleanup.service.ts` for expired stories/post views

### Pending
- Zod validation middleware (requires infrastructure)
- Redis adapter for Socket.IO clustering (requires infrastructure)
- Cursor-based pagination (significant refactor)
- OpenAPI documentation (significant addition)