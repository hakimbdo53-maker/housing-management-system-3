# Housing Management System - Production Setup

## Architecture Overview

This project is configured for production deployment as a **Frontend-only application on Netlify**.

- **Frontend**: React application deployed on Netlify
- **Backend API**: http://housingms.runasp.net (External API)
- **Authentication**: Cookie-based (via external API)

## Environment Configuration

### Development
Use `.env.local` for local development:
```env
VITE_API_BASE_URL=http://localhost:3002
VITE_OAUTH_SERVER_URL=http://localhost:3002
```

### Production (Netlify)
Use `.env.production`:
```env
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
```

## Important Decisions

### File-Based Database Disabled
The file-based database (`app.json`, `database.ts`) has been disabled for production. All data operations must go through the external API at `http://housingms.runasp.net/swagger/index.html`.

### Backend Not Deployed
The tRPC backend (`server/` folder) is **not** included in the Netlify deployment. The `build` command only builds the frontend.

### No localStorage for Sensitive Data
- Token management now relies on HTTP-only cookies (handled by the external API)
- User data is cached through tRPC's query cache
- No sensitive data is stored in localStorage

## Building & Deployment

### Build for Production
```bash
npm run build
# or
pnpm build
```

This builds only the frontend to the `dist/public` directory.

### Local Development
```bash
npm run dev
```

This starts the full-stack development server (frontend + tRPC backend).

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist/public`
4. Add environment variables (already in `.env.production`)
5. Deploy!

The `netlify.toml` file automatically:
- Sets up environment variables
- Redirects API calls to the external API
- Handles SPA routing

## API Integration

All API calls use the external API at `http://housingms.runasp.net`:

### Student APIs
- Location: `client/src/services/api.ts`
- Uses Axios with automatic cookie handling

### Admin APIs
- Location: `client/src/services/adminAPI.ts`
- Uses Axios with automatic cookie handling

### API Documentation
Visit: http://housingms.runasp.net/swagger/index.html

## No Localhost References

The frontend has been cleaned of all `localhost` references:
- ✅ `const.ts` throws error if env variables are not set
- ✅ `vite.config.ts` doesn't allow localhost in production
- ✅ All hardcoded URLs removed

## Security Notes

1. **CORS**: Handled by the backend API
2. **Cookies**: HTTP-only cookies managed by the external API
3. **Token Storage**: No tokens stored in localStorage
4. **Environment Variables**: Never expose sensitive data in frontend code

## File Structure

```
project/
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── services/   # API clients
│   │   ├── pages/      # Page components
│   │   └── const.ts    # Constants (env vars)
│   ├── .env            # Default (production)
│   └── .env.local      # Development (git-ignored)
├── server/             # Backend (disabled in production)
├── netlify.toml        # Netlify configuration
├── .env.production     # Production env vars
└── .gitignore         # Excludes app.json, db.ts.bak, etc.
```

## Troubleshooting

### Build fails with "VITE_API_BASE_URL is not set"
- Ensure `.env.production` exists with correct API URL
- Or set environment variables in Netlify dashboard

### API calls fail with 401
- Check that cookies are being sent (`withCredentials: true`)
- Verify the API endpoint in `.env.production`

### Pages not found after deployment
- The `netlify.toml` handles SPA routing automatically
- Ensure redirect rules are correct if you modify routes

## Next Steps

1. Test the frontend with the real API
2. Verify all endpoints match the API documentation
3. Set up Netlify deployment
4. Monitor logs for any issues
