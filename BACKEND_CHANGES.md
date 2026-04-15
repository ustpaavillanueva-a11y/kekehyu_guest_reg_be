# Backend Changes - Guest Registration API

**Date:** April 15, 2026  
**Frontend Status:** Simplified to send all values as strings from PDF  
**Backend Responsibility:** Handle string-to-UUID conversions and data validation

---

## Overview

Frontend has been refactored to **remove UUID conversion logic**. Instead of attempting to match room type names to UUIDs on the client, **the backend now receives room type as a string name and must handle the lookup**.

---

## 1. Room Type Field - String to UUID Conversion

### What's Changing

**Frontend sends:**
```json
{
  "reservations": [
    {
      "roomType": "Standard Room",
      "roomNumber": "101",
      "checkInDate": "2026-04-15",
      "checkOutDate": "2026-04-18",
      "checkInTime": "14:00",
      "checkOutTime": "11:00"
    }
  ]
}
```

**NOT this:**
```json
{
  "roomTypeId": "uuid-here"
}
```

### Backend Implementation

1. **Update DTO** - Change field name and type:
   ```typescript
   // create-guest.dto.ts
   export class CreateReservationDto {
     roomType: string;  // ← Accept as STRING, not UUID
     roomNumber: string;
     checkInDate: string; // "2026-04-15"
     checkOutDate?: string;
     checkInTime?: string;
     checkOutTime?: string;
     accompaningGuests?: CreateAccompanyingGuestDto[];
   }
   ```

2. **Room Type Lookup Service** - Add method to convert room type name to UUID:
   ```typescript
   // room-type.service.ts
   async resolveRoomTypeId(roomTypeName: string): Promise<string> {
     const roomType = await this.roomTypeRepository.findOne({
       where: { name: roomTypeName }
     });
     
     if (!roomType) {
       throw new BadRequestException(
         `Room type "${roomTypeName}" not found`
       );
     }
     
     return roomType.id; // UUID
   }
   ```

3. **Guest Service - Create Guest** - Call lookup before saving:
   ```typescript
   // guest.service.ts
   async createGuest(createGuestDto: CreateGuestDto): Promise<Guest> {
     // Resolve room type name → UUID for each reservation
     const reservations = await Promise.all(
       createGuestDto.reservations.map(async (res) => ({
         ...res,
         roomTypeId: await this.roomTypeService.resolveRoomTypeId(res.roomType),
       }))
     );
     
     // Remove 'roomType' field, keep only 'roomTypeId'
     const guestData = {
       ...createGuestDto,
       reservations: reservations.map(({ roomType, ...rest }) => rest),
     };
     
     return this.guestRepository.save(guestData);
   }
   ```

### Error Handling

```typescript
if (roomTypeName && !roomType) {
  throw new BadRequestException({
    message: 'Invalid room type',
    field: 'reservations.roomType',
    value: roomTypeName
  });
}
```

---

## 2. Email Field - Optional/Conditional

### What's Changing

**With Email:**
```json
{
  "firstName": "John",
  "email": "john@example.com",
  "phoneNumber": "09123456789"
}
```

**Without Email (field omitted entirely):**
```json
{
  "firstName": "John",
  "phoneNumber": "09123456789"
}
```

### Backend Implementation

1. **Update DTO** - Make email optional:
   ```typescript
   // create-guest.dto.ts
   export class CreateGuestDto {
     firstName: string;
     lastName: string;
     middleName?: string;
     phoneNumber?: string;
     email?: string;  // ← Optional, not required
     country?: string;
     vehiclePlateNo?: string;
     validIdPresented?: boolean;
     reservations: CreateReservationDto[];
     agreement: CreateAgreementDto;
   }
   ```

2. **Update Validation** - Email only validated when present:
   ```typescript
   import { IsEmail, IsOptional } from 'class-validator';
   
   export class CreateGuestDto {
     // ... other fields
     
     @IsOptional()
     @IsEmail()
     email?: string;  // Only validate email format if provided
   }
   ```

3. **Database** - Email column should be nullable:
   ```typescript
   // guest.entity.ts
   @Column({ type: 'varchar', nullable: true })
   email?: string;
   ```

---

