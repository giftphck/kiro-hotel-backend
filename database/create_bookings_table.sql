-- Create bookings table for Hotel Front Desk Management System
-- Run this in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('3_HOUR', 'DAILY', 'MONTHLY')),
  -- Planned booking times
  check_in_date TIMESTAMP NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  -- Actual check-in/check-out times (for operational tracking)
  actual_check_in_at TIMESTAMP,
  actual_check_out_at TIMESTAMP,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  -- Pricing fields (stored per booking for promotions, negotiations, etc.)
  price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('3_HOUR', 'DAILY', 'MONTHLY')),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  deposit DECIMAL(10, 2) NOT NULL CHECK (deposit >= 0),
  remark TEXT,
  booking_status VARCHAR(20) NOT NULL CHECK (booking_status IN ('ACTIVE', 'CHECKED_OUT', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

-- Create foreign key to rooms table
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_room 
FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT;

-- Create foreign key to customers table
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_customer 
FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

-- Create partial index for active bookings (used in double booking check)
CREATE INDEX IF NOT EXISTS idx_bookings_active_dates 
ON bookings(room_id, check_in_date, check_out_date) 
WHERE booking_status = 'ACTIVE';

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
