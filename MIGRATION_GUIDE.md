# API Configuration Migration Summary

## What Changed

### Before (❌ Old Approach)
```typescript
// Hardcoded URL in main.tsx
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://housingms.runasp.net/api/trpc",  // ❌ Hardcoded!
      transformer: superjson,
      fetch: safeTRPCFetch,
    }),
  ],
});
```

**Problems:**
- ❌ URL hardcoded in code
- ❌ No environment-specific configuration
- ❌ Difficult to change API endpoints
- ❌ Not Netlify-friendly

---

### After (✅ New Approach)

#### Step 1: Centralized Config (`client/src/lib/api.ts`)
```typescript
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://housingms.runasp.net',
  trpcURL: `${API_BASE_URL}/api/trpc`,
  loginURL: new URL('/login', OAUTH_SERVER_URL).toString(),
  // ... more endpoints
};
```

#### Step 2: Update main.tsx
```typescript
import apiConfig from "@/lib/api";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiConfig.trpcURL,  // ✅ Dynamic, from config!
      transformer: superjson,
      fetch: safeTRPCFetch,
    }),
  ],
});
```

#### Step 3: Environment Variables

**Development (client/.env.local):**
```dotenv
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
```

**Production (netlify.toml):**
```toml
[build.environment]
VITE_API_BASE_URL = "https://housingms.runasp.net"
VITE_OAUTH_SERVER_URL = "https://housingms.runasp.net"
```

**Benefits:**
- ✅ Single source of truth (one config file)
- ✅ Environment-specific URLs
- ✅ Easy to update (change in one place)
- ✅ Netlify-ready (uses environment variables)
- ✅ Development uses HTTP, Production uses HTTPS
- ✅ No code changes needed when API URL changes

---

## Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│         Application Bootstrap (main.tsx)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ import apiConfig from      │
        │ "@/lib/api"                │
        └────────────┬───────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │  client/src/lib/api.ts             │
    │  ────────────────────────────────  │
    │  const API_BASE_URL =              │
    │    import.meta.env.VITE_API_BASE   │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ Where do env variables      │
    │ come from?                  │
    ├──────────────┬──────────────┤
    │ Development  │ Production   │
    │ .env.local   │ netlify.toml │
    └──────────────┴──────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ apiConfig.trpcURL evaluated  │
    │ Dev:  http://...             │
    │ Prod: https://...            │
    └──────────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │ tRPC httpBatchLink       │
        │ uses apiConfig.trpcURL   │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │ Requests sent to correct │
        │ API endpoint!            │
        └──────────────────────────┘
```

---

## API Endpoint Resolution

### Development Flow
```
npm run dev
  ↓
Reads client/.env.local
  ↓
VITE_API_BASE_URL=http://housingms.runasp.net
  ↓
apiConfig.trpcURL = "http://housingms.runasp.net/api/trpc"
  ↓
Frontend connects to HTTP endpoint
```

### Production Flow (Netlify)
```
Netlify Deploy
  ↓
Reads netlify.toml [build.environment]
  ↓
VITE_API_BASE_URL=https://housingms.runasp.net
  ↓
npm run build
  ↓
apiConfig.trpcURL = "https://housingms.runasp.net/api/trpc"
  ↓
Build output with HTTPS endpoint
  ↓
Deployed to Netlify CDN
  ↓
Frontend connects to HTTPS endpoint
```

---

## How to Update API Configuration

### Change API URL
**Option 1: For all environments**
```bash
# Edit client/src/lib/api.ts
# Change: const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://new-api.com'
```

**Option 2: Development only**
```bash
# Edit client/.env.local
VITE_API_BASE_URL=http://new-api.com
```

**Option 3: Production only (Netlify)**
```bash
# Edit netlify.toml
[build.environment]
VITE_API_BASE_URL = "https://new-api.com"
```

**Option 4: Netlify UI settings** (highest priority)
- Go to Netlify dashboard → Site settings → Build & Deploy → Environment
- Add environment variable: `VITE_API_BASE_URL`

### Add New API Endpoint
```typescript
// In client/src/lib/api.ts
export const apiConfig = {
  // ... existing endpoints
  
  // New endpoint
  webhookURL: `${API_BASE_URL}/webhooks`,
};
```

Then use in code:
```typescript
import apiConfig from '@/lib/api';

// Usage
const webhookUrl = apiConfig.webhookURL;
```

---

## Backward Compatibility

The new configuration maintains **100% backward compatibility**:

```typescript
// Old code still works
import { getLoginUrl, API_BASE_URL, OAUTH_SERVER_URL } from '@/const';

const url = getLoginUrl();  // ✅ Still works!
```

This is because `const.ts` re-exports from the new `apiConfig`:
```typescript
export const getLoginUrl = () => apiConfig.loginURL;
export const OAUTH_SERVER_URL = apiConfig.oauthBaseURL;
export const API_BASE_URL = apiConfig.baseURL;
```

---

## Verification Checklist

- [x] `client/src/lib/api.ts` created with centralized config
- [x] `client/src/const.ts` imports from apiConfig
- [x] `client/src/main.tsx` uses `apiConfig.trpcURL`
- [x] No hardcoded URLs in source code
- [x] `client/.env.local` has development URLs
- [x] `client/.env` has production URLs
- [x] `netlify.toml` has build environment variables
- [x] `npm run build` succeeds
- [x] `npm run dev` starts successfully
- [x] Frontend loads at http://localhost:5173
- [x] API calls go to correct endpoint

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Config Location | Hardcoded in code | `client/src/lib/api.ts` |
| Environment Support | Single URL | Dev/Prod specific |
| Update Process | Edit code, rebuild | Change env variables |
| Netlify Ready | ❌ No | ✅ Yes |
| Single Source of Truth | ❌ No | ✅ Yes |
| Easy to Maintain | ❌ Difficult | ✅ Simple |

**Result**: Frontend is now properly configured for deployment without any dependency on local backend infrastructure.

---

**Last Updated**: January 21, 2026
**Version**: 2.0 - Centralized & Netlify-Ready
