# Migration Setup - Room Types Backup

**Status:** ✅ Migration file created  
**File:** `src/migrations/1776320503012-AddRoomTypesBackupToGuestAgreements.ts`

---

## Quick Start

### Option 1: Update TypeORM Config to Auto-Run Migrations (Recommended)

Add migrations configuration to `src/app.module.ts`:

```typescript
TypeOrmModule.forRootAsync({
  // ... existing config ...
  useFactory: (configService: ConfigService) => ({
    // ... existing settings ...
    synchronize: configService.get('NODE_ENV') === 'development',
    
    // ADD THIS:
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    migrationsRun: configService.get('NODE_ENV') === 'production',  // Auto-run in prod
    
    // ... rest of config ...
  }),
})
```

Then restart your app - migration runs automatically!

---

### Option 2: Run Migration Manually (Without Code Changes)

**If you want to run migration without changing config:**

```bash
# Build project first
npm run build

# Run migration using CLI
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/database.config.ts migration:run

# OR using Node directly on built project
node dist/main.js  # Runs migration if config is set up
```

---

### Option 3: Run Direct SQL (Fastest, No Dependencies)

If you have database admin access, run directly:

```sql
ALTER TABLE guest_agreements
ADD COLUMN room_types_backup VARCHAR(500) NULL DEFAULT NULL;
```

---

## Current Migration File

**Location:** `src/migrations/1776320503012-AddRoomTypesBackupToGuestAgreements.ts`

**What it does:**
- ✅ Adds `room_types_backup` column to `guest_agreements` table
- ✅ Type: VARCHAR(500)
- ✅ Nullable: true
- ✅ Reversible: `down()` drops the column if needed

---

## Verify Migration

After running migration (any method above):

```sql
-- Check column exists and correct
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guest_agreements' 
AND column_name = 'room_types_backup';

-- Should return:
-- column_name: room_types_backup
-- data_type: character varying
-- is_nullable: YES
```

---

## What's Next

1. ✅ Code changes: Backend entity + DTO done
2. ⏳ **Database migration: Run ONE of the 3 options above**
3. Then test:
   ```bash
   npm start
   # Register a guest with roomTypesBackup
   # Verify it's saved in database
   ```

---

## Troubleshooting

**If migration fails:**

1. Check database connection in `.env`
2. Verify password/permissions correct
3. Check table `guest_agreements` exists
4. Run manual SQL as last resort

**If table doesn't exist yet:**
- Let `synchronize: true` create it first
- Then run migration

