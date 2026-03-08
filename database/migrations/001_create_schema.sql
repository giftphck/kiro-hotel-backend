-- Hotel Front Desk Management System - Database Schema
-- Migration 001: Create all tables with constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================
CREATE TABLE rooms (
  room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_status VARCHAR(20) NOT NULL CHECK (room_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
  room_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE customers (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  thai_id_card VARCHAR(13) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
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

-- ============================================================================
-- GUESTS TABLE
-- ============================================================================
CREATE TABLE guests (
  guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  id_card_number VARCHAR(13) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ROOM_PRICES TABLE
-- ============================================================================
CREATE TABLE room_prices (
  price_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  date DATE NOT NULL,
  three_hour_price DECIMAL(10, 2) CHECK (three_hour_price >= 0),
  daily_price DECIMAL(10, 2) CHECK (daily_price >= 0),
  monthly_price DECIMAL(10, 2) CHECK (monthly_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, date)
);

-- ============================================================================
-- ROOM_STATUS_HISTORY TABLE
-- ============================================================================
CREATE TABLE room_status_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  old_status VARCHAR(20) CHECK (old_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
  new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
  changed_by VARCHAR(255),
  changed_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
