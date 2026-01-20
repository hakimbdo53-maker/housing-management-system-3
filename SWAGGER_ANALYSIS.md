# تحليل Swagger الرسمي - Student/User Features فقط

## 🎯 Student/User Endpoints المطلوبة

### ✅ Authentication (StudentAuth)
```
POST /api/student/auth/register - RegisterDto
POST /api/student/auth/login - LoginDto
```

**RegisterDto:**
- userName (required, string, min: 1)
- password (required, string, min: 1)
- role (required, string, min: 1)
- studentId (optional, integer)

**LoginDto:**
- username (required, string, maxLength: 50, minLength: 1)
- password (required, string, minLength: 6)

---

### ✅ Student Profile (StudentProfile)
```
GET /api/student/profile/notifications
GET /api/student/profile/notifications/{id}/read
PUT /api/student/profile/notifications/{id}/read
GET /api/student/profile/fees
GET /api/student/profile/assignments
GET /api/student/profile/details
```

---

### ✅ Student Applications (StudentApplications)
```
POST /api/student/applications/submit - FullFormDto
GET /api/student/applications/my-applications
```

**FullFormDto:**
- studentType (StudentTypeEnum: 0 or 1)
- studentInfo (StudentDto)
- fatherInfo (FamilyContactDto)
- selectedGuardianRelation (optional, string)
- otherGuardianInfo (FamilyContactDto)
- secondaryInfo (SecondaryEducationDto)
- academicInfo (AcademicEducationDto)

---

### ✅ Student Complaints (StudentComplaints)
```
POST /api/student/complaints/submit - SubmitComplaintDto
```

**SubmitComplaintDto:**
- title (required, string, maxLength: 100)
- message (required, string, maxLength: 500)

---

### ✅ Fee Payment (FeePayment)
```
POST /api/student/payments/pay/{feeId} - FeePaymentDto
```

**FeePaymentDto:**
- studentId (integer)
- transactionCode (optional, string)
- receiptFilePath (optional, string)

---

### ✅ Student CRUD (Student)
```
GET /api/Student
POST /api/Student - StudentDto
GET /api/Student/{id}
PUT /api/Student/{id} - StudentDto
DELETE /api/Student/{id}
PUT /api/Student/self-update - StudentDto
```

---

### ✅ User Routes (User)
```
DELETE /api/users/{id}
```

---

## 🔴 نقاط الخلل في الكود الحالي

### 1. غياب Student Auth Endpoints
- الكود الحالي يستخدم `/api/auth/` بدلاً من `/api/student/auth/`
- يجب فصل Student Auth عن Admin Auth

### 2. غياب Student Profile Endpoints
- لا توجد `/api/student/profile/*` endpoints

### 3. غياب Student Applications Endpoints
- الـ endpoint الحالي `/api/applications/` لكن يجب `/api/student/applications/`
- التسميات مختلفة

### 4. غياب Student Complaints Endpoint
- الـ endpoint الحالي لكن يجب تصحيح المسار

### 5. غياب Fee Payment Endpoint
- لا يوجد `/api/student/payments/pay/{feeId}`

### 6. غياب Student CRUD Endpoints
- `/api/Student/*` endpoints

---

## 📋 DTOs المطلوبة من Swagger

### StudentDto
```typescript
{
  studentId: integer
  nationalId: string
  fullName: string
  studentType: StudentTypeEnum (0 or 1)
  birthDate: date-time
  birthPlace: string
  gender: string
  religion: string
  governorate: string
  city: string
  address: string
  email: string
  phone: string
  faculty: string
  department: string
  level: string
  fatherContactId: integer
  guardianContactId: integer
  userId: integer
}
```

### FamilyContactDto
```typescript
{
  contactId: integer
  fullName: string
  nationalId: string
  relation: string
  job: string
  phoneNumber: string
  address: string
}
```

### SecondaryEducationDto
```typescript
{
  studentId: integer
  secondaryStream: string
  totalScore: number (double)
  percentage: number (double)
  grade: string
}
```

### AcademicEducationDto
```typescript
{
  studentId: integer
  currentGPA: number (double)
  lastYearGrade: string
}
```

### FeesDto
```typescript
{
  feeId: integer
  amount: number (double)
  feeType: string
  status: string
  createdAt: date-time
  studentId: integer
  userId: integer
}
```

### NotificationDto
```typescript
{
  notificationId: integer
  title: string
  message: string
  createdAt: date-time
  isRead: boolean
  studentId: integer
  userId: integer
  applicationId: integer (nullable)
}
```

---

## ✨ الخطة

1. ✅ تحليل Swagger
2. ⏳ فصل auth endpoints (student vs admin)
3. ⏳ إضافة student profile endpoints
4. ⏳ تصحيح student applications endpoints
5. ⏳ تصحيح student complaints endpoints
6. ⏳ إضافة fee payment endpoints
7. ⏳ إضافة student CRUD endpoints
8. ⏳ تحديث جميع DTOs
9. ⏳ التحقق من Validations
10. ⏳ اختبار جميع endpoints