## 3. Complete Payload Example

### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "phoneNumber": "09123456789",
  "email": "john@example.com",
  "country": "Philippines",
  "vehiclePlateNo": "ABC1234",
  "validIdPresented": true,
  "reservations": [
    {
      "roomType": "Standard Room",
      "roomNumber": "101",
      "checkInDate": "2026-04-15",
      "checkOutDate": "2026-04-18",
      "checkInTime": "14:00",
      "checkOutTime": "11:00",
      "accompaningGuests": [
        {
          "firstName": "Jane",
          "lastName": "Doe",
          "middleName": "",
          "validIdPresented": false
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
    "guestPrintedName": "John Michael Doe",
    "guestSignature": "data:image/png;base64,...",
    "signatureDate": "2026-04-15",
    "processedByName": "Front Desk Staff",
    "processedBySignature": "data:image/png;base64,...",
    "remarks": "Optional remarks"
  }
}
```

### Success Response (200 OK)

```json
{
  "id": "uuid-of-guest",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "09123456789",
  "reservations": [
    {
      "id": "uuid-of-reservation",
      "roomTypeId": "uuid-of-room-type",
      "roomNumber": "101",
      "checkInDate": "2026-04-15",
      "checkOutDate": "2026-04-18"
    }
  ],
  "createdAt": "2026-04-15T10:30:00Z"
}
```

---

## 4. Migration Checklist

- [ ] Update `CreateReservationDto` to accept `roomType` as string
- [ ] Update `CreateGuestDto` to make `email` optional
- [ ] Add room type lookup service method
- [ ] Update guest creation service to convert room type name → UUID
- [ ] Make email column nullable in database
- [ ] Add email optional validation decorator
- [ ] Test with email provided
- [ ] Test with email omitted
- [ ] Test with valid room type name
- [ ] Test with invalid room type name (should error)
- [ ] Verify database stores correct UUID in `roomTypeId`

---

## 5. Testing Scenarios

### Scenario 1: Full Data with Email
```
POST /api/guests
Body: Complete payload with email
Expected: 200 OK, guest created with UUID-based room type
```

### Scenario 2: Data without Email
```
POST /api/guests
Body: Complete payload WITHOUT email field
Expected: 200 OK, guest created, email is NULL/undefined
```

### Scenario 3: Invalid Room Type
```
POST /api/guests
Body: roomType = "Non-Existent Room Type"
Expected: 400 Bad Request, error message about invalid room type
```

### Scenario 4: Valid Room Type Name
```
POST /api/guests
Body: roomType = "Standard Room" (exists in database)
Expected: 200 OK, reservation stored with correct roomTypeId UUID
```

---

## 6. Key Points

✅ **Frontend sends:** Room type as STRING name from PDF  
✅ **Backend handles:** Room type name → UUID conversion  
✅ **Email:** Optional field, only validated if provided  
✅ **All other fields:** Remain as strings, no conversion needed  
✅ **Database:** Store UUID in `roomTypeId`, not the string  

---

## 7. Field Comparison

| Field | Old Behavior | New Behavior |
|-------|--------------|--------------|
| `reservations[].roomType` | NOT sent | String name (e.g., "Standard Room") |
| `reservations[].roomTypeId` | UUID sent from frontend | UUID stored in DB (backend converts) |
| `email` | Always required/sent | Optional, only if non-empty |
| All other fields | Strings | Strings ✓ |

---

## 8. Questions for Implementation

1. Are room type names guaranteed to be unique in the database?
2. Should we handle case-insensitive room type lookup?
3. What error message format do you want for invalid room types?
4. Should we log the room type conversion for debugging?
5. Are there any rate limits or caching needed for room type lookups?

---

## 9. Implementation Order

1. **First:** Update DTOs
2. **Second:** Add room type resolution logic
3. **Third:** Update guest service to use room type resolution
4. **Fourth:** Make email optional in validation
5. **Fifth:** Test all scenarios
6. **Sixth:** Deploy changes

---

## Notes

- Frontend will no longer attempt UUID matching
- This simplifies the frontend significantly and reduces duplicate logic
- All data from PDF comes as strings - backend is responsible for correct storage
- Email validation only triggers if email is provided in payload

