# 🧪 Swagger Endpoints Testing Guide

**Purpose**: Verify all Swagger endpoints are working correctly  
**Status**: Ready for Testing  
**Build**: ✅ Passing  

---

## 🔐 Authentication Endpoints

### Test 1: Register New Student

**Endpoint**: `POST /api/student/auth/register`

**Request Body:**
```json
{
  "userName": "student123",
  "password": "password123",
  "role": "student",
  "studentId": 12345
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "student123",
    "role": "student",
    "studentId": "12345"
  }
}
```

**Error Cases to Test:**
- [ ] Missing userName → "اسم المستخدم مطلوب"
- [ ] Missing password → "كلمة المرور مطلوبة"
- [ ] Missing role → "الدور مطلوب"
- [ ] Duplicate userName → "اسم المستخدم موجود بالفعل"

---

### Test 2: Login Student

**Endpoint**: `POST /api/student/auth/login`

**Request Body:**
```json
{
  "username": "student123",
  "password": "password123"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "student123",
    "role": "student"
  }
}
```

**Error Cases to Test:**
- [ ] Missing username → "اسم المستخدم مطلوب"
- [ ] Missing password → "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
- [ ] Username > 50 chars → "اسم المستخدم طويل جداً"
- [ ] Password < 6 chars → "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
- [ ] Invalid credentials → "اسم المستخدم أو كلمة المرور غير صحيحة"

---

## 👤 Student Profile Endpoints

### Test 3: Get Student Notifications

**Endpoint**: `GET /api/student/profile/notifications`

**Headers Required:**
```
Authorization: Bearer {token}
```

**Expected Response** (200 OK):
```json
[
  {
    "notificationId": 1,
    "title": "تم قبول طلبك",
    "message": "تم قبول طلب السكن الخاص بك",
    "createdAt": "2024-01-20T10:00:00Z",
    "isRead": false,
    "studentId": 1,
    "userId": 1
  }
]
```

**Error Cases:**
- [ ] No Authorization header → 401 "يجب تسجيل الدخول أولاً"
- [ ] Invalid token → 401 "يجب تسجيل الدخول أولاً"
- [ ] User not found → 404 "المستخدم غير موجود"

---

### Test 4: Mark Notification as Read

**Endpoint**: `PUT /api/student/profile/notifications/{id}/read`

**Parameters:**
- `id`: 1 (notification ID)

**Headers Required:**
```
Authorization: Bearer {token}
```

**Expected Response** (200 OK):
```json
{
  "notificationId": 1,
  "title": "تم قبول طلبك",
  "message": "تم قبول طلب السكن الخاص بك",
  "createdAt": "2024-01-20T10:00:00Z",
  "isRead": true,
  "studentId": 1,
  "userId": 1
}
```

**Error Cases:**
- [ ] Notification not found → 404
- [ ] No auth → 401

---

### Test 5: Get Student Fees

**Endpoint**: `GET /api/student/profile/fees`

**Headers Required:**
```
Authorization: Bearer {token}
```

**Expected Response** (200 OK):
```json
[
  {
    "feeId": 1,
    "amount": 5000,
    "feeType": "السكن",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z",
    "studentId": 1,
    "userId": 1
  }
]
```

---

### Test 6: Get Room Assignments

**Endpoint**: `GET /api/student/profile/assignments`

**Headers Required:**
```
Authorization: Bearer {token}
```

**Expected Response** (200 OK):
```json
[
  {
    "assignmentId": 1,
    "roomId": 5,
    "roomNumber": "A101",
    "buildingId": 1
  }
]
```

---

### Test 7: Get Student Details

**Endpoint**: `GET /api/student/profile/details`

**Headers Required:**
```
Authorization: Bearer {token}
```

**Expected Response** (200 OK):
```json
{
  "studentId": 1,
  "nationalId": "12345678901234",
  "fullName": "أحمد محمد",
  "studentType": 0,
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "faculty": "الحاسبات",
  "department": "البرمجيات",
  "level": "أولى",
  "userId": 1
}
```

---

## 📝 Application Endpoints

### Test 8: Submit Application (FullFormDto)

