-- Hotel Front Desk Management System - Seed Data
-- Optional: Use this to populate the database with initial test data

-- ============================================================================
-- SEED ROOMS
-- ============================================================================
-- Insert sample rooms (adjust room numbers and types as needed)
INSERT INTO rooms (room_number, room_status, room_type) VALUES
  ('101', 'AVAILABLE', 'Standard'),
  ('102', 'AVAILABLE', 'Standard'),
  ('103', 'AVAILABLE', 'Standard'),
  ('104', 'AVAILABLE', 'Deluxe'),
  ('105', 'AVAILABLE', 'Deluxe'),
  ('201', 'AVAILABLE', 'Standard'),
  ('202', 'AVAILABLE', 'Standard'),
  ('203', 'AVAILABLE', 'Deluxe'),
  ('204', 'AVAILABLE', 'Deluxe'),
  ('205', 'AVAILABLE', 'Suite'),
  ('301', 'AVAILABLE', 'Standard'),
  ('302', 'AVAILABLE', 'Standard'),
  ('303', 'AVAILABLE', 'Deluxe'),
  ('304', 'AVAILABLE', 'Suite'),
  ('305', 'AVAILABLE', 'Suite');

-- ============================================================================
-- SEED ROOM PRICES (Optional)
-- ============================================================================
-- Insert sample pricing for the next 30 days
-- Adjust prices as needed for your hotel

DO $$
DECLARE
  room_record RECORD;
  current_date_iter DATE;
BEGIN
  -- Loop through all rooms
  FOR room_record IN SELECT room_id FROM rooms LOOP
    -- Loop through next 30 days
    FOR i IN 0..29 LOOP
      current_date_iter := CURRENT_DATE + i;
      
      -- Insert prices based on room type
      -- You can customize these prices
      INSERT INTO room_prices (room_id, date, three_hour_price, daily_price, monthly_price)
      VALUES (
        room_record.room_id,
        current_date_iter,
        300.00,  -- 3-hour rate
        800.00,  -- Daily rate
        18000.00 -- Monthly rate
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- VERIFY SEED DATA
-- ============================================================================
-- Check rooms
SELECT 
  COUNT(*) as total_rooms,
  COUNT(CASE WHEN room_status = 'AVAILABLE' THEN 1 END) as available_rooms
FROM rooms;

-- Check room prices
SELECT 
  COUNT(*) as total_price_records,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM room_prices;

-- Display all rooms
SELECT 
  room_number,
  room_status,
  room_type,
  created_at
FROM rooms
ORDER BY room_number;
