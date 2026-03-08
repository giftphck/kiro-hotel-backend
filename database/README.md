# Database Setup Guide

This guide walks you through setting up the PostgreSQL database on Supabase for the Hotel Front Desk Management System.

## Prerequisites

- A Supabase account (free tier is sufficient)
- PostgreSQL client or Supabase SQL Editor

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: hotel-front-desk-management (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your location
   - **Pricing Plan**: Free tier is sufficient for development
5. Click "Create new project"
6. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Get Connection Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Navigate to "Database" section
3. Find the "Connection string" section
4. Copy the connection string in the format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1

### Connection Details

You'll also find these individual connection parameters:
- **Host**: `[PROJECT-REF].supabase.co`
- **Database**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: Your database password
- **SSL Mode**: `require` (Supabase requires SSL/TLS)

## Step 3: Configure Environment Variables

Create a `.env` file in your backend project root:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
DB_HOST=[PROJECT-REF].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]
DB_SSL=true

# Scheduler Configuration (for automated checkout)
SCHEDULER_API_KEY=your-secure-random-api-key-here

# Application Configuration
NODE_ENV=development
PORT=3000
```

**Important**: 
- Never commit the `.env` file to version control
- Add `.env` to your `.gitignore` file
- Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual values

## Step 4: Run Database Migrations

Execute the SQL migration files in order using the Supabase SQL Editor:

### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste the contents of each migration file in order:
   - `migrations/001_create_schema.sql`
   - `migrations/002_create_indexes.sql`
   - `migrations/003_create_foreign_keys.sql`
4. Click "Run" for each migration
5. Verify that all queries executed successfully (green checkmarks)

### Option B: Using psql Command Line

If you have PostgreSQL client installed:

```bash
# Navigate to the database directory
cd database

# Run migrations in order
psql "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" -f migrations/001_create_schema.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" -f migrations/002_create_indexes.sql
psql "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" -f migrations/003_create_foreign_keys.sql
```

## Step 5: Verify Database Setup

Run this verification query in the Supabase SQL Editor:

```sql
-- Check that all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected output: bookings, customers, guests, room_prices, rooms

-- Check that all indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check that all foreign keys were created
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

## Step 6: Seed Initial Data (Optional)

You can add some initial test data to verify the setup:

```sql
-- Insert test rooms
INSERT INTO rooms (room_number, room_status, room_type) VALUES
  ('101', 'AVAILABLE', 'Standard'),
  ('102', 'AVAILABLE', 'Standard'),
  ('103', 'AVAILABLE', 'Deluxe'),
  ('201', 'AVAILABLE', 'Standard'),
  ('202', 'AVAILABLE', 'Deluxe'),
  ('203', 'AVAILABLE', 'Suite');

-- Verify rooms were created
SELECT * FROM rooms ORDER BY room_number;
```

## Database Schema Overview

### Tables

1. **rooms**: Stores room information and current status
2. **customers**: Stores customer contact and identification information
3. **bookings**: Stores booking records with dates, type, and status
4. **guests**: Stores individual guest information for each booking
5. **room_prices**: Stores date-specific pricing for rooms

### Relationships

- `bookings.room_id` → `rooms.room_id` (ON DELETE RESTRICT)
- `bookings.customer_id` → `customers.customer_id` (ON DELETE RESTRICT)
- `guests.booking_id` → `bookings.booking_id` (ON DELETE CASCADE)
- `room_prices.room_id` → `rooms.room_id` (ON DELETE CASCADE)

## Connection Security

Supabase enforces SSL/TLS connections by default. When connecting from your application:

- Always use `sslmode=require` in connection strings
- Supabase provides automatic SSL certificate management
- Connection pooling is handled by Supabase's connection pooler

## Troubleshooting

### Connection Issues

If you can't connect to the database:
1. Verify your password is correct
2. Check that SSL is enabled (`sslmode=require`)
3. Ensure your IP is not blocked (Supabase free tier allows all IPs by default)
4. Check Supabase project status in the dashboard

### Migration Errors

If a migration fails:
1. Check the error message in the SQL Editor
2. Verify you ran migrations in the correct order
3. Check if tables already exist (you may need to drop and recreate)
4. Ensure the pgcrypto extension is enabled

### Performance Issues

If queries are slow:
1. Verify all indexes were created (run verification query)
2. Check query execution plans using `EXPLAIN ANALYZE`
3. Monitor database usage in Supabase dashboard
4. Consider upgrading from free tier if needed

## Next Steps

After completing the database setup:
1. Test the connection from your backend application
2. Implement the backend repository layer to interact with these tables
3. Create API endpoints for CRUD operations
4. Set up the automated scheduler for check-out processing

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection Pooling Best Practices](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
