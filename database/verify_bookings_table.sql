-- Verify and fix bookings table structure
-- Run this in Supabase SQL Editor

-- First, check if bookings table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'bookings';

-- If table exists, check its columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Drop the table if it exists (CAREFUL!)
-- DROP TABLE IF EXISTS bookings CASCADE;

-- Recreate bookings table with correct structure
CREATE TABLE IF NOT EXISTS bookings (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('3_HOUR', 'DAILY', 'MONTHLY')),
  check_in_date TIMESTAMP NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  actual_check_in_at TIMESTAMP,
  actual_check_out_at TIMESTAMP,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('3_HOUR', 'DAILY', 'MONTHLY')),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  deposit DECIMAL(10, 2) NOT NULL CHECK (deposit >= 0),
  remark TEXT,
  booking_status VARCHAR(20) NOT NULL CHECK (booking_status IN ('ACTIVE', 'CHECKED_OUT', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_active_dates ON bookings(room_id, check_in_date, check_out_date) WHERE booking_status = 'ACTIVE';

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
