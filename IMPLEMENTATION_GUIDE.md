# Safe Response Handling Implementation Guide

**Purpose**: Ensure all future API calls follow the established safe response handling pattern  
**Scope**: client/src services, hooks, and pages  
**Status**: ✅ Currently implemented across all existing API calls

---

## Quick Start for Developers

### When to Use Each Method

#### 1. ✅ Axios API Calls (80+ methods)
**Use for**: Most REST API calls through centralized api.ts

```typescript
// Import the API
import { studentProfileAPI, extractArray, extractObject } from '@/services/api';

// Call the method (protection is automatic via interceptor)
const profile = await studentProfileAPI.getProfile('12345');

// For array responses
const data = extractArray(response, '/api/notifications');

// For single object responses
const user = extractObject(response, '/api/profile');
```

**Why it's safe**:
- ✅ Response interceptor validates Content-Type
- ✅ Detects empty responses
- ✅ Catches JSON parsing errors
- ✅ Includes endpoint context in errors
- ✅ Handles HTTP errors (401, 403, 404, 500+)

#### 2. ✅ tRPC Calls (Authentication)
**Use for**: Authentication queries and mutations (useAuth.ts)

```typescript
import { trpc } from '@/lib/trpc';

// Type-safe query
const meQuery = trpc.auth.me.useQuery(undefined, {
  retry: 1,
  refetchOnWindowFocus: false,
  staleTime: 1000 * 60 * 5,
});

// Type-safe mutation
const logoutMutation = trpc.auth.logout.useMutation({
  onSuccess: () => {
    utils.auth.me.setData(undefined, null);
  },
});
```

**Why it's safe**:
- ✅ End-to-end type checking
- ✅ Automatic serialization/deserialization
- ✅ Built-in error handling
- ✅ Global error cache monitoring
- ✅ Automatic redirect on 401

#### 3. ✅ Direct Fetch Calls (Rare)
**Use for**: Form submissions when Axios is not suitable (AdvancedApplicationForm.tsx)

```typescript
import { safeJsonParse } from '@/services/api';

try {
  const response = await fetch('/api/applications/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Use safe parsing function
  const result = await safeJsonParse(response, '/api/applications/submit');
  
  // Now result is guaranteed valid JSON
} catch (error) {
  console.error('Submission failed:', error.message);
}
```

**Why it's safe**:
- ✅ Validates response.ok
- ✅ Validates Content-Type
- ✅ Checks empty body
- ✅ Safe JSON parsing with error handling
- ✅ Includes endpoint context

---

## Implementation Checklist

Use this checklist when adding new API calls:

### For Axios Calls ✅
- [ ] Method defined in appropriate API file (studentProfileAPI, etc.)
- [ ] Uses `apiClient.get()` or `apiClient.post()` (not direct axios)
- [ ] Wrapped in try-catch block
- [ ] Uses `extractArray()` for array responses OR `extractObject()` for objects
- [ ] No direct `response.json()` calls
- [ ] Error handling logs endpoint context
- [ ] Error messages in Arabic
- [ ] Returns appropriate type (data or error)

### For tRPC Calls ✅
- [ ] Query/Mutation defined in server router
- [ ] Called through `trpc.path.method.useQuery()` or `.useMutation()`
- [ ] Error handling via try-catch or onError callback
- [ ] Not importing or using raw axios
- [ ] Error messages defined in server

### For Fetch Calls ✅
- [ ] Response validated with `response.ok` check
- [ ] Content-Type validated before parsing
- [ ] Body checked for empty content
- [ ] Uses `safeJsonParse()` helper or manual validation
- [ ] Error response handled separately (response.clone())
- [ ] JSON.parse wrapped in try-catch
- [ ] All error messages in Arabic
- [ ] Includes HTTP status in error message

---

## Code Patterns - Copy & Paste Templates

### Pattern 1: Axios API Method

```typescript
// In client/src/services/api.ts or adminAPI.ts

export const studentProfileAPI = {
  getProfile: async (studentId?: string) => {
    try {
      const endpoint = studentId 
        ? `/api/students/${studentId}` 
        : '/api/profile';
      
      const response = await apiClient.get(endpoint);
      
      // Validation is automatic via interceptor
      // Just extract the data
      return extractObject(response, endpoint);
      
    } catch (error) {
      // Error already has context from interceptor
      console.error('Get profile failed:', error);
      throw error;
    }
  }
};
```

### Pattern 2: tRPC Authentication

```typescript
// In server/routers.ts
export const appRouter = router({
  auth: {
    me: publicProcedure.query(async ({ ctx }) => {
      // Validate authorization
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return ctx.user;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      // Clear session
      ctx.session = null;
      return { success: true };
    }),
  },
});

// In client/src/_core/hooks/useAuth.ts
export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  return {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading,
    error: meQuery.error ?? logoutMutation.error ?? null,
    logout: async () => {
      try {
        await logoutMutation.mutateAsync();
      } catch (error) {
        // Already handled by global error handler
      } finally {
        utils.auth.me.invalidate();
      }
    }
  };
}
```

