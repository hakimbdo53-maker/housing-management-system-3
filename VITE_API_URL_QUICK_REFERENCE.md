# Quick Reference - VITE_API_URL Usage

**Status**: ✅ CONFIGURED & READY  
**API Endpoint**: `http://housingms.runasp.net/api`

---

## 🔧 Environment Variable

### Definition

All environment files now define:
```dotenv
VITE_API_URL=http://housingms.runasp.net/api
```

### Files
- ✅ `client/.env` (production)
- ✅ `client/.env.local` (development)
- ✅ `.env.production` (root production)
- ✅ `netlify.toml` (Netlify build)

---

## 📖 Usage in Code

### Option 1: Direct Access (Recommended)
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
// Returns: "http://housingms.runasp.net/api"
```

### Option 2: Via Config
```typescript
import apiConfig from '@/lib/api';

apiConfig.apiURL        // "http://housingms.runasp.net/api"
apiConfig.trpcURL       // "http://housingms.runasp.net/api/trpc"
```

### Option 3: Via Constants (Backward Compatible)
```typescript
import { API_URL } from '@/const';
// Returns: "http://housingms.runasp.net/api"

import { API_BASE_URL } from '@/const';
// Also works (alias)
```

---

## 📝 API Endpoints

All endpoints are constructed from `VITE_API_URL`:

| Endpoint | Full URL |
|----------|----------|
| Base | `http://housingms.runasp.net/api` |
| tRPC | `http://housingms.runasp.net/api/trpc` |
| Login | `http://housingms.runasp.net/login` |

---

## ✅ Verification

All configured correctly:
- ✅ `VITE_API_URL` defined in all env files
- ✅ Points to: `http://housingms.runasp.net/api`
- ✅ Code uses `import.meta.env.VITE_API_URL`
- ✅ Build succeeds
- ✅ No hardcoded URLs

**Status**: 🟢 PRODUCTION READY

---

**Last Updated**: January 21, 2026
