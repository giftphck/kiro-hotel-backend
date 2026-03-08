-- Hotel Front Desk Management System - Database Verification Script
-- Run this script to verify that the database setup is complete and correct

-- ============================================================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================================================
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✓ PASS - All 5 tables exist'
    ELSE '✗ FAIL - Expected 5 tables, found ' || COUNT(*)
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('rooms', 'customers', 'bookings', 'guests', 'room_prices');

-- List all tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. CHECK ALL INDEXES EXIST
-- ============================================================================
SELECT 
  'Indexes Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 11 THEN '✓ PASS - All indexes exist'
    ELSE '✗ FAIL - Expected at least 11 indexes, found ' || COUNT(*)
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- List all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 3. CHECK ALL FOREIGN KEYS EXIST
-- ============================================================================
SELECT 
  'Foreign Keys Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✓ PASS - All 4 foreign keys exist'
    ELSE '✗ FAIL - Expected 4 foreign keys, found ' || COUNT(*)
  END as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public';

-- List all foreign keys with details
SELECT
  tc.table_name, 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================================================
-- 4. CHECK CHECK CONSTRAINTS
-- ============================================================================
SELECT 
  'Check Constraints' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✓ PASS - Check constraints exist'
    ELSE '✗ FAIL - Expected at least 8 check constraints, found ' || COUNT(*)
  END as status
FROM information_schema.check_constraints
WHERE constraint_schema = 'public';

-- List all check constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================================================
-- 5. CHECK UNIQUE CONSTRAINTS
-- ============================================================================
SELECT 
  'Unique Constraints' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ PASS - Unique constraints exist'
    ELSE '✗ FAIL - Expected at least 3 unique constraints, found ' || COUNT(*)
  END as status
FROM information_schema.table_constraints
WHERE constraint_type = 'UNIQUE'
  AND table_schema = 'public';

-- List all unique constraints
SELECT
  table_name,
  constraint_name,
  (
    SELECT STRING_AGG(column_name, ', ')
    FROM information_schema.key_column_usage kcu
    WHERE kcu.constraint_name = tc.constraint_name
  ) as columns
FROM information_schema.table_constraints tc
WHERE constraint_type = 'UNIQUE'
  AND table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 6. CHECK TABLE STRUCTURES
-- ============================================================================

-- Rooms table structure
SELECT 
  'rooms' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'rooms'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Customers table structure
SELECT 
  'customers' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customers'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Bookings table structure
SELECT 
  'bookings' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Guests table structure
SELECT 
  'guests' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'guests'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Room_prices table structure
SELECT 
  'room_prices' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'room_prices'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- 7. CHECK EXTENSIONS
-- ============================================================================
SELECT 
  'Extensions Check' as check_type,
  extname as extension_name,
  '✓ Installed' as status
FROM pg_extension
WHERE extname = 'pgcrypto';

-- ============================================================================
-- 8. SUMMARY
-- ============================================================================
SELECT 
  '========================================' as summary,
  'DATABASE SETUP VERIFICATION COMPLETE' as message,
  '========================================' as end_line;

-- Count records in each table (should be 0 for fresh setup, or show seed data)
SELECT 'rooms' as table_name, COUNT(*) as record_count FROM rooms
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'guests', COUNT(*) FROM guests
UNION ALL
SELECT 'room_prices', COUNT(*) FROM room_prices
ORDER BY table_name;