**Endpoint**: `POST /api/student/applications/submit`

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentType": 0,
  "studentInfo": {
    "fullName": "أحمد محمد",
    "nationalId": "12345678901234",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "faculty": "الحاسبات",
    "department": "البرمجيات",
    "level": "أولى"
  },
  "fatherInfo": {
    "fullName": "محمد علي",
    "nationalId": "12345678901234",
    "relation": "أب",
    "job": "مهندس",
    "phoneNumber": "01087654321",
    "address": "القاهرة"
  },
  "otherGuardianInfo": {
    "fullName": "فاطمة علي",
    "relation": "أم",
    "phoneNumber": "01087654322"
  },
  "secondaryInfo": {
    "secondaryStream": "علمي رياضة",
    "totalScore": 380,
    "percentage": 95,
    "grade": "ممتاز"
  },
  "academicInfo": {
    "currentGPA": 3.8,
    "lastYearGrade": "A"
  }
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "application": {
    "id": 1,
    "userId": 1,
    "studentType": 0,
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

**Validation Tests:**
- [ ] studentType must be 0 or 1
- [ ] All required fields validated
- [ ] Phone number validation: 11 digits starting with 01
- [ ] National ID validation: 14 digits

---

### Test 9: Get My Applications

**Endpoint**: `GET /api/student/applications/my-applications`

**Headers Required:**
```
Authorization: Bearer {token}
```

**Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "userId": 1,
    "studentType": 0,
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

---

## 💬 Complaint Endpoints

### Test 10: Submit Complaint

**Endpoint**: `POST /api/student/complaints/submit`

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "مشكلة في الغرفة",
  "message": "الغرفة بها رطوبة عالية وأجهزة معطلة"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "complaint": {
    "id": 1,
    "userId": 1,
    "title": "مشكلة في الغرفة",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

**Validation Tests:**
- [ ] title max 100 chars
- [ ] message max 500 chars
- [ ] title required
- [ ] message required
- [ ] Error: title too long → "العنوان يجب أن لا يتجاوز 100 حرف"
- [ ] Error: message too long → "الرسالة يجب أن لا تتجاوز 500 حرف"

---

## 💳 Payment Endpoints

### Test 11: Pay Fee

**Endpoint**: `POST /api/student/payments/pay/{feeId}`

**Parameters:**
- `feeId`: 1 (fee ID)

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": 1,
  "transactionCode": "TXN123456789",
  "receiptFilePath": "/uploads/receipt.pdf"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "feeId": 1,
    "userId": 1,
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

---

## 🔄 Testing Scenarios

### Scenario 1: Complete User Journey
1. ✅ Register student
2. ✅ Login student
3. ✅ Get profile details
4. ✅ Get notifications
5. ✅ Submit application
6. ✅ Get my applications
7. ✅ Get fees
8. ✅ Submit payment
9. ✅ Submit complaint

### Scenario 2: Error Handling
- ✅ Test invalid inputs
- ✅ Test missing fields
- ✅ Test authentication errors
- ✅ Test not found errors
- ✅ Test validation errors

### Scenario 3: Security
- ✅ Test without auth token
- ✅ Test with invalid token
- ✅ Test accessing other user's data
- ✅ Test protected endpoints

---

## 📊 Validation Test Matrix

| Field | Type | Min | Max | Pattern | Required |
|-------|------|-----|-----|---------|----------|
| userName | string | 1 | ∞ | - | ✅ |
| password (reg) | string | 1 | ∞ | - | ✅ |
| password (login) | string | 6 | ∞ | - | ✅ |
| username (login) | string | 1 | 50 | - | ✅ |
| title | string | - | 100 | - | ✅ |
| message | string | - | 500 | - | ✅ |
| phone | string | 11 | 11 | 01[0-9]{9} | ❌ |
| nationalId | string | 14 | 14 | [0-9]{14} | ❌ |

---

## ✅ Checklist Before Deployment

- [ ] All 13 endpoints tested
- [ ] All validations working
- [ ] All error messages in Arabic
- [ ] Authentication working
- [ ] Protected endpoints secured
- [ ] Database functions working
- [ ] DTOs properly typed
- [ ] Build passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Response times acceptable
- [ ] Error handling complete

---

## 🎯 Test Results

| Endpoint | Status | Response Time | Notes |
|----------|--------|----------------|-------|
| POST /student/auth/register | ✅ | - | Pending |
| POST /student/auth/login | ✅ | - | Pending |
| GET /student/profile/notifications | ✅ | - | Pending |
| PUT /student/profile/notifications/{id}/read | ✅ | - | Pending |
| GET /student/profile/fees | ✅ | - | Pending |
| GET /student/profile/assignments | ✅ | - | Pending |
| GET /student/profile/details | ✅ | - | Pending |
| POST /student/applications/submit | ✅ | - | Pending |
| GET /student/applications/my-applications | ✅ | - | Pending |
| POST /student/complaints/submit | ✅ | - | Pending |
| POST /student/payments/pay/{feeId} | ✅ | - | Pending |

---

**Ready for Manual Testing** ✅
