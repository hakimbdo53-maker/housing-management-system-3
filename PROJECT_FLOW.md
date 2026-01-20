# 🏗️ PROJECT ARCHITECTURE & FLOW GUIDE

## 📌 Quick Navigation

- **🎯 Entry Point**: [client/src/main.tsx](#entry-point)
- **🔄 App Flow**: [Application Initialization](#application-flow)  
- **🌐 Frontend Stack**: [Technologies](#frontend-stack)
- **⚙️ Backend Stack**: [Server Architecture](#backend-stack)
- **🔌 API Integration**: [API Layer](#api-integration)
- **💾 State Management**: [State Handling](#state-management)
- **📂 File Structure**: [Directory Layout](#directory-layout)

---

## 🎯 Entry Point

### **client/src/main.tsx** - Application Bootstrap
```typescript
// 1. Initialize tRPC client
// 2. Set login URL
// 3. Render App component with providers
// 4. Mount to DOM element
```

**Flow**:
```
main.tsx
  ↓
App.tsx (with providers)
  ├── ErrorBoundary
  ├── AuthProvider (state)
  ├── ThemeProvider (theme)
  ├── TooltipProvider (UI)
  └── Router (page routing)
```

---

## 🔄 Application Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          main.tsx: Initialize App                            │
│  - Set up tRPC client                                        │
│  - Initialize providers                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│        App.tsx: Apply Providers & Router                     │
│  - ErrorBoundary (catch errors)                              │
│  - AuthProvider (user state)                                 │
│  - ThemeProvider (dark/light mode)                           │
│  - TooltipProvider (tooltips)                                │
│  - Toaster (notifications)                                   │
│  - Router (page routing)                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Router (Wouter): Route Matching                      │
│  - Check if user is authenticated                            │
│  - Route to Login/Signup if not                              │
│  - Route to protected pages if yes                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│      Authentication Check (useAuth)                          │
│  - Query auth/me endpoint                                    │
│  - Cache for 5 minutes                                       │
│  - Update AuthContext                                        │
│  - Redirect to login if unauthorized                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Page Component (e.g., Dashboard)                     │
│  - Access auth state via useAuthContext()                    │
│  - Access theme via useContext(ThemeContext)                 │
│  - Make API calls via tRPC                                   │
│  - Manage local state with useState()                        │
│  - Handle UI interactions                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           API Call (via tRPC)                                │
│  1. Client: trpc.student.profile.useQuery()                 │
│  2. Network: POST /api/trpc/student.profile                 │
│  3. Server: routers.ts student.profile handler              │
│  4. Database: db.getStudentProfile(userId)                  │
│  5. Response: Data back to client                            │
│  6. Cache: Stored for reuse                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Update UI & Show Results                             │
│  - Loading state removed                                     │
│  - Data displayed                                            │
│  - Errors shown if any                                       │
│  - User can interact                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Frontend Stack

### Technologies Used
- **Framework**: React 19.2.1 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.9
- **Router**: Wouter 3.3.5 (lightweight SPA router)
- **HTTP Client**: tRPC for type-safe API calls
- **State Management**: React Context + React Query
- **Forms**: react-hook-form + Zod validation
- **UI Components**: shadcn/ui + Tailwind CSS 4.1.14
- **Notifications**: sonner (modern toasts)
- **Styling**: Tailwind CSS with custom utilities
- **Package Manager**: pnpm 10.4.1

### Project Structure Tiers

**Tier 1: Entry Point**
- `main.tsx` - Bootstrap
- `App.tsx` - Root component with providers
- `index.css` - Global styles
- `const.ts` - Constants

**Tier 2: Providers & Contexts**
- `ErrorBoundary.tsx` - Error catching
- `AuthProvider.tsx` + `AuthContext.tsx` - Auth state
- `ThemeContext.tsx` - Theme state
- `ToasterProvider.tsx` - Toast notifications

**Tier 3: Layout Components**
- `Header.tsx` - Top navigation
- `Sidebar.tsx` - Side navigation
- `MainLayout.tsx` - Container
- `Footer.tsx` - Footer

**Tier 4: Page Components**
- Located in `pages/` folder
- Organized by feature (auth, applications, student, info)
- Use MainLayout or AuthLayout

**Tier 5: Reusable Components**
- `FormInput.tsx`, `FormSelect.tsx` - Form fields
- `AlertBox.tsx` - Alerts
- `LoadingSpinner.tsx` - Loading indicator
- UI components from `ui/` folder

---

## ⚙️ Backend Stack

### Technologies Used
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Layer**: tRPC (type-safe RPC)
- **Database**: SQLite via better-sqlite3
- **ORM**: Drizzle ORM (schema-based)
- **Validation**: Zod (schema validation)
- **File Upload**: Custom middleware in `server/middleware/fileUpload.ts`

### Server Structure

**Root: server/_core/**
- `index.ts` - Server initialization
- `trpc.ts` - tRPC configuration
- `context.ts` - Request context
- `cookies.ts` - Cookie management
- `database.ts` - Database setup
- `env.ts` - Environment variables
- `oauth.ts` - OAuth integration
- `llm.ts` - LLM integration (AI)
- `notification.ts` - Notifications
- `voiceTranscription.ts` - Voice to text
- `systemRouter.ts` - System health checks
- `vite.ts` - Vite integration for development
- `dataApi.ts` - External data API calls
- `map.ts` - Maps integration
- `imageGeneration.ts` - Image generation
- `sdk.ts` - SDK utilities

**Root: server/**
- `routers.ts` - Main API endpoints (tRPC routes)
- `db.ts` - Database operations
- `db.ts.bak` - Backup (commented, can delete)
- `storage.ts` - Storage helper
- `validationSchemas.ts` - Zod validation schemas
- `validationMiddleware.ts` - Request validation
- `auth.logout.test.ts` - Auth tests
- `middleware/` - Custom middleware
  - `fileUpload.ts` - File upload validation & security

---

## 🔌 API Integration

### Frontend to Backend Flow

**Step 1: Make API Call (Frontend)**
```typescript
// File: client/src/pages/Dashboard.tsx
import { trpc } from '@/lib/trpc';

const { data, isLoading, error } = trpc.student.profile.useQuery();
```

**Step 2: tRPC Route Definition (Backend)**
```typescript
// File: server/routers.ts
export const appRouter = router({
  student: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getStudentProfile(ctx.user.id);
    }),
  }),
});
```

**Step 3: Network Request**
```
POST /api/trpc/student.profile
Content-Type: application/json
Authorization: Bearer {token}

{
  "json": { },
  "meta": { values: [] }
}
```

**Step 4: Database Query (Backend)**
```typescript
// File: server/db.ts
export async function getStudentProfile(userId: number) {
  const db = getDatabase();
  const data = db.getData();
  return data.users.find(u => u.id === userId);
}
```

**Step 5: Response (Backend)**
```json
{
  "result": {
    "data": {
      "id": 1,
      "name": "Ahmed",
      "email": "ahmed@example.com",
      ...
    }
  }
}
```

**Step 6: Client Update (Frontend)**
```typescript
// Component re-renders with new data
// UI displays student information
// Automatic caching for next request
```

---

## 💾 State Management

### Three Levels of State

**Level 1: App-Wide State (Context)**
- **AuthContext**: User authentication, permissions
- **ThemeContext**: Light/dark theme
- **Usage**: Access anywhere via `useAuthContext()` or `useContext(ThemeContext)`

**Level 2: Page-Level State (useState)**
- **Purpose**: Single page state
- **Example**: Form inputs, filter selections
- **Duration**: Lives for page lifecycle

**Level 3: Server State (React Query via tRPC)**
- **Purpose**: API data caching
- **Example**: User profile, applications, fees
- **Duration**: 5-minute cache, auto-refetch on focus
- **Benefits**: Automatic retry, background sync

### State Flow Example

```
┌──────────────────┐
│  Auth Endpoint   │
│ (server/routers) │
└────────┬─────────┘
         ↓
   ┌─────────────────────┐
   │  React Query Cache  │
   │  (5-min stale time) │
   └────────┬────────────┘
            ↓
┌────────────────────────┐
│   AuthContext          │
│  - user               │
│  - isAuthenticated    │
│  - userRole           │
│  - loading            │
└────────┬───────────────┘
         ↓
┌────────────────────────────────────────┐
│  useAuthContext() in Components        │
│  - Header.tsx (display user name)      │
│  - Sidebar.tsx (show role menu)        │
│  - ProtectedRoute (check access)       │
└────────────────────────────────────────┘
```

---

## 📂 Directory Layout

### Frontend: `client/src/`

```
client/src/
│
├── app/                                # Application configuration
│   ├── App.tsx                        # Root component
│   ├── const.ts                       # Constants
│   ├── index.css                      # Global styles
│   ├── STATE_MANAGEMENT_GUIDE.ts     # Documentation
│   └── main.tsx                       # Entry point (stays here)
│
├── _core/                             # Core utilities
│   ├── hooks/
│   │   └── useAuth.ts                 # Authentication hook
│   ├── context.ts
│   ├── dataApi.ts
│   └── ...other core files
│
├── components/                        # UI Components
│   ├── layout/
│   │   ├── Header.tsx                 # Top navigation
│   │   ├── Sidebar.tsx               # Side navigation
│   │   ├── MainLayout.tsx            # Main container
│   │   ├── DashboardLayout.tsx       # Dashboard wrapper
│   │   ├── AuthLayout.tsx            # Auth pages wrapper
│   │   └── Footer.tsx                # Footer
│   │
│   ├── forms/                         # Form inputs
│   │   ├── FormInput.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormTextarea.tsx
│   │   └── ValidatedInput.tsx
│   │
│   ├── ui/                            # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tooltip.tsx
│   │   └── ...others
│   │
│   └── shared/                        # Shared components
│       ├── AlertBox.tsx
│       ├── LoadingSpinner.tsx
│       ├── ToasterProvider.tsx
│       ├── ErrorBoundary.tsx
│       ├── PaymentReceiptUpload.tsx
│       ├── AIChatBox.tsx
│       └── DashboardLayoutSkeleton.tsx
│
├── contexts/                          # State providers
│   ├── AuthContext.tsx               # Auth state
│   ├── AuthProvider.tsx              # Auth provider
│   └── ThemeContext.tsx              # Theme state
│
├── hooks/                             # Custom hooks
│   ├── useAuth.ts                    # Auth integration
│   ├── useComposition.ts             # Composition utilities
│   ├── useFileUpload.ts              # File upload
│   ├── useMobile.tsx                 # Mobile detection
│   ├── usePersistFn.ts               # Persist function
│   ├── useToast.ts                   # Notifications
│   └── useValidation.ts              # Form validation
│
├── lib/                               # Library config
│   └── trpc.ts                       # tRPC setup
│
├── pages/                             # Page components
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   │
│   ├── applications/
│   │   ├── NewApplication.tsx
│   │   ├── MyApplications.tsx
│   │   ├── ApplicationForm.tsx
│   │   ├── NewStudentApplicationForm.tsx
│   │   ├── OldStudentApplicationForm.tsx
│   │   └── AdvancedApplicationForm.tsx
│   │
│   ├── student/
│   │   ├── Home.tsx (redirects to Dashboard)
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── EditProfile.tsx
│   │   ├── Inquiry.tsx
│   │   ├── Fees.tsx
│   │   ├── Complaints.tsx
│   │   ├── Notifications.tsx
│   │   └── RoomAssignments.tsx
│   │
│   ├── info/
│   │   ├── Dates.tsx
│   │   └── Instructions.tsx
│   │
│   └── NotFound.tsx
│
├── services/                          # API Integration
│   ├── api.ts                        # Student & public APIs
│   └── adminAPI.ts                   # Admin-only APIs
│
└── shared/                            # Shared utilities
    └── (future: shared utilities)
```

### Backend: `server/`

```
server/
│
├── _core/                             # Core server logic
│   ├── index.ts                       # Server initialization
│   ├── trpc.ts                        # tRPC setup
│   ├── context.ts                     # Request context
│   ├── database.ts                    # Database init
│   ├── cookies.ts                     # Cookie handling
│   ├── env.ts                         # Environment config
│   ├── oauth.ts                       # OAuth logic
│   ├── llm.ts                         # AI/LLM integration
│   ├── notification.ts                # Notification system
│   ├── voiceTranscription.ts         # Voice-to-text
│   ├── systemRouter.ts                # Health checks
│   ├── vite.ts                        # Vite dev server
│   ├── dataApi.ts                     # External API calls
│   ├── map.ts                         # Maps integration
│   ├── imageGeneration.ts            # Image generation
│   ├── sdk.ts                         # SDK utilities
│   └── types/                         # TypeScript types
│
├── middleware/                        # Custom middleware
│   └── fileUpload.ts                 # File upload validation
│
├── routers.ts                         # Main API routes
├── db.ts                              # Database operations
├── db.ts.bak                          # Backup (delete)
├── storage.ts                         # Storage utilities
├── validationSchemas.ts              # Zod schemas
├── validationMiddleware.ts            # Validation middleware
└── auth.logout.test.ts               # Auth tests
```

### Root: `drizzle/`

```
drizzle/
├── schema.ts                          # Database schema definition
├── relations.ts                       # Table relationships
├── migrations/                        # Schema migrations
└── meta/                              # Migration metadata
```

---

## 🔑 Key Concepts

### Routing (Wouter)
- **Purpose**: Client-side page routing
- **How it works**: URL changes trigger component renders
- **Files**: `App.tsx` defines all routes
- **Protected routes**: Check `useAuth()` before rendering

### Authentication (tRPC + Context)
- **Purpose**: Manage user login state
- **Flow**: Browser cookie → tRPC query → React Query cache → AuthContext
- **Duration**: 5-minute cache + persistent session cookie
- **Logout**: Clears cookie and invalidates cache

### File Uploads (Server-side Security)
- **Purpose**: Securely handle user file uploads
- **Location**: `server/middleware/fileUpload.ts`
- **Validation**: Type (JPEG/PNG/PDF), Size (5MB max), Filename (UUID rename)
- **Storage**: Private directory outside web root
- **Frontend**: `PaymentReceiptUpload.tsx` component

### Error Handling
- **Frontend**: ErrorBoundary wraps entire app
- **Backend**: tRPC error codes (UNAUTHORIZED, BAD_REQUEST, etc.)
- **User feedback**: Toast notifications via sonner
- **Logging**: Console logs for debugging

### Validation
- **Frontend**: Zod schemas via react-hook-form
- **Backend**: Zod schemas in `validationSchemas.ts`
- **Two-layer validation**: Client + Server for security

---

## 🚀 Common Development Tasks

### Add a New Page
1. Create file in `pages/{feature}/NewPage.tsx`
2. Add route in `App.tsx`
3. Wrap with `MainLayout` if authenticated
4. Use hooks for API calls

### Add a New API Endpoint
1. Define Zod schema in `validationSchemas.ts`
2. Add router to `routers.ts`
3. Implement handler with database logic
4. Call from frontend via tRPC

### Add a Shared Component
1. Create in `components/shared/`
2. Export from component file
3. Import in needed pages
4. Reuse across app

### Handle Global State
1. Create Context in `contexts/`
2. Create Provider wrapper component
3. Wrap App.tsx with provider
4. Access via `useContext()` in components

---

## 📊 Performance Optimizations

- **React Query Caching**: 5-minute stale time prevents unnecessary requests
- **Code Splitting**: Vite automatically chunks code
- **Lazy Loading**: Pages can be code-split
- **Memoization**: useMemo in providers prevents re-renders
- **Image Optimization**: Tailwind CSS compression

---

## 🔒 Security Measures

- **Authentication**: tRPC with protected procedures
- **Authorization**: Role-based access control
- **File Validation**: Server-side type/size checking
- **Input Validation**: Zod schemas everywhere
- **CORS**: Configured in backend
- **HTTPS**: Enforced in production

---

## 📖 Documentation Files

- **CLEANUP_PLAN.md** - Project reorganization details
- **STATE_MANAGEMENT_GUIDE.ts** - State management patterns
- **PROJECT_FLOW.md** - This file (architecture overview)
- **API_HARDENING_METHODS.md** - Security details
- **DEPLOYMENT_GUIDE.md** - Deployment instructions

---

## 🎯 Entry Points for Common Scenarios

**I need to...**
- **Modify user authentication**: Edit `_core/hooks/useAuth.ts`
- **Add new API endpoint**: Edit `server/routers.ts` + `validationSchemas.ts`
- **Add new page**: Create in `pages/{feature}/`
- **Change global theme**: Edit `contexts/ThemeContext.tsx`
- **Handle file uploads**: Use `PaymentReceiptUpload.tsx` component
- **Add form validation**: Edit `validationSchemas.ts`
- **Debug state**: Check `AuthContext` or React Query devtools
- **Style page**: Use Tailwind classes or edit `index.css`

---

**Last Updated**: January 20, 2026  
**Maintainer**: Project Documentation  
**Status**: Current with latest architecture
