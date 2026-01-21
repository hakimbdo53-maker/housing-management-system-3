# API Configuration Setup - Complete Guide

## Overview
The React Vite frontend has been configured to connect to an external backend API at `https://housingms.runasp.net` without requiring any local backend server.

## Configuration Architecture

### 1. Centralized API Config (`client/src/lib/api.ts`)
All API endpoints and base URLs are defined in a single location:
```typescript
export const apiConfig = {
  baseURL: 'https://housingms.runasp.net',          // Production URL
  oauthBaseURL: 'https://housingms.runasp.net',     // Auth server
  trpcURL: 'https://housingms.runasp.net/api/trpc', // tRPC endpoint
  loginURL: 'https://housingms.runasp.net/login',   // Login page
};
```

### 2. Environment Variables

#### Development (`.env.local`)
```dotenv
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
NODE_ENV=development
```

#### Production (`.env`)
```dotenv
VITE_API_BASE_URL=https://housingms.runasp.net
VITE_OAUTH_SERVER_URL=https://housingms.runasp.net
```

### 3. Netlify Configuration (`netlify.toml`)
```toml
[build]
base = "housing-management-login"
command = "npm run build"
publish = "dist"

[build.environment]
NODE_ENV = "production"
VITE_API_BASE_URL = "https://housingms.runasp.net"
VITE_OAUTH_SERVER_URL = "https://housingms.runasp.net"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

## File Updates Made

### Updated Files:
1. **`client/src/lib/api.ts`** (NEW)
   - Centralized API configuration
   - Environment variable handling with fallbacks
   - Validation on module load

2. **`client/src/const.ts`**
   - Updated to use new centralized config
   - Maintains backward compatibility

3. **`client/src/main.tsx`**
   - Replaced hardcoded `"http://housingms.runasp.net/api/trpc"`
   - Now uses `apiConfig.trpcURL` from centralized config
   - Updated login URL redirect to use `apiConfig.loginURL`

4. **`client/.env`** (Production)
   - HTTPS URLs for production environment
   - Works with Netlify deployment

5. **`client/.env.local`** (Development)
   - HTTP URLs for local testing
   - Comments explaining frontend-only setup

6. **`.env.production`** (Root)
   - Netlify build environment variables
   - HTTPS URLs for production

7. **`netlify.toml`**
   - Added build environment variables
   - Added SPA routing redirect rules
   - Properly configured publish directory

## How It Works

### Environment Variables Flow:
```
Netlify/Build Process
    ↓
Reads build environment variables from netlify.toml
    ↓
Injects into VITE_ prefixed variables
    ↓
At build time: import.meta.env.VITE_API_BASE_URL resolves to value
    ↓
Frontend uses correct API URL (https://housingms.runasp.net in production)
```

### API Call Flow:
```
App Component
    ↓
main.tsx (tRPC client initialization)
    ↓
apiConfig.trpcURL = "https://housingms.runasp.net/api/trpc"
    ↓
httpBatchLink sends requests to backend
    ↓
Response handled by tRPC + React Query
```

## Local Development Testing

### Start Dev Server:
```bash
npm run dev
# Server runs on http://localhost:5173 or 5174
# Connects to http://housingms.runasp.net API
```

### Build for Production:
```bash
npm run build
# Output: dist/ folder
# Frontend assets ready for Netlify deployment
```

### Preview Production Build:
```bash
npm run preview
# Test the production build locally
```

## Netlify Deployment

### What Happens During Deploy:

1. **Netlify clones the repo**
2. **Changes to `housing-management-login` directory** (base setting)
3. **Installs dependencies**: `npm install`
4. **Builds project**: `npm run build`
   - Reads environment variables from `netlify.toml`
   - Injects `VITE_API_BASE_URL=https://housingms.runasp.net`
   - Build outputs to `dist/` folder
5. **Publishes** `dist/` folder to Netlify CDN
6. **Routes all requests** to `/index.html` for SPA routing

### Environment Variables Precedence (Netlify):
1. Netlify UI settings (highest priority)
2. `netlify.toml` [build.environment] section
3. `.env` file (lowest priority, not recommended for secrets)

## Frontend-Only Architecture Benefits

✅ **No local backend needed** - All development connects to external API
✅ **Scalable** - Backend can be updated without frontend changes
✅ **CORS handled** - Backend has proper CORS configuration
✅ **Production-ready** - Same configuration works on localhost, Netlify, and any host
✅ **Environment-specific** - Development uses HTTP, production uses HTTPS
✅ **Centralized** - All API configuration in one file (`client/src/lib/api.ts`)

## API Endpoints Available

| Endpoint | Base URL | Full URL |
|----------|----------|----------|
| tRPC API | `/api/trpc` | `https://housingms.runasp.net/api/trpc` |
| Login | `/login` | `https://housingms.runasp.net/login` |
| Signup | `/signup` | `https://housingms.runasp.net/signup` |
| Logout | `/logout` | `https://housingms.runasp.net/logout` |
| Swagger Docs | `/swagger/index.html` | `https://housingms.runasp.net/swagger/index.html` |

## Troubleshooting

### Issue: Blank page on localhost
**Solution**: Check that backend is accessible at configured API URL
- Test in browser: `https://housingms.runasp.net/swagger/index.html`
- Check browser console (F12) for CORS errors

### Issue: Environment variables not updating
**Solution**: Restart dev server after changing `.env.local`
```bash
# Kill current dev server
# Ctrl + C

# Restart
npm run dev
```

### Issue: Different API in production vs development
**Solution**: Netlify automatically uses `netlify.toml` environment variables
- Local dev: uses `client/.env.local` (HTTP)
- Netlify production: uses `netlify.toml` (HTTPS)

## Next Steps

1. **Deploy to Netlify**
   - Connect GitHub repo to Netlify
   - Netlify will auto-detect build configuration from `netlify.toml`
   - Set domain and deploy

2. **Monitor API Calls**
   - Open DevTools (F12) → Network tab
   - Verify requests go to `https://housingms.runasp.net`
   - Check Response headers for CORS

3. **Update API URLs if needed**
   - Edit `client/src/lib/api.ts` for development defaults
   - Edit `netlify.toml` for production URLs
   - Edit `client/.env.local` for local overrides

---

**Last Updated**: January 21, 2026
**Configuration Version**: 2.0 (Centralized + Netlify Ready)
