-- Test data for Rooms Management feature
-- Insert sample rooms for testing

-- Clear existing rooms (optional - comment out if you want to keep existing data)
-- DELETE FROM rooms;

-- Insert test rooms
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
  ('205', 'AVAILABLE', 'Standard');

-- Verify the data
SELECT room_number, room_status, room_type FROM rooms ORDER BY room_number;
