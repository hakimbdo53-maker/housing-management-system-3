# Quick Reference - Frontend API Configuration

## 🚀 Quick Start

```bash
# Development
npm run dev
# Access: http://localhost:5173 or 5174
# API: http://housingms.runasp.net

# Production Build
npm run build
# Output: dist/
# API: https://housingms.runasp.net (via netlify.toml)

# Preview Production Build
npm run preview
```

---

## 📁 Key Files

| File | Purpose | Edit When |
|------|---------|-----------|
| `client/src/lib/api.ts` | Central API config | Adding/updating endpoints |
| `client/.env.local` | Dev environment | Testing with different API |
| `client/.env` | Production fallback | Changing production API (use netlify.toml instead) |
| `netlify.toml` | Netlify deployment | Deploying to different API |
| `client/src/const.ts` | Re-exports config | Usually don't touch |
| `client/src/main.tsx` | App entry point | Uses `apiConfig.trpcURL` |

---

## 🌐 API Endpoints

```typescript
// All available endpoints
apiConfig.baseURL          // "https://housingms.runasp.net"
apiConfig.trpcURL          // "https://housingms.runasp.net/api/trpc"
apiConfig.loginURL         // "https://housingms.runasp.net/login"
apiConfig.signupURL        // "https://housingms.runasp.net/signup"
apiConfig.logoutURL        // "https://housingms.runasp.net/logout"
```

---

## 🔧 Common Tasks

### Change API URL Globally
```typescript
// File: client/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://new-api.com';
```

### Change API URL for Development Only
```dotenv
# File: client/.env.local
VITE_API_BASE_URL=http://your-local-api:3000
```

### Change API URL for Production (Netlify)
```toml
# File: netlify.toml
[build.environment]
VITE_API_BASE_URL = "https://your-production-api.com"
```

### Add New API Endpoint
```typescript
// File: client/src/lib/api.ts
export const apiConfig = {
  // ... existing endpoints
  myNewEndpoint: `${API_BASE_URL}/my-endpoint`,
};

// Use anywhere
import apiConfig from '@/lib/api';
const url = apiConfig.myNewEndpoint;
```

---

## 🌍 Environment Variables

### Development (client/.env.local)
```dotenv
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
NODE_ENV=development
```

### Production (netlify.toml)
```toml
[build.environment]
NODE_ENV = "production"
VITE_API_BASE_URL = "https://housingms.runasp.net"
VITE_OAUTH_SERVER_URL = "https://housingms.runasp.net"
```

---

## 🚢 Netlify Deployment

### What Netlify Does Automatically

1. Reads `netlify.toml` from repository root
2. Changes to `housing-management-login` directory
3. Runs `npm run build`
   - Injects environment variables from `netlify.toml`
   - Replaces `VITE_API_BASE_URL` with HTTPS version
4. Takes contents of `dist/` folder
5. Publishes to CDN
6. Routes all requests to `/index.html` for SPA

### Netlify Configuration

```toml
[build]
base = "housing-management-login"      # Where build command runs
command = "npm run build"              # Build command
publish = "dist"                        # Publish this folder

[build.environment]
VITE_API_BASE_URL = "https://..."      # Production API URL
VITE_OAUTH_SERVER_URL = "https://..."  # Production OAuth URL

[[redirects]]
from = "/*"                             # All routes
to = "/index.html"                      # Route to index.html
status = 200                            # Show as 200 OK
```

---

## ✅ Verification Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Frontend loads at http://localhost:5173/5174
- [ ] API calls go to correct endpoint (check Network tab)
- [ ] No console errors in DevTools
- [ ] No hardcoded URLs in source code
- [ ] Environment variables match `client/.env.local`
- [ ] `netlify.toml` has correct build settings

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page | Check API is accessible, look at Console errors |
| Wrong API URL | Restart dev server after changing `.env.local` |
| Build fails | Check `npm run build` output, look for missing imports |
| Environment variables wrong | Verify `VITE_API_BASE_URL` is set in correct file |
| Different URL in prod | This is intentional (HTTP dev, HTTPS prod) |

---

## 📚 Documentation

- **API_CONFIGURATION_GUIDE.md** - Full technical documentation
- **MIGRATION_GUIDE.md** - Before/after comparison
- **NETLIFY_CONFIGURATION_STATUS.md** - Deployment checklist
- **SETUP_COMPLETE_API_CONFIG.md** - Complete summary

---

## 🎯 Next Steps

1. ✅ Test locally: `npm run dev`
2. ✅ Build: `npm run build`
3. ✅ Deploy: Push to GitHub
4. ✅ Connect to Netlify
5. ✅ Monitor: Check DevTools for API calls

---

**Last Updated**: January 21, 2026
