# 🏠 Housing Management System - Frontend Only

**Status**: ✅ Frontend-Only Mode  
**API**: `http://housingms.runasp.net`  
**Date**: January 20, 2026

---

## 📋 Overview

تم تحويل المشروع إلى **Frontend-Only Development**:
- ❌ **لا خادم محلي** (No Local Backend)
- ❌ **لا قاعدة بيانات محلية** (No Local Database)
- ✅ **API خارجي فقط** (External API Only)
- ✅ **Vite للتطوير** (Vite Dev Server)

---

## 🚀 البدء السريع

### 1. تشغيل الفرونت

```bash
# للاستخدام المحلي فقط
npm run dev

# للاستخدام على الشبكة المحلية
npm run dev:host
```

### 2. الوصول للتطبيق

- **Local**: `http://localhost:5173`
- **Network**: `http://192.168.1.3:5173` (أو عنوان IP الخاص بك)

### 3. افتح Swagger API

```
http://housingms.runasp.net/swagger/index.html
```

---

## 📁 هيكل المشروع

```
housing-management-system/
├── client/                    # 📱 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── components/        # مكونات React
│   │   ├── hooks/             # Custom Hooks
│   │   ├── lib/               # Utilities والمكتبات
│   │   └── main.tsx           # Entry Point
│   ├── index.html
│   └── public/
├── dist/                      # Build Output (عند التشغيل)
├── shared/                    # 📦 Shared Types والـ Constants
├── .env.local                 # Environment Variables
├── vite.config.ts            # Vite Configuration
├── tsconfig.json             # TypeScript Configuration
└── package.json              # Dependencies

❌ REMOVED:
├── server/                   # حُذفت من التطوير
├── drizzle/                  # حُذفت من التطوير
└── patches/                  # حُذفت من التطوير
```

---

## 🔌 API Configuration

### تفاصيل الاتصال

| المعامل | القيمة |
|--------|--------|
| **Base URL** | `http://housingms.runasp.net` |
| **API Endpoint** | `/api/trpc` |
| **Full URL** | `http://housingms.runasp.net/api/trpc` |
| **Protocol** | HTTP/HTTPS |
| **Format** | tRPC + JSON |
| **Authentication** | Cookie-based |

### ملف الإعدادات

```dotenv
# .env.local
VITE_API_BASE_URL=http://housingms.runasp.net
VITE_OAUTH_SERVER_URL=http://housingms.runasp.net
VITE_TRPC_URL=http://housingms.runasp.net/api/trpc
```

---

## 🔑 الميزات

### ✅ Frontend Features

- ✓ React 19.2.1 مع TypeScript 5.9.3
- ✓ Tailwind CSS للتصميم
- ✓ React Router للملاحة
- ✓ React Hook Form للـ Forms
- ✓ tRPC للاتصال بـ API
- ✓ Vite للبناء والتطوير السريع
- ✓ Arabic UI Localization
- ✓ Dark Mode Support

### ✅ Pages المتاحة

```
/ (Home)
├── /auth/login              - تسجيل الدخول
├── /auth/signup             - التسجيل الجديد
├── /dashboard               - لوحة التحكم
├── /applications
│   ├── /new-student         - طلب دراسة جديد
│   ├── /old-student         - طلب دراسة قديم
│   └── /my-applications     - طلباتي
├── /complaints              - الشكاوى
├── /fees                    - الرسوم
├── /notifications           - الإشعارات
├── /profile                 - الملف الشخصي
└── /settings                - الإعدادات
```

---

## 🧪 Testing

### اختبار الاتصال بـ API

1. **افتح DevTools**: `F12`
2. **اذهب إلى Network Tab**
3. **نفّذ أي عملية** (Login, Submit Form, etc)
4. **تحقق من**:
   - الطلب يذهب إلى `housingms.runasp.net` ✓
   - Response Status: 200 أو 201 ✓
   - Response Body: JSON صحيح ✓

### Example Network Request

```
GET http://housingms.runasp.net/api/trpc?batch=1&input=...
```

---

## 🛠️ npm Scripts

```bash
# التطوير
npm run dev              # Vite dev server (localhost:5173)
npm run dev:host        # Vite مع network access

# الإنتاج
npm run build           # بناء الـ production bundle
npm run preview         # preview production build

# الصيانة
npm run check           # TypeScript type checking
npm run format          # Format code with Prettier
npm run test            # Run Vitest tests
```

