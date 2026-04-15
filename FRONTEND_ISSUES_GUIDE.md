# Frontend Issues & Solutions Guide

> Para sa Frontend Developer - Common Issues at Fixes

---

## 🔥 URGENT: File Upload Causing Page Reload + Offline

### Symptoms
1. After file upload, page reloads to `http://localhost:4200/guest-registration`
2. After reload, app shows as disconnected/offline
3. Request shows as "document" type (full page navigation) instead of API call

### Root Cause
**Form submission is triggering a full page navigation.**

This happens when:
- `<input type="file">` is inside a `<form>` element
- Button click triggers form submit
- Missing `event.preventDefault()` on form/button

### 🛠️ IMMEDIATE FIX

#### Step 1: Find your file input in the template
Look for something like this:
```html
<!-- ❌ PROBLEM: input inside form -->
<form>
  <input type="file" (change)="onFileSelect($event)">
</form>
```

#### Step 2: Apply ONE of these fixes

**Fix A: Remove form wrapper (Recommended)**
```html
<!-- ✅ SOLUTION: No form wrapper -->
<div class="file-upload-container">
  <input 
    type="file" 
    (change)="onFileSelect($event)"
    accept=".pdf,.jpg,.jpeg,.png"
  >
</div>
```

**Fix B: If form is needed, prevent default**
```html
<form (submit)="$event.preventDefault()">
  <input type="file" (change)="onFileSelect($event)">
</form>
```

**Fix C: Use button type="button"**
```html
<form>
  <input type="file" #fileInput hidden (change)="onFileSelect($event)">
  <button type="button" (click)="fileInput.click()">Choose File</button>
</form>
```

#### Step 3: Update component method
```typescript
onFileSelect(event: Event): void {
  // IMPORTANT: Prevent any default behavior
  event.preventDefault();
  event.stopPropagation();
  
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  console.log('File selected:', file.name); // Debug log
  
  // Process file WITHOUT triggering navigation
  this.processFile(file);
  
  // Clear input to allow re-selecting same file
  input.value = '';
}

private processFile(file: File): void {
  // Your upload logic here
  // Make sure this doesn't trigger form submit!
  
  // Example: Read as base64
  const reader = new FileReader();
  reader.onload = () => {
    this.fileBase64 = reader.result as string;
    console.log('File processed successfully');
  };
  reader.readAsDataURL(file);
}
```

### 🔍 Debug: Check if form submit is the issue

Add this temporarily to your component:
```typescript
ngOnInit() {
  // Catch any form submissions
  document.addEventListener('submit', (e) => {
    console.error('FORM SUBMITTED!', e.target);
    e.preventDefault(); // Temporary block
  });
}
```

### 📴 Why Offline After Reload?

After page reload, these things can break:
1. **Token lost** - Check if `localStorage.getItem('accessToken')` returns null after reload
2. **Auth state reset** - Angular service state is cleared on reload
3. **API calls fail** - 401 errors because token not re-attached

**Fix: Check token persistence**
```typescript
// In app.component.ts or auth.service.ts
ngOnInit() {
  const token = localStorage.getItem('accessToken');
  console.log('Token after reload:', token ? 'EXISTS' : 'MISSING');
  
  if (token) {
    // Verify token is still valid
    this.authService.getProfile().subscribe({
      next: (user) => console.log('User still logged in:', user),
      error: (err) => {
        console.error('Token invalid, redirecting to login');
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
```

---

## 🔐 Authentication

### Login Request
```typescript
// auth.service.ts
login(email: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
    email,
    password
  });
}
```

### Store Token
```typescript
// After successful login
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('user', JSON.stringify(response.user));
```

### HTTP Interceptor (Add Token to Requests)
```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

### Register Interceptor
```typescript
// app.module.ts or app.config.ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

---

## 🌐 CORS Issues

### Allowed Origin
Backend currently allows:
```
http://localhost:4200
http://127.0.0.1:4200
```

### Common CORS Errors

#### Error: "Access-Control-Allow-Origin"
- Make sure frontend runs on `localhost:4200`
- Check if backend is running on `localhost:3000`

#### Error: "Credentials"
Backend has `credentials: true`, so if you're using cookies:
```typescript
// http client should include credentials
this.http.post(url, data, { withCredentials: true });
```

