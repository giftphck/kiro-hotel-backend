-- ==========================================
-- QUICK FIX: Create Rooms Table
-- ==========================================
-- Copy this entire script and run it in Supabase SQL Editor

-- Step 1: Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Drop table if exists (CAUTION: This will delete all data!)
-- Uncomment the line below if you want to start fresh
-- DROP TABLE IF EXISTS rooms CASCADE;

-- Step 3: Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_status VARCHAR(20) NOT NULL CHECK (room_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
  room_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Insert sample data
INSERT INTO rooms (room_number, room_status, room_type) VALUES
  ('101', 'AVAILABLE', 'Standard'),
  ('102', 'OCCUPIED', 'Standard'),
  ('103', 'RESERVED', 'Deluxe'),
  ('104', 'CLEANING', 'Standard'),
  ('105', 'AVAILABLE', 'Deluxe'),
  ('201', 'AVAILABLE', 'Suite'),
  ('202', 'OCCUPIED', 'Suite'),
  ('203', 'AVAILABLE', 'Standard'),
  ('204', 'RESERVED', 'Deluxe'),
  ('205', 'AVAILABLE', 'Standard')
ON CONFLICT (room_number) DO NOTHING;

-- Step 5: Verify the data
SELECT 
    room_id,
    room_number,
    room_status,
    room_type,
    created_at
FROM rooms
ORDER BY room_number;

-- Step 6: Check table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'rooms'
ORDER BY ordinal_position;