---

## 📦 الحجم والأداء

```
Build Output:
├── index.html              0.44 kB (gzip: 0.29 kB)
├── CSS Bundle             133.19 kB (gzip: 20.87 kB)
├── JS Bundle            1,057.98 kB (gzip: 269.65 kB)
└── Build Time: ~15 seconds
```

**نصائح التحسين**:
- استخدم Dynamic Imports للـ routes
- قسّم الـ code باستخدام code-splitting
- استخدم lazy loading للصور

---

## 🌐 الاتصال بـ API

### كيفية عمل الاتصال

```tsx
// client/src/main.tsx
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://housingms.runasp.net/api/trpc",  // ← API endpoint
      transformer: superjson,
      fetch: safeTRPCFetch,
    }),
  ],
});
```

### مثال على الاستخدام

```tsx
// في صفحة أو component
const { data: user } = trpc.auth.me.useQuery();

const loginMutation = trpc.student.auth.login.useMutation({
  onSuccess: (data) => {
    // تم تسجيل الدخول
    console.log('User logged in:', data);
  },
  onError: (error) => {
    // حدث خطأ
    console.error('Login failed:', error);
  },
});
```

---

## ⚠️ مهام مهمة

### قبل التطوير ✓

- [ ] تأكد من أن `http://housingms.runasp.net` متاح
- [ ] افتح `.env.local` وتحقق من الـ URLs
- [ ] شغّل `npm install` إذا لزم الأمر

### عند المشاكل 🔧

**المشكلة**: لا تستطيع الاتصال بـ API
```bash
# الحل:
# 1. تحقق من الـ API هل يعمل
# 2. افتح DevTools -> Network -> شوف الأخطاء
# 3. تحقق من CORS headers
```

**المشكلة**: CORS Error
```bash
# قد تحتاج API server للموافقة على طلبات من localhost:5173
# تواصل مع Backend team لإضافة الـ origin
```

**المشكلة**: 401 Unauthorized
```bash
# قد تحتاج لتسجيل دخول أولاً
# جرّب رابط http://localhost:5173/auth/login
```

---

## 📚 المراجع والمصادر

### Official API
- **Swagger Docs**: `http://housingms.runasp.net/swagger/index.html`
- **API Base**: `http://housingms.runasp.net`

### Documentation
- **tRPC**: https://trpc.io/docs
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Tailwind**: https://tailwindcss.com

### Project Documentation
- [EXTERNAL_API_SETUP.md](./EXTERNAL_API_SETUP.md) - تفاصيل إعداد الـ API
- [SWAGGER_COMPLIANCE_SUMMARY.md](./SWAGGER_COMPLIANCE_SUMMARY.md) - API endpoints
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - Quick API reference

---

## 🚀 الخطوات التالية

### 1. تطوير الميزات

```bash
npm run dev
# افتح http://localhost:5173
# ابدأ التطوير
```

### 2. الاختبار

```bash
npm run test
npm run check
```

### 3. البناء للإنتاج

```bash
npm run build
# سيتم إنشاء dist/ folder
# جاهز للـ deployment
```

---

## 📞 الدعم والمساعدة

### للأسئلة التقنية

1. **تحقق من الدوكومنتيشن** أولاً
2. **افتح DevTools** وشوف الأخطاء
3. **تحقق من الـ API** إذا كانت تعمل
4. **اسأل Backend team** إذا كانت مشكلة سيرفر

### الملفات الهامة

- `.env.local` - API URLs
- `client/src/main.tsx` - tRPC configuration
- `client/src/lib/trpc.ts` - tRPC setup
- `vite.config.ts` - Build configuration

---

## ✅ Checklist

- [x] ✅ إزالة الخادم المحلي
- [x] ✅ إعداد الـ API الخارجي
- [x] ✅ تحديث npm scripts
- [x] ✅ تحديث .env.local
- [x] ✅ بناء production-ready bundle
- [x] ✅ توثيق شامل

---

## 🎉 Ready to Go!

البروجكت جاهز للتطوير مع الـ API الخارجي فقط.

```bash
npm run dev:host
# ✓ Frontend on http://localhost:5173
# ✓ API on http://housingms.runasp.net
# ✓ Development mode active
```

**Happy Coding! 🚀**

---

*Last Updated: January 20, 2026*  
*Status: Production-Ready*
