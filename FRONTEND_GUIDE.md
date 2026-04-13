# 🏨 Kekehyu Hotel Guest Registration System
## Frontend Developer Guide (Angular)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Sidebar Navigation per Role](#sidebar-navigation-per-role)
4. [Page Layouts & Components](#page-layouts--components)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Authentication Flow](#authentication-flow)
7. [Data Models / Interfaces](#data-models--interfaces)
8. [Registration Flow (Front Desk)](#registration-flow-front-desk)
9. [Dashboard Specs (Admin/Super Admin)](#dashboard-specs-adminsuper-admin)
10. [UI/UX Guidelines](#uiux-guidelines)

---

## 🎯 Project Overview

**System:** Hotel Guest Registration with E-Signature and PDF Generation

**Tech Stack:**
- **Frontend:** Angular 17+ (Standalone Components)
- **Backend:** NestJS (REST API)
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT (Access Token + Refresh Token)

**Base API URL:** `http://localhost:3000/api`
**Swagger Docs:** `http://localhost:3000/api/docs`

---

## 👥 User Roles & Permissions

| Role | Code | Description |
|------|------|-------------|
| **Front Desk** | `front_desk` | Registers guests, captures signatures, generates PDF |
| **Admin** | `admin` | Views dashboard, guest list, front desk activity (READ ONLY) |
| **Super Admin** | `super_admin` | Full access: CRUD users, guests, settings, policies |

### Permission Matrix

| Feature | Front Desk | Admin | Super Admin |
|---------|:----------:|:-----:|:-----------:|
| Dashboard | ❌ | ✅ View | ✅ View |
| Guest Registration | ✅ | ❌ | ✅ |
| My Registrations | ✅ | ❌ | ❌ |
| All Guests | ❌ | ✅ View | ✅ CRUD |
| Front Desk Activity | ❌ | ✅ View | ✅ View |
| User Management | ❌ | ❌ | ✅ CRUD |
| Room Types | ❌ | ❌ | ✅ CRUD |
| Hotel Policies | ❌ | ❌ | ✅ CRUD |
| Hotel Settings | ❌ | ❌ | ✅ Edit |

---

## 📱 Sidebar Navigation per Role

### Front Desk Sidebar (Minimal)
```
┌─────────────────────────┐
│  🏨 Kekehyu Hotel       │
├─────────────────────────┤
│  📝 Guest Registration  │  ← Default landing page
│  📋 My Registrations    │  ← Optional: view own guests
├─────────────────────────┤
│  👤 Profile             │
│  🚪 Logout              │
└─────────────────────────┘
```

### Admin Sidebar
```
┌─────────────────────────┐
│  🏨 Kekehyu Hotel       │
├─────────────────────────┤
│  📊 Dashboard           │  ← Default landing page
│  👥 Guests              │
│     └─ All Guests       │
│     └─ Today            │
│     └─ This Week        │
│     └─ This Month       │
│  👨‍💼 Front Desk Activity │
│     └─ Today            │
│     └─ This Week        │
│     └─ This Month       │
│     └─ This Year        │
├─────────────────────────┤
│  👤 Profile             │
│  🚪 Logout              │
└─────────────────────────┘
```

### Super Admin Sidebar (Full Access)
```
┌─────────────────────────┐
│  🏨 Kekehyu Hotel       │
├─────────────────────────┤
│  📊 Dashboard           │  ← Default landing page
│  📝 Guest Registration  │
│  👥 Guests              │
│     └─ All Guests       │
│     └─ Today            │
│     └─ This Week        │
│     └─ This Month       │
│  👨‍💼 Front Desk Activity │
│     └─ Today            │
│     └─ This Week        │
│     └─ This Month       │
│     └─ This Year        │
│  👤 User Management     │
│     └─ All Users        │
│     └─ Add User         │
│  🏠 Room Types          │
│  📜 Policy Management   │
│  ⚙️ Hotel Settings      │
├─────────────────────────┤
│  👤 Profile             │
│  🚪 Logout              │
└─────────────────────────┘
```

---

## 📄 Page Layouts & Components

### 1. Login Page (`/login`)
- Email input
- Password input
- Login button
- No sidebar, full page

### 2. Guest Registration (`/guest-registration`) - Front Desk / Super Admin
**Components:**
- Guest Information Form
- Room Reservations (can add multiple)
- Accompanying Guests per Room
- Policy Checkboxes
- Signature Pad (Guest)
- Signature Pad (Front Desk)
- Remarks textarea
- Generate PDF button

### 3. Dashboard (`/dashboard`) - Admin / Super Admin
**Cards:**
- Total Guests Today
- Total Guests This Week
- Total Guests This Month
- Total Guests This Year

**Charts:**
- Guest registration trend (line/bar chart)
- Guests by Front Desk (pie chart)

**Table:**
- Recent registrations

### 4. Guest List (`/guests`)
**Features:**
- Data table with pagination
- Search/filter by name, date, front desk
- View guest details modal
- Edit/Delete buttons (Super Admin only)

### 5. Front Desk Activity (`/activity`)
**Features:**
- Table showing:
  - Front Desk Name
  - Login Time
  - Logout Time
  - Duration (hours)
  - Status (Active/Logged Out)
- Filter by period (today, week, month, year)
- Total hours worked per staff

### 6. User Management (`/users`) - Super Admin Only
**Features:**
- User list table
- Add User form (modal or page)
- Edit User
- Activate/Deactivate User
- Delete User

### 7. Room Types (`/room-types`) - Super Admin Only
**Features:**
- CRUD room types
- Toggle active/inactive

### 8. Policy Management (`/policies`) - Super Admin Only
**Features:**
- List policies by category
- Edit policy content
- Toggle active/inactive

### 9. Hotel Settings (`/settings`) - Super Admin Only
**Features:**
- Hotel name, logo
- Default check-in/out times
- Smoking fee
- Corkage fee percentage
- Contact info

---

## 🔌 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | JWT |
| POST | `/api/auth/refresh` | Refresh token | Public |
| GET | `/api/auth/profile` | Get current user | JWT |

**Login Request:**
```json
{
  "email": "superadmin@hotel.com",
  "password": "SuperAdmin123!"
}
```

**Login Response:**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "sessionId": "uuid",
  "user": {
    "id": "uuid",
    "email": "superadmin@hotel.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "super_admin"
  },
  "redirectPath": "/dashboard"
}
```

### Users (Super Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PATCH | `/api/users/:id/activate` | Activate user |
| PATCH | `/api/users/:id/deactivate` | Deactivate user |

### Guests
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/guests` | Register guest | Front Desk, Super Admin |
| GET | `/api/guests` | Get all guests | All (filtered by role) |
| GET | `/api/guests/:id` | Get guest by ID | All |
| PATCH | `/api/guests/:id` | Update guest | Super Admin |
| DELETE | `/api/guests/:id` | Delete guest | Super Admin |
| GET | `/api/guests/statistics?period=today` | Get stats | Admin, Super Admin |
| GET | `/api/guests/period?period=today` | Get guests by period | Admin, Super Admin |

**period options:** `today`, `week`, `month`, `year`

### Sessions (Admin, Super Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions/front-desk-activity?period=today` | Get front desk activity |
| GET | `/api/sessions/all?period=today` | Get all sessions |

### Room Types
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/room-types` | Get all | All |
| GET | `/api/room-types/active` | Get active only | All |
| POST | `/api/room-types` | Create | Super Admin |
| PATCH | `/api/room-types/:id` | Update | Super Admin |
| DELETE | `/api/room-types/:id` | Delete | Super Admin |

### Hotel Settings
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/hotel-settings` | Get settings | All |
| PATCH | `/api/hotel-settings` | Update settings | Super Admin |
| GET | `/api/hotel-settings/policies` | Get all policies | All |
| GET | `/api/hotel-settings/policies/active` | Get active policies | All |
| POST | `/api/hotel-settings/policies` | Create policy | Super Admin |
| PATCH | `/api/hotel-settings/policies/:id` | Update policy | Super Admin |
| DELETE | `/api/hotel-settings/policies/:id` | Delete policy | Super Admin |

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  POST /auth/login│
                    └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
         ✅ Success                      ❌ 401 Error
              │                               │
              ▼                               ▼
     Store in localStorage:              Show error message
     - accessToken                       "Invalid credentials"
     - refreshToken
     - sessionId
     - user (object)
              │
              ▼
     Redirect based on role:
     - front_desk → /guest-registration
     - admin → /dashboard
     - super_admin → /dashboard
```

### Token Storage (localStorage)
```typescript
// After login
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
localStorage.setItem('sessionId', response.sessionId);
localStorage.setItem('user', JSON.stringify(response.user));
```

### HTTP Interceptor
```typescript
// Add to all requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}

// On 401 response:
// 1. Try refresh token
// 2. If refresh fails, redirect to login
```

### Logout Flow
```typescript
// 1. Call API
POST /api/auth/logout
Body: { sessionId: localStorage.getItem('sessionId') }

// 2. Clear localStorage
localStorage.clear();

// 3. Redirect to /login
```

---

## 📦 Data Models / Interfaces

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'front_desk' | 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Guest
```typescript
interface Guest {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  country?: string;
  validIdPresented: boolean;
  vehiclePlateNo?: string;
  createdAt: Date;
  updatedAt: Date;
  registeredBy: User;
  reservations: Reservation[];
  agreement: GuestAgreement;
}
```

### Reservation
```typescript
interface Reservation {
  id: string;
  reservationNumber: string;
  roomNumber: string;
  roomType?: RoomType;
  checkInDate: Date;
  checkOutDate?: Date;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'checked_in' | 'checked_out' | 'cancelled';
  accompanyingGuests: AccompanyingGuest[];
}
```

### AccompanyingGuest
```typescript
interface AccompanyingGuest {
  id: string;
  name: string;
  validIdPresented: boolean;
  signature?: string; // Base64
}
```

### GuestAgreement
```typescript
interface GuestAgreement {
  id: string;
  // Policies (all boolean)
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
  // Signatures
  guestPrintedName: string;
  guestSignature: string; // Base64
  signatureDate: Date;
  processedByName: string;
  processedBySignature: string; // Base64
  remarks?: string;
  pdfPath?: string;
}
```

### RoomType
```typescript
interface RoomType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}
```

### HotelSettings
```typescript
interface HotelSettings {
  id: string;
  hotelName: string;
  logoPath?: string;
  defaultCheckInTime: string; // "14:00"
  defaultCheckOutTime: string; // "11:00"
  smokingFee: number;
  corkageFeePercent: number;
  address?: string;
  contactNumber?: string;
  email?: string;
}
```

### PolicyTemplate
```typescript
interface PolicyTemplate {
  id: string;
  category: 'housekeeping' | 'hotel' | 'data_privacy';
  code: string;
  content: string;
  displayOrder: number;
  isActive: boolean;
}
```

### UserSession (Front Desk Activity)
```typescript
interface UserSession {
  id: string;
  userId: string;
  user: User;
  loginAt: Date;
  logoutAt?: Date;
  ipAddress?: string;
  durationMinutes?: number;
  isActive: boolean;
}
```

---

## 📝 Registration Flow (Front Desk)

### Step-by-step UI Flow:
```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: GUEST INFORMATION                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Guest Name: [________________________]                     │
│  Phone Number: [________________________]                   │
│  Email: [________________________]                          │
│  Country: [________________________]                        │
│  Vehicle Plate No: [________________________]               │
│  Valid ID Presented: [✓ Yes] [ No]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: ROOM RESERVATIONS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Add Room]                                               │
│                                                             │
│  ┌─── Room 1 ─────────────────────────────────────────────┐ │
│  │ Reservation #: [____________]                          │ │
│  │ Room Type: [Dropdown ▼]                                │ │
│  │ Room Number: [______]                                  │ │
│  │ Check-in Date: [📅]  Time: [14:00]                     │ │
│  │ Check-out Date: [📅]  Time: [11:00]                    │ │
│  │                                                        │ │
│  │ Accompanying Guests: [+ Add Guest]                     │ │
│  │   1. Name: [________] ID: [✓] Signature: [Draw]       │ │
│  │   2. Name: [________] ID: [✓] Signature: [Draw]       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─── Room 2 ─────────────────────────────────────────────┐ │
│  │ (Same fields as Room 1)                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: HOTEL POLICIES                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOUSEKEEPING POLICY                                        │
│  [✓] I understand that make-up room service is upon         │
│      request only.                                          │
│  [✓] I acknowledge that housekeeping staff are not          │
│      allowed to enter the room without guest consent.       │
│                                                             │
│  HOTEL POLICIES (PLEASE CHECK TO ACKNOWLEDGE)               │
│  [✓] Smoking inside rooms is prohibited. A ₱5,000           │
│      smoking fee applies.                                   │
│  [✓] A 30% corkage fee applies.                            │
│  [✓] No pets allowed.                                       │
│  [✓] Guests are responsible for negligence.                 │
│  [✓] Minors must be accompanied by adults.                  │
│  [✓] Parking is limited and subject to availability.       │
│  [✓] Hotel is not liable for loss/theft. Digital safe      │
│      is provided.                                           │
│  [✓] Force majeure clause.                                  │
│                                                             │
│  DATA PRIVACY                                               │
│  [✓] I acknowledge data privacy policy.                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: SIGNATURES                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GUEST ACKNOWLEDGMENT                                       │
│  I hereby acknowledge that I have read, understood,         │
│  and agree to abide by the Terms & Conditions.              │
│                                                             │
│  Guest Printed Name: [________________________]             │
│                                                             │
│  Guest Signature:                                           │
│  ┌─────────────────────────────────────────┐               │
│  │                                         │               │
│  │        [Signature Pad Canvas]           │               │
│  │                                         │               │
│  └─────────────────────────────────────────┘               │
│  [Clear Signature]            Date: April 12, 2026          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  FOR FRONT DESK USE ONLY                                    │
│                                                             │
│  Processed by: [Auto-filled: Current User Name]             │
│                                                             │
│  Front Desk Signature:                                      │
│  ┌─────────────────────────────────────────┐               │
│  │                                         │               │
│  │        [Signature Pad Canvas]           │               │
│  │                                         │               │
│  └─────────────────────────────────────────┘               │
│  [Clear Signature]                                          │
│                                                             │
│  Remarks: [________________________]                        │
│                                                             │
│            [Submit & Generate PDF]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Create Guest API Request Body:
```json
{
  "name": "Cherille Antonio",
  "phoneNumber": "0917 826 8950",
  "email": "cherille@email.com",
  "country": "Philippines",
  "validIdPresented": true,
  "vehiclePlateNo": "ABC 1234",
  "reservations": [
    {
      "reservationNumber": "8412993383856",
      "roomNumber": "408",
      "roomTypeId": "uuid-of-room-type",
      "checkInDate": "2026-04-12",
      "checkOutDate": "2026-04-13",
      "checkInTime": "14:00",
      "checkOutTime": "11:00",
      "accompanyingGuests": [
        {
          "name": "Juan Dela Cruz",
          "validIdPresented": true,
          "signature": "data:image/png;base64,iVBORw0KG..."
        },
        {
          "name": "Maria Santos",
          "validIdPresented": true,
          "signature": "data:image/png;base64,iVBORw0KG..."
        }
      ]
    },
    {
      "reservationNumber": "8412993383857",
      "roomNumber": "409",
      "roomTypeId": "uuid-of-room-type",
      "checkInDate": "2026-04-12",
      "checkOutDate": "2026-04-13",
      "accompanyingGuests": []
    }
  ],
  "agreement": {
    "policyHousekeeping1": true,
    "policyHousekeeping2": true,
    "policySmoking": true,
    "policyCorkage": true,
    "policyNoPets": true,
    "policyNegligence": true,
    "policyMinors": true,
    "policyParking": true,
    "policySafe": true,
    "policyForceMajeure": true,
    "policyDataPrivacy": true,
    "guestPrintedName": "Cherille Antonio",
    "guestSignature": "data:image/png;base64,iVBORw0KG...",
    "signatureDate": "2026-04-12",
    "processedByName": "Juan Staff",
    "processedBySignature": "data:image/png;base64,iVBORw0KG...",
    "remarks": "VIP Guest"
  }
}
```

---

## 📊 Dashboard Specs (Admin/Super Admin)

### Statistics Cards
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  📅 TODAY   │  📅 WEEK    │  📅 MONTH   │  📅 YEAR    │
│    25       │    156      │    892      │   10,543    │
│   guests    │   guests    │   guests    │   guests    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**API Call:**
```
GET /api/guests/statistics?period=today
GET /api/guests/statistics?period=week
GET /api/guests/statistics?period=month
GET /api/guests/statistics?period=year
```

**Response:**
```json
{
  "totalGuests": 25,
  "totalReservations": 32,
  "byFrontDesk": [
    {
      "user": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "Dela Cruz"
      },
      "count": 15
    }
  ]
}
```

### Front Desk Activity Table
```
┌──────────────┬────────────┬────────────┬──────────┬──────────┐
│ Staff Name   │ Login Time │Logout Time │ Duration │ Status   │
├──────────────┼────────────┼────────────┼──────────┼──────────┤
│ Juan Dela C. │ 08:00 AM   │ 05:00 PM   │ 9h 0m    │ Offline  │
│ Maria Santos │ 07:30 AM   │ --         │ 10h 30m  │ 🟢 Online│
│ Pedro Garcia │ 09:00 AM   │ 06:00 PM   │ 9h 0m    │ Offline  │
└──────────────┴────────────┴────────────┴──────────┴──────────┘
```

**API Call:**
```
GET /api/sessions/front-desk-activity?period=today
```

**Response:**
```json
[
  {
    "user": {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "email": "juan@hotel.com"
    },
    "totalMinutes": 540,
    "totalHours": 9,
    "sessions": [
      {
        "id": "uuid",
        "loginAt": "2026-04-12T08:00:00Z",
        "logoutAt": "2026-04-12T17:00:00Z",
        "durationMinutes": 540,
        "isActive": false
      }
    ]
  }
]
```

---

## 🎨 UI/UX Guidelines

### Recommended Libraries
```bash
# Angular Material
ng add @angular/material

# Signature Pad
npm install signature_pad

# PDF Generation (Frontend)
npm install jspdf html2canvas

# Icons
npm install @fortawesome/fontawesome-free
# or use Angular Material Icons

# Charts (for Dashboard)
npm install ng2-charts chart.js

# Date Picker
# Already included in Angular Material
```

### Color Scheme (Suggestion)
```css
:root {
  --primary: #C41E3A;      /* Kekehyu Red */
  --primary-dark: #8B0000;
  --secondary: #1a1a2e;    /* Dark Blue */
  --accent: #FFD700;       /* Gold */
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
  --light: #f8f9fa;
  --dark: #343a40;
}
```

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 576px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 992px) { }
```

### Form Validations
- Email: valid email format
- Password: min 6 characters
- Required fields: show * indicator
- Show inline validation errors
- Disable submit button until form is valid

---

## 🔧 Angular Project Structure (Recommended)

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── storage.service.ts
│   │   └── api.service.ts
│   └── models/
│       ├── user.model.ts
│       ├── guest.model.ts
│       └── ...
├── shared/
│   ├── components/
│   │   ├── sidebar/
│   │   ├── header/
│   │   ├── signature-pad/
│   │   ├── confirmation-dialog/
│   │   └── loading-spinner/
│   ├── pipes/
│   │   └── date-format.pipe.ts
│   └── directives/
├── features/
│   ├── auth/
│   │   ├── login/
│   │   └── auth.routes.ts
│   ├── front-desk/
│   │   ├── guest-registration/
│   │   ├── my-registrations/
│   │   └── front-desk.routes.ts
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── guest-list/
│   │   ├── front-desk-activity/
│   │   └── admin.routes.ts
│   └── super-admin/
│       ├── user-management/
│       ├── room-types/
│       ├── policies/
│       ├── settings/
│       └── super-admin.routes.ts
├── layouts/
│   ├── main-layout/       (with sidebar)
│   └── auth-layout/       (no sidebar)
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

---

## 📱 Sample Screens Reference

### Login Page
- Clean, centered form
- Hotel logo on top
- Email and password fields
- "Login" button
- Optional: "Forgot Password" link

### Dashboard
- Top stats cards
- Recent guests table
- Chart showing guest trends
- Front desk activity summary

### Guest Registration Form
- Multi-section accordion or stepper
- Clear section headers
- Inline validation
- Signature pads for guest and front desk
- Policy checkboxes with full text

### Guest List (Data Table)
- Search bar
- Period filter (today/week/month)
- Columns: Name, Phone, Room(s), Check-in, Registered By, Actions
- View/Edit/Delete buttons (based on role)
- Pagination

---

## ✅ Ready Checklist for Frontend

- [ ] Setup Angular 17+ project
- [ ] Install required dependencies
- [ ] Configure environment files (API URL)
- [ ] Implement auth service with JWT handling
- [ ] Create HTTP interceptor for auth headers
- [ ] Setup route guards for authentication
- [ ] Setup role-based guards
- [ ] Create sidebar component with role-based menu
- [ ] Implement login page
- [ ] Implement logout functionality
- [ ] Create signature pad component
- [ ] Implement guest registration form
- [ ] Implement PDF generation (frontend)
- [ ] Create dashboard with stats
- [ ] Implement guest list with CRUD
- [ ] Implement front desk activity view
- [ ] Implement user management (Super Admin)
- [ ] Implement room types management
- [ ] Implement policies management
- [ ] Implement hotel settings

---

## 📞 API Testing

Use Swagger UI for testing: `http://localhost:3000/api/docs`

**Test Credentials:**
```
Super Admin:
  Email: superadmin@hotel.com
  Password: SuperAdmin123!
```

---

**Document Version:** 1.0
**Last Updated:** April 12, 2026
**Backend API Version:** 1.0.0