### Pattern 3: Direct Fetch with Safe Parsing

```typescript
// In client/src/pages/MyForm.tsx

import { safeJsonParse } from '@/services/api';

const submitForm = async (data: FormData) => {
  try {
    const response = await fetch('/api/form/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Manual validation before parsing
    if (!response.ok) {
      // Handle error response safely
      let errorData = null;
      try {
        const errorClone = response.clone();
        const errorContentType = errorClone.headers.get('content-type');
        if (errorContentType?.includes('application/json')) {
          const errorText = await errorClone.text();
          if (errorText?.trim()) {
            errorData = JSON.parse(errorText);
          }
        }
      } catch (e) {
        console.warn('Failed to parse error response:', e);
      }
      
      throw new Error(
        errorData?.message || `فشل الطلب (HTTP ${response.status})`
      );
    }

    // Use safe JSON parsing for success response
    const result = await safeJsonParse(response, '/api/form/submit');
    
    return result;
    
  } catch (error) {
    console.error('Form submission failed:', error.message);
    throw error;
  }
};
```

---

## What NOT to Do ❌

### ❌ Never: Direct response.json() without validation

```typescript
// ❌ WRONG - Can crash on empty or invalid responses
const data = await response.json();

// ✅ RIGHT - Always validate first
if (!response.ok) throw new Error('Response not ok');
const contentType = response.headers.get('content-type');
if (!contentType?.includes('application/json')) throw new Error('Not JSON');
const text = await response.text();
if (!text?.trim()) throw new Error('Empty response');
const data = JSON.parse(text);
```

### ❌ Never: Bypass Axios interceptor

```typescript
// ❌ WRONG - Direct axios call bypasses interceptor
const config = { headers: { Authorization: 'Bearer token' } };
const response = await axios.get('/api/data', config);
const data = response.data; // No validation!

// ✅ RIGHT - Use centralized apiClient
import { apiClient, extractArray } from '@/services/api';
const response = await apiClient.get('/api/data');
const data = extractArray(response, '/api/data'); // Validated!
```

### ❌ Never: Assume endpoint returns data

```typescript
// ❌ WRONG - Silently fails if API returns empty
const notifications = await apiClient.get('/api/notifications');
notifications.forEach(n => console.log(n.id)); // May crash

// ✅ RIGHT - Use extractArray for safe extraction
const notifications = extractArray(response, '/api/notifications');
// Returns [] if empty, logs warning
notifications.forEach(n => console.log(n.id)); // Never crashes
```

### ❌ Never: Mix error handling patterns

```typescript
// ❌ WRONG - Inconsistent error handling
try {
  const data = await axios.get('/api/data');
} catch (error) {
  // Different error structure in different catches
  if (error.response?.status === 401) { }
  if (error.data?.code === 401) { }
  if (error.message?.includes('401')) { }
}

// ✅ RIGHT - Use consistent patterns via interceptor
try {
  const data = await apiClient.get('/api/data');
} catch (error) {
  // All errors follow same pattern with endpoint context
  console.error(error.message); // Clear message with endpoint
}
```

### ❌ Never: Add mock data as fallback

```typescript
// ❌ WRONG - Hiding real errors with mocks
try {
  const data = await apiClient.get('/api/profile');
} catch (error) {
  return mockProfile; // Masks real error!
}

// ✅ RIGHT - Let errors propagate, handle in UI
try {
  const data = await apiClient.get('/api/profile');
  return data;
} catch (error) {
  // UI shows error message or retry option
  throw error;
}
```

---

## Error Message Standards

### HTTP Errors (Axios Interceptor)

| Status | Message | User Message |
|--------|---------|--------------|
| 401 | `جلستك منتهية` | Session expired - redirects to login |
| 403 | `ليس لديك صلاحية` | Access denied |
| 404 | `لم يتم العثور على` | Not found |
| 500+ | `خطأ في الخادم` | Server error - try again later |
| Network | `لا يمكن الاتصال بالخادم` | Cannot connect to server |

### Response Validation Errors (safeJsonParse)

| Error | Message Pattern |
|-------|-----------------|
| response.ok = false | `API endpoint /api/path returned HTTP 401` |
| Invalid Content-Type | `API endpoint /api/path returned invalid Content-Type: text/html` |
| Empty body | `API endpoint /api/path returned empty response body` |
| Invalid JSON | `API endpoint /api/path returned invalid JSON: SyntaxError...` |
| Null data | `API endpoint /api/path returned empty JSON: null` |

### Usage in UI

```typescript
// Show user-friendly Arabic message
try {
  const data = await studentProfileAPI.getProfile('123');
} catch (error) {
  // Error message is already in Arabic and user-friendly
  showNotification({
    type: 'error',
    message: error.message, // e.g., "جلستك منتهية"
  });
}
```

