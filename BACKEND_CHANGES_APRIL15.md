# Backend Changes - April 15, 2026

> Summary ng mga ginawa sa backend at mga nakitang issues

---

## 🔍 Issues na Nakita

### Issue 1: Database Connection Timeout (ETIMEDOUT)
**Error:**
```
AggregateError [ETIMEDOUT]:
  Error: connect ETIMEDOUT 13.213.241.248:6543
```

**Cause:** Backend hindi makapag-connect sa Supabase PostgreSQL database.

**Status:** ✅ FIXED (database is now connecting properly)

---

### Issue 2: 500 Internal Server Errors sa Endpoints
**Affected Endpoints:**
- `GET /api/room-types/active`
- `GET /api/hotel-settings`

**Cause:** Walang proper error handling, pag may database issue, 500 error lang ang lumalabas without helpful message.

**Status:** ✅ FIXED

---

### Issue 3: CORS Configuration
**Error:** Frontend sa `localhost:4200` hindi makapag-request sa backend.

**Status:** ✅ FIXED

---

### Issue 4: File Upload Causing Page Reload (FRONTEND ISSUE)
**Symptom:**
- Pag nag-upload ng file, nag-rereload ang page
- After reload, naging offline/disconnected

**Cause:** Form submission sa frontend causing full page navigation.

**Status:** ⚠️ FRONTEND NEEDS TO FIX (see instructions below)

---

## 🛠️ Backend Changes Made

### 1. Database Configuration Updated
**File:** `src/app.module.ts`

**Added:**
```typescript
TypeOrmModule.forRootAsync({
  // ... existing config ...
  useFactory: (configService: ConfigService) => ({
    // ... existing options ...
    
    // NEW: Connection pool and timeout settings
    logging: configService.get('NODE_ENV') === 'development',
    connectTimeoutMS: 30000,
    extra: {
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      max: 10,
    },
    retryAttempts: 3,
    retryDelay: 3000,
  }),
}),
```

**Why:** Para hindi mag-timeout agad at may retry mechanism kung mabagal ang database connection.

---

### 2. Error Handling Added to Room Types Service
**File:** `src/modules/room-types/room-types.service.ts`

**Before:**
```typescript
async findAllActive(): Promise<RoomType[]> {
  return this.roomTypeRepository.find({
    where: { isActive: true },
    order: { name: 'ASC' },
  });
}
```

**After:**
```typescript
async findAllActive(): Promise<RoomType[]> {
  try {
    return await this.roomTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  } catch (error) {
    this.logger.error(`Failed to fetch active room types: ${error.message}`, error.stack);
    throw new InternalServerErrorException('Failed to fetch active room types. Database connection issue.');
  }
}
```

**Why:** Para may clear error message at logging kung may database issue.

---

### 3. Error Handling Added to Hotel Settings Service
**File:** `src/modules/hotel-settings/hotel-settings.service.ts`

**Added try-catch with Logger to:**
- `getSettings()`
- `getAllPolicies()`
- `getActivePolicies()`

**Why:** Same reason - proper error handling at logging.

---

### 4. CORS Configuration Updated
**File:** `src/main.ts`

**Before:**
```typescript
app.enableCors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**After:**
```typescript
app.enableCors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
});
```

**Why:** 
- Specific origins instead of wildcard for security
- `credentials: true` para sa proper cookie/auth handling
- Added more allowed headers

---

## ⚠️ FRONTEND ACTION REQUIRED

### File Upload Page Reload Issue

**Problem:** Pag nag-upload ng file, full page reload ang nangyayari.

**Evidence from browser:**
```
Request URL: http://localhost:4200/guest-registration
Request Type: document (full page navigation)
```

**Root Cause:** `<input type="file">` is inside a `<form>` element, at ang file selection triggers form submission.

### 🔧 FIX NEEDED IN FRONTEND

**Option 1: Remove form wrapper**
```html
<!-- ❌ CURRENT (causes reload) -->
<form>
  <input type="file" (change)="onFileSelect($event)">
</form>

<!-- ✅ FIX -->
<div>
  <input type="file" (change)="onFileSelect($event)">
</div>
```

**Option 2: Prevent default in handler**
```typescript
onFileSelect(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  // Process file
  this.processFile(file);
}
```

**Option 3: Prevent form submission**
```html
<form (submit)="$event.preventDefault()">
  <input type="file" (change)="onFileSelect($event)">
</form>
```

### Why Offline After Reload?

After page reload:
1. Angular app reinitializes
2. Auth service loses state
3. Token might not be re-read from localStorage
4. API calls fail → app shows as offline

**Frontend should verify:**
```typescript
// Check if token persists after reload
ngOnInit() {
  const token = localStorage.getItem('accessToken');
  console.log('Token:', token ? 'EXISTS' : 'MISSING');
}
```

---

## ✅ Current Backend Status

| Item | Status |
|------|--------|
| Database Connection | ✅ Working |
| Login Endpoint | ✅ Working |
| Room Types Endpoint | ✅ Working |
| Hotel Settings Endpoint | ✅ Working |
| CORS for localhost:4200 | ✅ Configured |
| Error Handling | ✅ Added |
| Swagger Docs | ✅ Available at /api/docs |

---

## 🧪 Test Commands

```bash
# Start backend
cd "d:/PROJECT/GUEST REGISTRATION KEKEHYU/guest_registration_be"
npm run start:dev

# Server will run on:
# http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

---

## 📝 Notes for Frontend Developer

1. **File upload reload** - This is a frontend issue, not backend. Backend is receiving no upload request, instead browser is doing full page navigation.

2. **Token handling** - Make sure token is stored in localStorage and HTTP Interceptor is attaching it to all requests.

3. **Check Network tab** - Sa browser dev tools, tingnan kung ang file upload request ay:
   - Type: `xhr` or `fetch` ✅ (correct)
   - Type: `document` ❌ (wrong - means form submission)

4. **Offline issue** - Likely caused by auth state not persisting after page reload. Check if interceptor is properly reading token from localStorage.

---

**Date:** April 15, 2026  
**Backend Developer:** Copilot
