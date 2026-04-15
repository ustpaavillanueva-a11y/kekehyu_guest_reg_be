# Kekehyu Hotel - Backend API Guide

> Documentation for Frontend Integration

---

## Base URL

```
Development: http://localhost:3000/api
Production: [Your deployed URL]/api
```

## Authentication

All protected endpoints require JWT Bearer token in header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Endpoint

```http
POST /api/auth/login
```

**Request:**
```json
{
  "email": "frontdesk@hotel.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "frontdesk@hotel.com",
    "role": "front_desk"
  }
}
```

---

## Endpoints

### Room Types

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/room-types` | ✅ | Front Desk, Admin, Super Admin |
| GET | `/room-types/active` | ✅ | Front Desk, Admin, Super Admin |
| GET | `/room-types/:id` | ✅ | Front Desk, Admin, Super Admin |
| POST | `/room-types` | ✅ | Super Admin |
| PATCH | `/room-types/:id` | ✅ | Super Admin |
| DELETE | `/room-types/:id` | ✅ | Super Admin |
| POST | `/room-types/seed` | ✅ | Super Admin |

### Hotel Settings

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/hotel-settings` | ✅ | Front Desk, Admin, Super Admin |
| PATCH | `/hotel-settings` | ✅ | Super Admin |
| GET | `/hotel-settings/policies` | ✅ | Front Desk, Admin, Super Admin |
| GET | `/hotel-settings/policies/active` | ✅ | Front Desk, Admin, Super Admin |
| GET | `/hotel-settings/policies/category?category=X` | ✅ | Front Desk, Admin, Super Admin |
| POST | `/hotel-settings/policies` | ✅ | Super Admin |
| GET | `/hotel-settings/policies/:id` | ✅ | Front Desk, Admin, Super Admin |

### Guests

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/guests` | ✅ | Front Desk, Super Admin |
| GET | `/guests` | ✅ | Front Desk, Admin, Super Admin |
| GET | `/guests/statistics?period=X` | ✅ | Admin, Super Admin |
| GET | `/guests/period?period=X` | ✅ | Admin, Super Admin |
| GET | `/guests/monthly-comparison` | ✅ | Admin, Super Admin |

---

## Guest Registration Payload

### `POST /api/guests`

**Full Request Body:**

```json
{
  "firstName": "Cherille",
  "lastName": "Antonio",
  "middleName": "Santos",
  "phoneNumber": "0917 826 8950",
  "email": "guest@email.com",
  "country": "Philippines",
  "validIdPresented": true,
  "vehiclePlateNo": "ABC 1234",

  "reservations": [
    {
      "reservationNumber": "8412993383856",
      "roomNumber": "408",
      "roomTypeId": "uuid-of-room-type",
      "checkInDate": "2026-04-08",
      "checkOutDate": "2026-04-09",
      "checkInTime": "14:00",
      "checkOutTime": "11:00",
      "accompanyingGuests": [
        {
          "firstName": "Juan",
          "lastName": "Dela Cruz",
          "middleName": "Santos",
          "validIdPresented": true,
          "signature": "data:image/png;base64,..."
        }
      ]
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
    "guestSignature": "data:image/png;base64,...",
    "signatureDate": "2026-04-08",
    "processedByName": "Front Desk Staff",
    "processedBySignature": "data:image/png;base64,...",
    "remarks": "Optional remarks"
  }
}
```

### Field Reference

#### Main Guest (Required)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `firstName` | string | ✅ | "Cherille" |
| `lastName` | string | ✅ | "Antonio" |
| `validIdPresented` | boolean | ✅ | true |

#### Main Guest (Optional)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `middleName` | string | ❌ | "Santos" |
| `phoneNumber` | string | ❌ | "0917 826 8950" |
| `email` | string (email) | ❌ | "guest@email.com" |
| `country` | string | ❌ | "Philippines" |
| `vehiclePlateNo` | string | ❌ | "ABC 1234" |

#### Reservation (Required Array, min 1)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `reservationNumber` | string | ✅ | "8412993383856" |
| `roomNumber` | string | ✅ | "408" |
| `checkInDate` | ISO date string | ✅ | "2026-04-08" |
| `roomTypeId` | UUID | ❌ | "uuid-here" |
| `checkOutDate` | ISO date string | ❌ | "2026-04-09" |
| `checkInTime` | string | ❌ | "14:00" |
| `checkOutTime` | string | ❌ | "11:00" |
| `accompanyingGuests` | array | ❌ | See below |

#### Accompanying Guest

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `firstName` | string | ✅ | "Juan" |
| `lastName` | string | ✅ | "Dela Cruz" |
| `validIdPresented` | boolean | ✅ | true |
| `middleName` | string | ❌ | "Santos" |
| `signature` | string (base64) | ❌ | "data:image/png;base64,..." |

#### Agreement (Required Object)

| Field | Type | Required |
|-------|------|----------|
| `policyHousekeeping1` | boolean | ✅ |
| `policyHousekeeping2` | boolean | ✅ |
| `policySmoking` | boolean | ✅ |
| `policyCorkage` | boolean | ✅ |
| `policyNoPets` | boolean | ✅ |
| `policyNegligence` | boolean | ✅ |
| `policyMinors` | boolean | ✅ |
| `policyParking` | boolean | ✅ |
| `policySafe` | boolean | ✅ |
| `policyForceMajeure` | boolean | ✅ |
| `policyDataPrivacy` | boolean | ✅ |
| `guestPrintedName` | string | ✅ |
| `guestSignature` | string (base64) | ✅ |
| `signatureDate` | ISO date string | ✅ |
| `processedByName` | string | ✅ |
| `processedBySignature` | string (base64) | ✅ |
| `remarks` | string | ❌ |

---

## TypeScript Interfaces

```typescript
interface AccompanyingGuest {
  firstName: string;
  lastName: string;
  middleName?: string;
  validIdPresented: boolean;
  signature?: string;
}

interface Reservation {
  reservationNumber: string;
  roomNumber: string;
  roomTypeId?: string;
  checkInDate: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  accompanyingGuests?: AccompanyingGuest[];
}

interface GuestAgreement {
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
  guestSignature: string;
  signatureDate: string;
  processedByName: string;
  processedBySignature: string;
  remarks?: string;
}

interface CreateGuestPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  email?: string;
  country?: string;
  validIdPresented: boolean;
  vehiclePlateNo?: string;
  reservations: Reservation[];
  agreement: GuestAgreement;
}
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 500 | Server Error |

### Validation Error Response

```json
{
  "statusCode": 400,
  "message": [
    "firstName must be a string",
    "reservations must be an array"
  ],
  "error": "Bad Request"
}
```

---

## Swagger Documentation

Interactive API documentation available at:

```
http://localhost:3000/api/docs
```

---

## Notes

- All dates should be ISO format: `YYYY-MM-DD`
- Signatures should be base64 encoded images
- JWT tokens expire in 1 day
- Refresh tokens expire in 7 days