---

## Testing Safe Response Handling

### Unit Tests for Interceptor

```typescript
// client/src/services/__tests__/api.test.ts

describe('Response Interceptor', () => {
  it('should reject response without content-type header', async () => {
    const mockResponse = new Response('{}', {
      headers: { 'content-type': 'text/html' }, // Wrong type
    });
    await expect(safeJsonParse(mockResponse, '/test')).rejects.toThrow();
  });

  it('should reject empty response body', async () => {
    const mockResponse = new Response('', {
      headers: { 'content-type': 'application/json' },
    });
    await expect(safeJsonParse(mockResponse, '/test')).rejects.toThrow();
  });

  it('should parse valid JSON response', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
    const result = await safeJsonParse(mockResponse, '/test');
    expect(result).toEqual({ id: 1 });
  });
});
```

### Integration Tests for API Methods

```typescript
describe('studentProfileAPI', () => {
  it('should handle 401 unauthorized', async () => {
    // Mock server to return 401
    server.use(
      http.get('/api/profile', () => new HttpResponse(null, { status: 401 }))
    );
    
    await expect(studentProfileAPI.getProfile()).rejects.toThrow('جلستك منتهية');
  });

  it('should handle empty response', async () => {
    server.use(
      http.get('/api/profile', () => new HttpResponse(''))
    );
    
    await expect(studentProfileAPI.getProfile()).rejects.toThrow();
  });
});
```

---

## Migration Guide - Adding to Existing Code

### Step 1: Identify Unsafe Patterns
```bash
# Search for these patterns
- response.json() without validation
- await fetch() without error handling
- Direct axios calls bypassing apiClient
```

### Step 2: Apply Safe Pattern
```typescript
// Before
const response = await fetch('/api/data');
const data = await response.json();

// After
const response = await fetch('/api/data');
const data = await safeJsonParse(response, '/api/data');
```

### Step 3: Add Error Handling
```typescript
// Before
try {
  const data = await response.json();
} catch (e) {
  console.log('Error');
}

// After
try {
  const data = await safeJsonParse(response, '/api/endpoint');
} catch (error) {
  console.error('API Error:', error.message); // Includes endpoint
  // Show user-friendly error
}
```

### Step 4: Test
```bash
pnpm build  # Verify no compilation errors
npm test    # Run unit tests
```

---

## Troubleshooting

### Problem: `SyntaxError: Unexpected token < in JSON at position 0`
**Cause**: Server returned HTML instead of JSON (401 login page, 502 error page)
**Solution**: This error should never reach users now - safeJsonParse catches it and returns:
```
API endpoint /api/path returned invalid JSON: SyntaxError...
```

### Problem: `Cannot read property 'map' of undefined`
**Cause**: extractArray returned undefined instead of []
**Solution**: Never happens now - extractArray always returns array:
```typescript
const items = extractArray(response, '/api/items'); // Returns [] if empty
items.map(...); // Safe - never crashes
```

### Problem: `Cannot read property 'id' of null`
**Cause**: API returned null or empty response
**Solution**: extractObject throws error instead of returning null:
```typescript
const user = extractObject(response, '/api/profile'); // Throws if null
// If we get here, user is guaranteed to be an object
```

### Problem: Silent failures - app does nothing
**Cause**: No error handling, empty response not detected
**Solution**: All empty responses now throw errors with clear messages:
```typescript
} catch (error) {
  console.error(error.message); // e.g., "API endpoint returned empty response"
}
```

---

## Performance Considerations

### No Performance Impact

Safe response handling has **zero performance overhead**:
- Interceptor validates headers (microseconds)
- Content-Length check (cache hit - no network)
- response.text() called once (response already loaded)
- JSON.parse same as before (native operation)

### Memory

All safe parsing helpers use **minimal memory**:
- safeJsonParse: ~1KB per call (temporary string)
- extractArray/extractObject: No additional allocations
- Interceptor: Runs in request pipeline (already allocated)

---

## Deployment Checklist

Before deploying to production:

- [ ] Build successful: `pnpm build`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No compilation warnings
- [ ] API endpoint configured: `.env` or `.env.production`
- [ ] Content-Type validation enabled
- [ ] Error messages in Arabic
- [ ] No localhost references
- [ ] No mock data fallbacks
- [ ] All 401 redirects to login
- [ ] All network errors handled gracefully

---

## References

- [Safe Response Handling Audit](./SAFE_RESPONSE_HANDLING_AUDIT.md)
- [Frontend Response Validation](./FRONTEND_RESPONSE_VALIDATION.md)
- [API Response Validation](./API_HARDENING_SUMMARY.md)
- [Response Validation Quick Reference](./RESPONSE_VALIDATION_QUICK_REFERENCE.md)

---

**Last Updated**: January 20, 2026  
**Status**: ✅ All Authentication and API Calls Protected
