# Backend Implementation - Room Type Backup Mechanism

**Date:** April 16, 2026  
**Status:** Code changes complete, awaiting database migration  
**Action:** Run migration and test

---

## Summary of Changes

✅ **Code Changes:**
- Added `roomTypesBackup` field to `GuestAgreement` entity
- Updated `GuestAgreementDto` with validation for new field
- Service already handles spread operator for automatic mapping

⏳ **Pending:** Database schema migration

---

## Files Modified (Backend)

### 1. Entity Definition
**File:** `src/modules/guests/entities/guest-agreement.entity.ts`

```typescript
@ApiPropertyOptional({ description: 'Backup room types for PDF fallback (comma-separated)' })
@Column({ name: 'room_types_backup', length: 500, nullable: true })
roomTypesBackup: string;
```

- **Type:** VARCHAR(500) nullable
- **Import:** Added `ApiPropertyOptional` to imports
- **Behavior:** Optional field, stores comma-separated room type names

### 2. DTO Validation
**File:** `src/modules/guests/dto/create-guest.dto.ts`

```typescript
@ApiPropertyOptional({ description: 'Backup room types for PDF fallback (comma-separated)' })
@IsString()
@IsOptional()
roomTypesBackup?: string;
```

- **Validation:** String, optional
- **Max Length:** 500 characters (enforced in entity)
- **API Documentation:** Included in Swagger

### 3. Service Layer
**File:** `src/modules/guests/guests.service.ts`

**No changes needed** - Service already handles new field via spread operator:
```typescript
const agreement = this.agreementRepository.create({
  guestId: savedGuest.id,
  ...createGuestDto.agreement,  // ← Automatically includes roomTypesBackup
  signatureDate: new Date(createGuestDto.agreement.signatureDate),
});
```

---

## Database Migration

### For TypeORM with Migration Files

**Create migration file:**
```bash
npm run typeorm migration:create src/migrations/AddRoomTypesBackupToGuestAgreements
```

**Edit generated file** `src/migrations/<timestamp>-AddRoomTypesBackupToGuestAgreements.ts`:

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoomTypesBackupToGuestAgreements1713225600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'guest_agreements',
      new TableColumn({
        name: 'room_types_backup',
        type: 'varchar',
        length: '500',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('guest_agreements', 'room_types_backup');
  }
}
```

**Run migration:**
```bash
npm run typeorm migration:run
```

---

### For Manual SQL (Direct Database)

**PostgreSQL:**
```sql
ALTER TABLE guest_agreements
ADD COLUMN room_types_backup VARCHAR(500) NULL DEFAULT NULL;
```

**MySQL:**
```sql
ALTER TABLE guest_agreements
ADD COLUMN room_types_backup VARCHAR(500) NULL DEFAULT NULL;
```

**SQLite:**
```sql
ALTER TABLE guest_agreements
ADD COLUMN room_types_backup VARCHAR(500) NULL;
```

**SQL Server:**
```sql
ALTER TABLE guest_agreements
ADD room_types_backup VARCHAR(500) NULL;
```

---

## Data Flow

### Registration Submission (POST /api/guests)

**Frontend sends:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "reservations": [
    { "roomType": "JUNIOR SUITE", "roomNumber": "101" }
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
    "guestPrintedName": "John Doe",
    "guestSignature": "data:image/png;base64,...",
    "signatureDate": "2026-04-16",
    "processedByName": "Front Desk Staff",
    "processedBySignature": "data:image/png;base64,...",
    "roomTypesBackup": "JUNIOR SUITE, DELUXE ROOM"  // ← New field
  }
}
```

**Backend processing:**
1. Validates `roomTypesBackup` via DTO (optional, max 500 chars)
2. Creates guest record
3. Saves agreement with spread operator (includes roomTypesBackup)
4. Returns guest via `findOne()` which includes agreement data

**API Response (200 Created):**
```json
{
  "id": "guest-123",
  "firstName": "John",
  "lastName": "Doe",
  "reservations": [ ... ],
  "agreement": {
    "id": "agree-123",
    "policyHousekeeping1": true,
    "cookieSmoking": true,
    // ... other policy fields ...
    "roomTypesBackup": "JUNIOR SUITE, DELUXE ROOM",  // ← Included!
    "createdAt": "2026-04-16T..."
  }
}
```

---

### Guest Retrieval (GET /api/guests/{id})

**Response:**
```json
{
  "id": "guest-123",
  "firstName": "John",
  "lastName": "Doe",
  "reservations": [
    {
      "id": "res-123",
      "roomType": null,  // ← May still be null
      "roomNumber": "101",
      "roomTypeId": "uuid"
    }
  ],
  "agreement": {
    "id": "agree-123",
    "roomTypesBackup": "JUNIOR SUITE, DELUXE ROOM",  // ← Fallback data
    "policyHousekeeping1": true,
    // ... other fields ...
    "createdAt": "2026-04-16T..."
  }
}
```

