# Backend TODO - Guest Registration System

**Date:** April 16, 2026  
**Priority:** High → Medium → Low

---

## 🔴 HIGH PRIORITY

### 1. Room Type - Accept String Name Instead of UUID

**Current Issue:**
```
POST /api/guests → 400 Bad Request
Error: "reservations.0.roomTypeId must be a UUID"
```

**What Frontend Sends Now:**
```json
{
  "reservations": [
    {
      "roomType": "JUNIOR EXECUTIVE (KING BED) (CORPORATE RATE 2026-BF)",
      "roomNumber": "502, 506",
      "checkInDate": "2026-04-15",
      "checkOutDate": "2026-04-16"
    }
  ]
}
```

**Backend Changes Needed:**

#### A. Update CreateReservationDto
```typescript
// src/guests/dto/create-reservation.dto.ts

export class CreateReservationDto {
  @IsString()
  roomType: string;  // ← Accept string name, NOT UUID

  @IsString()
  roomNumber: string;

  @IsDateString()
  checkInDate: string;

  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;
}
```

#### B. Add Room Type Lookup in GuestsService
```typescript
// src/guests/guests.service.ts

async create(createGuestDto: CreateGuestDto): Promise<Guest> {
  // Convert room type name to UUID for each reservation
  const reservationsWithRoomTypeId = await Promise.all(
    createGuestDto.reservations.map(async (res) => {
      // Find room type by name
      const roomType = await this.roomTypeRepository.findOne({
        where: { name: res.roomType }
      });
      
      if (!roomType) {
        throw new BadRequestException(`Room type "${res.roomType}" not found`);
      }
      
      return {
        ...res,
        roomTypeId: roomType.id,  // Use the UUID
      };
    })
  );

  // Create guest with resolved room type IDs
  const guest = this.guestRepository.create({
    ...createGuestDto,
    reservations: reservationsWithRoomTypeId,
  });

  return this.guestRepository.save(guest);
}
```

---

### 2. Email Field - Make Optional

**Current Issue:**
```
POST /api/guests → 400 Bad Request
Error: "email must be an email"
```

**What Frontend Sends:**
- WITH email: `{ "email": "guest@example.com", ... }`
- WITHOUT email: `{ "firstName": "John", ... }` (email field omitted)

**Backend Changes Needed:**

```typescript
// src/guests/dto/create-guest.dto.ts

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;  // ← Make OPTIONAL, only validate if provided

  @IsOptional()
  @IsString()
  country?: string;

  // ... rest of fields
}
```

**Database:**
```typescript
// src/guests/entities/guest.entity.ts

@Column({ type: 'varchar', nullable: true })  // ← Nullable
email?: string;
```

---

## 🟡 MEDIUM PRIORITY

### 3. PDF Path Storage

**Current Issue:**
```
PATCH /api/guests/:id → 400 Bad Request
```

Frontend tries to save PDF URL after generating registration PDF.

**What Frontend Sends:**
```json
{
  "pdfPath": "http://localhost:3000/uploads/Registration_xxx.pdf"
}
```

**Backend Changes Needed:**

#### A. Add pdfPath to Guest Entity
```typescript
// src/guests/entities/guest.entity.ts

@Column({ type: 'varchar', nullable: true })
pdfPath?: string;
```

#### B. Add to UpdateGuestDto
```typescript
// src/guests/dto/update-guest.dto.ts

@IsOptional()
@IsString()
pdfPath?: string;
```

#### C. Allow front_desk role to update (if using role guards)
```typescript
// src/guests/guests.controller.ts

@Patch(':id')
@Roles('admin', 'front_desk')  // ← Add front_desk
async update(@Param('id') id: string, @Body() updateGuestDto: UpdateGuestDto) {
  return this.guestsService.update(id, updateGuestDto);
}
```

---

## 🟢 LOW PRIORITY (Optional)

### 4. PDF Upload Endpoint

If not yet implemented:

```typescript
// src/guests/guests.controller.ts

@Post(':id/upload-pdf')
@UseInterceptors(FileInterceptor('pdf'))
@Roles('front_desk', 'admin')
async uploadPdf(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File
): Promise<{ message: string; pdfUrl: string }> {
  const pdfUrl = await this.guestsService.savePdf(id, file);
  return { message: 'PDF uploaded successfully', pdfUrl };
}
```

---

## 📋 Complete Payload Example

### Request: POST /api/guests
```json
{
  "firstName": "Getz",
  "lastName": "Pharma- Alex",
  "middleName": "",
  "phoneNumber": "+639155092379",
  "email": "reservations.kekehyuhotel@gmail.com",
  "country": "Philippines",
  "vehiclePlateNo": "",
  "validIdPresented": true,
  "reservations": [
    {
      "roomType": "JUNIOR EXECUTIVE (KING BED) (CORPORATE RATE 2026-BF), JUNIOR EXECUTIVE (KING BED) (CORPORATE RATE 2026-BF)",
      "roomNumber": "502, 506",
      "reservationNumber": "2070099469371",
      "checkInDate": "2026-04-15",
      "checkOutDate": "2026-04-16",
      "checkInTime": "14:00",
      "checkOutTime": "11:00",
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
    "guestPrintedName": "Getz Pharma- Alex",
    "guestSignature": "data:image/png;base64,...",
    "signatureDate": "2026-04-16",
    "processedByName": "John Doe",
    "processedBySignature": "data:image/png;base64,...",
    "remarks": ""
  }
}
```

### Expected Response: 201 Created
```json
{
  "id": "uuid-here",
  "firstName": "Getz",
  "lastName": "Pharma- Alex",
  "reservations": [
    {
      "id": "reservation-uuid",
      "roomTypeId": "resolved-room-type-uuid",
      "roomNumber": "502, 506"
    }
  ],
  "createdAt": "2026-04-16T00:00:00.000Z"
}
```

---

## ✅ Testing Checklist

- [ ] POST /api/guests with `roomType` as string name → 201 Created
- [ ] POST /api/guests without email field → 201 Created  
- [ ] POST /api/guests with email field → 201 Created
- [ ] POST /api/guests with `phoneNumber` → verify it's saved and returned
- [ ] POST /api/guests with invalid room type name → 400 Bad Request with helpful message
- [ ] GET /api/guests/:id → verify `phoneNumber` is returned
- [ ] GET /api/guests/:id → verify `reservations[0].roomType` is returned (as string or object with name)
- [ ] PATCH /api/guests/:id with `pdfPath` → 200 OK
- [ ] PATCH /api/guests/:id by front_desk role → 200 OK (not 403 Forbidden)

---

## 🚀 Quick Summary

| Change | File | Field | Action |
|--------|------|-------|--------|
| Room Type | create-reservation.dto.ts | `roomType` | Accept string, convert to UUID in service |
| Email | create-guest.dto.ts | `email` | Add `@IsOptional()` decorator |
| PDF Path | guest.entity.ts | `pdfPath` | Add nullable column |
| PDF Path | update-guest.dto.ts | `pdfPath` | Add optional field |
| Permissions | guests.controller.ts | PATCH | Allow `front_desk` role |

---

## 📞 Questions?

Kung may tanong, check the frontend console logs - may debug output para makita kung ano exactly ang sinend na data.

