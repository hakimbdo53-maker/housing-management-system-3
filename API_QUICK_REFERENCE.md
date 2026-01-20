# 🚀 Swagger Compliance - Quick API Reference

**جميع الـ APIs الآن تطابق Swagger الرسمي تماماً**

---

## 🔐 Authentication

### تسجيل جديد
```
POST /api/student/auth/register
Content-Type: application/json

{
  "userName": "ahmed123",      // min: 1
  "password": "password123",   // min: 1
  "role": "student",           // min: 1
  "studentId": 12345           // optional
}

Response: 200
{
  "success": true,
  "user": { ... }
}
```

### تسجيل الدخول
```
POST /api/student/auth/login
Content-Type: application/json

{
  "username": "ahmed123",      // min: 1, max: 50
  "password": "password123"    // min: 6
}

Response: 200
{
  "success": true,
  "user": { ... }
}
```

---

## 👤 Student Profile

### الحصول على البيانات الشخصية
```
GET /api/student/profile/details
Authorization: Bearer {token}

Response: 200
{
  "studentId": 1,
  "fullName": "أحمد محمد",
  "nationalId": "12345678901234",
  "email": "ahmed@example.com",
  ...
}
```

### الحصول على الإشعارات
```
GET /api/student/profile/notifications
Authorization: Bearer {token}

Response: 200
[
  {
    "notificationId": 1,
    "title": "طلبك تم قبوله",
    "message": "تم قبول طلب السكن الخاص بك",
    "isRead": false,
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

### تحديث الإشعار كـ مقروء
```
PUT /api/student/profile/notifications/1/read
Authorization: Bearer {token}

Response: 200
{ ... updated notification ... }
```

### الحصول على الرسوم
```
GET /api/student/profile/fees
Authorization: Bearer {token}

Response: 200
[
  {
    "feeId": 1,
    "amount": 5000,
    "feeType": "السكن",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

### الحصول على تعيينات الغرف
```
GET /api/student/profile/assignments
Authorization: Bearer {token}

Response: 200
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

## 📝 Applications

### تقديم طلب سكن (New Student)
```
POST /api/student/applications/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentType": 0,  // 0 = New, 1 = Old
  "studentInfo": {
    "fullName": "أحمد محمد",
    "nationalId": "12345678901234",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "faculty": "الحاسبات والذكاء الاصطناعي",
    "department": "هندسة البرمجيات",
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

Response: 200
{
  "success": true,
  "application": { ... }
}
```

### الحصول على طلباتي
```
GET /api/student/applications/my-applications
Authorization: Bearer {token}

Response: 200
[
  {
    "id": 1,
    "studentType": 0,
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z",
    ...
  }
]
```

---

## 💬 Complaints

### تقديم شكوى
```
POST /api/student/complaints/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "مشكلة في الغرفة",        // max: 100 characters
  "message": "الغرفة بها رطوبة عالية"  // max: 500 characters
}

Response: 200
{
  "success": true,
  "complaint": {
    "id": 1,
    "title": "مشكلة في الغرفة",
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

---

## 💳 Payment

### دفع رسم
```
POST /api/student/payments/pay/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": 1,                          // optional
  "transactionCode": "TXN123456789",       // optional
  "receiptFilePath": "/uploads/receipt.pdf" // optional
}

Response: 200
{
  "success": true,
  "payment": {
    "id": 1,
    "feeId": 1,
    "status": "pending",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

---

## 📌 Error Responses

جميع الأخطاء تُرجع رسائل بالعربية:

```json
{
  "code": "BAD_REQUEST",
  "message": "البيانات المدخلة غير صحيحة"
}

{
  "code": "UNAUTHORIZED",
  "message": "يجب تسجيل الدخول أولى"
}

{
  "code": "NOT_FOUND",
  "message": "البيانات المطلوبة غير موجودة"
}

{
  "code": "INTERNAL_SERVER_ERROR",
  "message": "حدث خطأ في معالجة الطلب"
}
```

---

## 🔄 StudentTypeEnum

- `0` = طالب جديد (New Student)
- `1` = طالب قديم (Old Student)

---

## ✅ Validations

### Username (تسجيل)
- minLength: 1

### Password
- minLength: 1 (للتسجيل)
- minLength: 6 (لـ login)

### Username (Login)
- minLength: 1
- maxLength: 50

### Complaint Title
- maxLength: 100

### Complaint Message
- maxLength: 500

### Phone Number
- Pattern: `01[0-9]{9}` (11 digits starting with 01)

### National ID
- Pattern: `[0-9]{14}` (14 digits exactly)

---

## 🔒 Authentication

جميع الـ `/api/student/*` endpoints تتطلب:
```
Authorization: Bearer {token}
```

الـ endpoints العامة:
- `POST /api/student/auth/register` - بدون token
- `POST /api/student/auth/login` - بدون token

---

## 📊 Data Types

### StudentTypeEnum
```typescript
enum StudentTypeEnum {
  NEW = 0,
  OLD = 1
}
```

### StudentDto
- studentId: number
- nationalId: string
- fullName: string
- email: string
- phone: string
- faculty: string
- department: string
- level: string
- ...

### FamilyContactDto
- contactId: number
- fullName: string
- nationalId: string
- relation: string
- job: string
- phoneNumber: string
- address: string

### SecondaryEducationDto
- studentId: number
- secondaryStream: string
- totalScore: number
- percentage: number
- grade: string

### AcademicEducationDto
- studentId: number
- currentGPA: number
- lastYearGrade: string

---

**جميع الـ endpoints جاهزة للاستخدام ومطابقة لـ Swagger الرسمي** ✅