**Frontend fallback chain:**
1. Try `reservation.roomType.name`
2. If null → Use `guest.agreement.roomTypesBackup`
3. If still null → Display "—"

---

## Testing Checklist

### Step 1: Deploy Code Changes
- [ ] Pull latest backend code
- [ ] Run `npm install` (if any new deps)
- [ ] Rebuild TypeScript: `npm run build`

### Step 2: Run Database Migration
- [ ] Stop backend server
- [ ] Run migration: `npm run typeorm migration:run`
- [ ] Verify column added: Check database schema for `room_types_backup` column
- [ ] Start backend server

### Step 3: Test API - Registration
```bash
curl -X POST http://localhost:3000/api/guests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "validIdPresented": true,
    "reservations": [{
      "roomType": "TESTING ROOM",
      "roomNumber": "999",
      "checkInDate": "2026-04-16"
    }],
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
      "guestPrintedName": "Test User",
      "guestSignature": "base64...",
      "signatureDate": "2026-04-16",
      "processedByName": "Tester",
      "processedBySignature": "base64...",
      "roomTypesBackup": "TESTING ROOM, BACKUP ROOM"
    }
  }'
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Response includes `agreement.roomTypesBackup`
- ✅ Guest ID returned

### Step 4: Test API - Retrieval
```bash
curl -X GET http://localhost:3000/api/guests/<guestId> \
  -H "Authorization: Bearer <token>"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response includes `agreement.roomTypesBackup`
- ✅ Value matches what was sent: `"TESTING ROOM, BACKUP ROOM"`

### Step 5: Database Verification

**Check the data was saved correctly:**

```sql
SELECT 
  ga.id,
  ga.room_types_backup,
  g.first_name,
  g.last_name
FROM guest_agreements ga
JOIN guests g ON ga.guest_id = g.id
ORDER BY ga.created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ `room_types_backup` column exists
- ✅ Value is saved: `"TESTING ROOM, BACKUP ROOM"`

### Step 6: End-to-End Frontend Test
- [ ] Frontend registers guest with multiple room types
- [ ] Verify registration succeeds (no 400 error)
- [ ] Open registration PDF confirmation
- [ ] Verify room types display correctly
- [ ] Open admin guest list
- [ ] View guest PDF preview
- [ ] Verify room types display in preview PDF

---

## Rollback Plan

If issues occur:

**1. Remove the field (if needed):**
```bash
npm run typeorm migration:revert
```

**2. Or manually revert:**
```sql
ALTER TABLE guest_agreements
DROP COLUMN room_types_backup;
```

**3. Restore code:**
```bash
git checkout HEAD~1 src/modules/guests/entities/guest-agreement.entity.ts
git checkout HEAD~1 src/modules/guests/dto/create-guest.dto.ts
```

---

## API Documentation

### POST /api/guests

**New Request Body Field:**
```typescript
agreement: {
  // ... existing fields ...
  roomTypesBackup?: string;  // Comma-separated room type names
}
```

**New Response Field:**
```typescript
agreement: {
  // ... existing fields ...
  roomTypesBackup: string | null;  // Returned if provided
}
```

### Swagger/OpenAPI

Field will automatically appear in Swagger UI with description:
> "Backup room types for PDF fallback (comma-separated)"

---

## Known Issues & Notes

1. **Null roomType Issue:** Backend still returns `null` for `reservation.roomType`
   - `roomTypesBackup` is a workaround for PDF generation
   - Long-term: Fix the main `roomType` field retrieval

2. **Comma-Space Delimiter:** Uses ", " (comma-space) as separator
   - Safe for standard room type names
   - Example: `"JUNIOR SUITE, DELUXE ROOM, STANDARD ROOM"`

3. **Character Limit:** Max 500 characters
   - Supports ~15-20 typical room types
   - If more needed, increase VARCHAR length

4. **Index Mapping:** Frontend assumes reservation order matches sent order
   - If order changes in DB, index may be incorrect
   - Monitor if this becomes issue

---

## Support & Questions

**For issues:**
1. Check migration ran successfully
2. Verify column exists: `SELECT * FROM guest_agreements LIMIT 1;`
3. Check backend logs for validation errors
4. Verify DTO validation passes

**Contact:** Backend team if migration fails

---

## Timeline

| Step | Status | Deadline |
|------|--------|----------|
| Code changes | ✅ Done | - |
| Database migration | ⏳ Pending | ASAP |
| API testing | ⏳ Pending | After migration |
| Frontend integration test | ⏳ Pending | End of day |

