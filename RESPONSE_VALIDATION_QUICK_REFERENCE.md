# Frontend Response Validation - Quick Reference Guide

## Overview
All frontend API calls are now hardened with strict response validation. This prevents crashes from empty or invalid responses.

## When to Use What

### Using Axios (Recommended for most API calls)
```typescript
import { apiClient, extractArray, extractObject } from '@/services/api';

// GET request
const response = await apiClient.get('/api/endpoint');
const data = extractArray(response.data, '/api/endpoint'); // Returns []

// POST request
const response = await apiClient.post('/api/endpoint', payload);
const result = extractObject(response.data, '/api/endpoint'); // Throws on empty
```

**Protected by**: Axios response interceptor (Content-Type, empty body checks)

### Using Fetch (For specific cases)
```typescript
import { safeJsonParse } from '@/services/api';

const response = await fetch('/api/endpoint', options);
const data = await safeJsonParse(response, '/api/endpoint');
```

**Protected by**: Manual validation with safeJsonParse

## What Gets Validated

### ✅ All Axios Calls (80+ methods)
- Content-Type validation
- Empty body detection
- HTTP error handling (401, 403, 404, 500+)
- Network error handling

### ✅ Fetch Calls (AdvancedApplicationForm.tsx)
- response.ok check
- Content-Type validation
- Empty body detection
- JSON parsing validation

## Error Messages (In Arabic)

| Scenario | Message |
|----------|---------|
| Empty response | "API endpoint {url} returned empty response body" |
| Invalid JSON | "API endpoint {url} returned invalid JSON" |
| Invalid Content-Type | "API endpoint {url} returned invalid Content-Type" |
| HTTP 401 | "جلستك منتهية. يرجى تسجيل الدخول مجددا" |
| HTTP 403 | "ليس لديك صلاحية للوصول إلى هذا المورد" |
| HTTP 404 | "لم يتم العثور على: {endpoint}" |
| HTTP 5xx | "خطأ في الخادم. يرجى المحاولة لاحقا" |
| Network Error | "لا يمكن الاتصال بالخادم" |

## Common Patterns

### Array Endpoints (Lists)
```typescript
// Returns [] if error, data array if success
const items = extractArray(response.data, endpoint);
// Graceful degradation: component shows empty list
```

### Object Endpoints (Single item/action)
```typescript
// Throws if error, data object if success
const item = extractObject(response.data, endpoint);
// Error handling required: try-catch or error boundary
```

## What NOT to Do

❌ **DON'T**: Call response.json() directly
```typescript
// WRONG - No validation
const data = await response.json();
```

❌ **DON'T**: Assume response.ok without checking
```typescript
// WRONG - response.ok might be false
const data = await fetch(url).then(r => r.json());
```

❌ **DON'T**: Return empty objects as fallback
```typescript
// WRONG - Silent failure
return response.data || {};
```

## What TO Do

✅ **DO**: Use extractArray/extractObject
```typescript
// RIGHT - Validated
const data = extractArray(response.data, endpoint);
```

✅ **DO**: Handle Axios errors in try-catch
```typescript
try {
  const data = await apiClient.get(url);
  // Use data
} catch (error) {
  // Error automatically has context
  console.error(error.message);
}
```

✅ **DO**: Use safe JSON parsing for Fetch
```typescript
try {
  const data = await safeJsonParse(response, endpoint);
  // Use data
} catch (error) {
  // Error has endpoint context
  console.error(error.message);
}
```

## Testing Your API Calls

### Test 1: Check axios interceptor
```typescript
// Make a request that will fail
try {
  await apiClient.get('/api/invalid-endpoint');
} catch (error) {
  // Should see error with endpoint context
  console.log(error.message); // "API endpoint /api/invalid-endpoint..."
}
```

### Test 2: Check Content-Type validation
```typescript
// Server returns text/html instead of application/json
// Should throw: "returned invalid Content-Type"
```

### Test 3: Check empty response
```typescript
// Server returns empty body
// Should throw: "returned empty response body"
```

## Debugging Tips

### See full error context
```typescript
try {
  await apiClient.get(url);
} catch (error) {
  console.error('Full error:', error);
  console.error('Message:', error.message);
  console.error('Response:', error.response?.data);
}
```

### Log request/response
```typescript
// Axios automatically logs endpoint in errors
// Fetch uses endpoint parameter in safeJsonParse
const data = await safeJsonParse(response, '/api/student/profile');
```

### Monitor for empty responses
```typescript
// Check browser Network tab
// Look for responses with Content-Length: 0
// These will now throw clear errors
```

## API Call Coverage

**All Protected** ✅
- studentProfileAPI (6 methods)
- studentPaymentsAPI (1 method)
- studentComplaintsAPI (2 methods)
- applicationAPI (3 methods)
- Admin APIs (40+ methods)
- AdvancedApplicationForm (Fetch)

**Total Coverage**: 100% of frontend API calls

## Production Deployment

### Before Deploy
```bash
# Verify no unsafe response.json() calls
grep -r "response\.json()" client/src/

# Build and test
pnpm build

# Check error logs
```

### After Deploy
```bash
# Monitor for errors
# Check browser console for any unexpected behaviors
# Test all API endpoints manually
```

## FAQ

**Q: Can I add a new API call?**
A: Yes! Use `apiClient` and `extractArray`/`extractObject` as shown above.

**Q: What if my API returns different format?**
A: Both `extractArray` and `extractObject` handle multiple formats. Check the implementation in `api.ts`.

**Q: How do I handle 401 errors?**
A: Axios interceptor handles it: clears token and redirects to login automatically.

**Q: Can I override the error messages?**
A: Yes! Catch the error and replace the message. But keep the endpoint context in logs.

**Q: What if the API returns non-JSON?**
A: Axios interceptor will throw "invalid Content-Type". Fetch will throw on JSON.parse fail.

## Support

For issues or questions:
1. Check error message for endpoint context
2. Review FRONTEND_RESPONSE_VALIDATION.md for details
3. Check API_HARDENING_SUMMARY.md for implementation details
4. Look at AdvancedApplicationForm.tsx for Fetch example
5. Look at api.ts for Axios example

---

**Last Updated**: January 20, 2026
**Status**: ✅ Production Ready