---

## 📝 Guest Registration Payload

### Minimum Required Fields
```typescript
interface GuestRegistration {
  // Main Guest (REQUIRED)
  firstName: string;
  lastName: string;
  validIdPresented: boolean;
  
  // Reservations (REQUIRED, at least 1)
  reservations: [{
    reservationNumber: string;
    roomNumber: string;
    checkInDate: string;  // "2026-04-15"
  }];
  
  // Agreement (REQUIRED)
  agreement: {
    policyHousekeeping1: boolean;
    policyHousekeeping2: boolean;
    policySmoking: boolean;
    policyCorkage: boolean;
    policyNoPets: boolean;
    policyNegligence: boolean;
    policyMinors: boolean;
    policyParking: boolean;
    policySafe: boolean;
    policyForceMajeure: boolean;
    policyDataPrivacy: boolean;
    guestPrintedName: string;
    guestSignature: string;      // base64
    signatureDate: string;       // "2026-04-15"
    processedByName: string;
    processedBySignature: string; // base64
  };
}
```

### Example Service Call
```typescript
// guest.service.ts
createGuest(data: GuestRegistration): Observable<Guest> {
  return this.http.post<Guest>(`${this.apiUrl}/guests`, data);
}
```

---

## 🖼️ Signature as Base64

### Capture Signature (using signature_pad library)
```typescript
import SignaturePad from 'signature_pad';

// Initialize
const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
const signaturePad = new SignaturePad(canvas);

// Get base64
const signatureBase64 = signaturePad.toDataURL(); // "data:image/png;base64,..."

// Clear
signaturePad.clear();

// Check if empty
if (signaturePad.isEmpty()) {
  alert('Please sign first');
}
```

### HTML
```html
<canvas #signatureCanvas width="400" height="200"></canvas>
<button type="button" (click)="clearSignature()">Clear</button>
```

---

## 🔄 Room Types Dropdown

### Fetch Active Room Types
```typescript
// room-type.service.ts
getActiveRoomTypes(): Observable<RoomType[]> {
  return this.http.get<RoomType[]>(`${this.apiUrl}/room-types/active`);
}
```

### Use in Template
```html
<select formControlName="roomTypeId">
  <option value="">Select Room Type</option>
  <option *ngFor="let room of roomTypes" [value]="room.id">
    {{ room.name }} - {{ room.description }}
  </option>
</select>
```

---

## ⚠️ Error Handling

### HTTP Error Interceptor
```typescript
// error.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired - redirect to login
        localStorage.clear();
        this.router.navigate(['/login']);
      } else if (error.status === 403) {
        // Forbidden - insufficient permissions
        this.toastr.error('You do not have permission');
      } else if (error.status === 400) {
        // Validation error
        const messages = error.error.message;
        if (Array.isArray(messages)) {
          messages.forEach(msg => this.toastr.error(msg));
        } else {
          this.toastr.error(messages);
        }
      } else if (error.status === 500) {
        this.toastr.error('Server error. Please try again later.');
      }
      
      return throwError(() => error);
    })
  );
}
```

---

## 📋 Checklist Before Submit

- [ ] All required fields filled
- [ ] Guest signature captured (not empty)
- [ ] Processed by signature captured
- [ ] At least 1 reservation added
- [ ] All policy checkboxes checked
- [ ] Dates in correct format (YYYY-MM-DD)
- [ ] Token present in localStorage

---

## 🧪 Test Credentials

```
Email: superadmin@hotel.com
Password: [ask backend developer]

Email: john.doe@hotel.com (Front Desk)
Password: [ask backend developer]
```

---

## 📞 API Endpoints Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/api/auth/login` |
| Get Profile | GET | `/api/auth/profile` |
| Get Room Types | GET | `/api/room-types/active` |
| Get Hotel Settings | GET | `/api/hotel-settings` |
| Create Guest | POST | `/api/guests` |
| Get Guests | GET | `/api/guests` |

---

## 💡 Tips

1. **Console Debugging**: Always check browser console (F12) for errors
2. **Network Tab**: Check actual request/response in Network tab
3. **Token Check**: Verify token is being sent in Authorization header
4. **Form Validation**: Validate all fields before API call
5. **Loading States**: Show spinner during API calls to prevent double-submit
