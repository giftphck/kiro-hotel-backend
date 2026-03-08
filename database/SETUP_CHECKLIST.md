# Database Setup Checklist

Use this checklist to ensure all database setup tasks are completed correctly.

## Task 1.1: Set up PostgreSQL database on Supabase

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project with name "hotel-front-desk-management"
- [ ] Set strong database password and save it securely
- [ ] Select appropriate region (closest to your location)
- [ ] Wait for project provisioning to complete
- [ ] Navigate to Settings > Database in Supabase dashboard
- [ ] Copy connection string
- [ ] Copy individual connection parameters (host, port, user, password)
- [ ] Verify SSL/TLS is enabled (should be by default)
- [ ] Create `.env` file from `.env.example` template
- [ ] Fill in all connection parameters in `.env` file
- [ ] Add `.env` to `.gitignore` to prevent committing secrets

**Validation**: Test connection using Supabase SQL Editor or psql client

---

## Task 1.2: Create database schema with all tables

- [ ] Open Supabase SQL Editor
- [ ] Run `migrations/001_create_schema.sql`
- [ ] Verify all 5 tables were created:
  - [ ] `rooms` table with room_id, room_number, room_status, room_type
  - [ ] `customers` table with customer_id, name, phone_number, thai_id_card
  - [ ] `bookings` table with all required fields
  - [ ] `guests` table with guest_id, booking_id, guest_name, id_card_number
  - [ ] `room_prices` table with price_id, room_id, date, three price fields
- [ ] Verify CHECK constraints are in place:
  - [ ] room_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')
  - [ ] booking_type IN ('3_HOUR', 'DAILY', 'MONTHLY')
  - [ ] booking_status IN ('ACTIVE', 'CHECKED_OUT', 'CANCELLED')
  - [ ] number_of_guests > 0
  - [ ] deposit >= 0
  - [ ] check_out_date > check_in_date
  - [ ] Price fields >= 0
- [ ] Verify UNIQUE constraints:
  - [ ] rooms.room_number is UNIQUE
  - [ ] customers.thai_id_card is UNIQUE
  - [ ] room_prices (room_id, date) is UNIQUE
- [ ] Verify pgcrypto extension is enabled

**Validation**: Run query to list all tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## Task 1.3: Create database indexes for performance

- [ ] Run `migrations/002_create_indexes.sql`
- [ ] Verify rooms table indexes:
  - [ ] idx_rooms_status on room_status
  - [ ] idx_rooms_number on room_number
- [ ] Verify customers table indexes:
  - [ ] idx_customers_phone on phone_number
  - [ ] idx_customers_id_card on thai_id_card
- [ ] Verify bookings table indexes:
  - [ ] idx_bookings_room on room_id
  - [ ] idx_bookings_customer on customer_id
  - [ ] idx_bookings_dates on (check_in_date, check_out_date)
  - [ ] idx_bookings_status on booking_status
  - [ ] idx_bookings_checkout_date on check_out_date WHERE booking_status = 'ACTIVE'
- [ ] Verify guests table indexes:
  - [ ] idx_guests_booking on booking_id
- [ ] Verify room_prices table indexes:
  - [ ] idx_room_prices_room_date on (room_id, date)

**Validation**: Run query to list all indexes:
```sql
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## Task 1.4: Set up foreign key relationships

- [ ] Run `migrations/003_create_foreign_keys.sql`
- [ ] Verify bookings table foreign keys:
  - [ ] fk_bookings_room: bookings.room_id → rooms.room_id (ON DELETE RESTRICT)
  - [ ] fk_bookings_customer: bookings.customer_id → customers.customer_id (ON DELETE RESTRICT)
- [ ] Verify guests table foreign key:
  - [ ] fk_guests_booking: guests.booking_id → bookings.booking_id (ON DELETE CASCADE)
- [ ] Verify room_prices table foreign key:
  - [ ] fk_room_prices_room: room_prices.room_id → rooms.room_id (ON DELETE CASCADE)

**Validation**: Run query to list all foreign keys:
```sql
SELECT tc.table_name, tc.constraint_name, kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name,
       rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

---

## Complete Verification

- [ ] Run `verify_setup.sql` to perform comprehensive verification
- [ ] All checks should show "✓ PASS" status
- [ ] Review any warnings or errors
- [ ] (Optional) Run `seed_data.sql` to populate test data
- [ ] Test connection from backend application

---

## Post-Setup Tasks

- [ ] Document connection string in team documentation (without password)
- [ ] Share `.env.example` with team members
- [ ] Set up database backups in Supabase (automatic in free tier)
- [ ] Configure database monitoring/alerts if needed
- [ ] Test database connection from backend application
- [ ] Proceed to Task 2: Backend project setup

---

## Troubleshooting

If any step fails, refer to `README.md` troubleshooting section or:

1. **Migration fails**: Check error message, verify previous migrations ran successfully
2. **Connection fails**: Verify password, SSL settings, and network connectivity
3. **Permission errors**: Ensure you're using the postgres user with full privileges
4. **Constraint violations**: Check that table is empty before adding constraints

---

## Success Criteria

✅ All 5 tables created with correct structure
✅ All 11+ indexes created
✅ All 4 foreign key relationships established
✅ All CHECK and UNIQUE constraints in place
✅ pgcrypto extension enabled
✅ Connection string configured in .env file
✅ Verification script passes all checks

**Status**: Task 1 Complete ✓

You can now proceed to Task 2: Backend project setup and core infrastructure.
