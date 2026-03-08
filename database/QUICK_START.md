# Quick Start Guide - Database Setup

**Estimated Time: 15-20 minutes**

This is a condensed guide to get your database up and running quickly. For detailed information, see `README.md`.

## Prerequisites

- [ ] Web browser
- [ ] Internet connection

## Step 1: Create Supabase Project (5 min)

1. Go to https://supabase.com and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `hotel-front-desk-management`
   - **Password**: Choose a strong password (SAVE THIS!)
   - **Region**: Select closest to you
4. Click **"Create new project"**
5. Wait 1-2 minutes for provisioning

## Step 2: Get Connection Info (2 min)

1. In Supabase dashboard, click **Settings** (gear icon)
2. Click **Database** in left menu
3. Scroll to **Connection string** section
4. Copy the **URI** format connection string
5. Note your **Project Reference** (in the URL: `[PROJECT-REF].supabase.co`)

## Step 3: Configure Environment (2 min)

1. Copy `database/.env.example` to `database/.env`
2. Open `database/.env` in a text editor
3. Replace `[YOUR-PASSWORD]` with your database password from Step 1
4. Replace `[PROJECT-REF]` with your project reference from Step 2
5. Save the file

**Example:**
```env
DATABASE_URL=postgresql://postgres:MySecurePass123@abcdefghijklmnop.supabase.co:5432/postgres
DB_HOST=abcdefghijklmnop.supabase.co
DB_PASSWORD=MySecurePass123
```

## Step 4: Run Migrations (5 min)

### Using Supabase SQL Editor (Recommended)

1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click **"New query"**

3. **Run Migration 1 - Create Tables:**
   - Open `database/migrations/001_create_schema.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for green checkmark ✓

4. **Run Migration 2 - Create Indexes:**
   - Open `database/migrations/002_create_indexes.sql`
   - Copy all contents
   - Paste into SQL Editor (new query)
   - Click **"Run"**
   - Wait for green checkmark ✓

5. **Run Migration 3 - Create Foreign Keys:**
   - Open `database/migrations/003_create_foreign_keys.sql`
   - Copy all contents
   - Paste into SQL Editor (new query)
   - Click **"Run"**
   - Wait for green checkmark ✓

## Step 5: Verify Setup (2 min)

1. In SQL Editor, create a **new query**
2. Copy and paste this verification query:

```sql
-- Quick verification
SELECT 'Tables' as check_type, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 'Indexes', COUNT(*) 
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
UNION ALL
SELECT 'Foreign Keys', COUNT(*) 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
```

3. Click **"Run"**
4. Verify results:
   - Tables: **5**
   - Indexes: **11** (or more)
   - Foreign Keys: **4**

✅ If you see these numbers, setup is complete!

## Step 6: Add Test Data (Optional, 2 min)

1. In SQL Editor, create a **new query**
2. Open `database/seed_data.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify: You should see 15 rooms created

## Troubleshooting

### ❌ Migration fails with "relation already exists"
**Solution:** Tables already exist. Either:
- Skip to next migration, OR
- Drop tables and re-run (⚠️ deletes data)

### ❌ Connection fails
**Solution:** Check:
- Password is correct
- Project reference is correct
- No typos in `.env` file

### ❌ Permission denied
**Solution:** Ensure you're using the `postgres` user (default in Supabase)

## What's Next?

✅ **Database setup complete!**

You can now proceed to:
- **Task 2**: Backend project setup
- **Task 3**: Backend repository layer

See `TASK_1_COMPLETION_SUMMARY.md` for details on what was created.

## Need More Help?

- **Detailed guide**: See `README.md`
- **Step-by-step checklist**: See `SETUP_CHECKLIST.md`
- **Schema reference**: See `SCHEMA_REFERENCE.md`
- **Full verification**: Run `verify_setup.sql`

## Files Created

```
database/
├── migrations/
│   ├── 001_create_schema.sql      ← Run first
│   ├── 002_create_indexes.sql     ← Run second
│   └── 003_create_foreign_keys.sql ← Run third
├── verify_setup.sql               ← Full verification
├── seed_data.sql                  ← Optional test data
├── .env.example                   ← Template (copy to .env)
└── README.md                      ← Detailed guide
```

## Success Checklist

- [x] Supabase project created
- [x] Connection credentials obtained
- [x] `.env` file configured
- [x] Migration 1 executed (tables)
- [x] Migration 2 executed (indexes)
- [x] Migration 3 executed (foreign keys)
- [x] Verification passed (5 tables, 11 indexes, 4 FKs)
- [ ] Optional: Test data seeded

**Congratulations! Your database is ready! 🎉**
