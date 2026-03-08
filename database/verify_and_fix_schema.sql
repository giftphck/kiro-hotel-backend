-- Verify and Fix Database Schema
-- Run this script to check if tables exist and create them if needed

-- Check if rooms table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rooms') THEN
        RAISE NOTICE 'Table "rooms" does not exist. Creating it now...';
        
        -- Create rooms table
        CREATE TABLE rooms (
          room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_number VARCHAR(10) NOT NULL UNIQUE,
          room_status VARCHAR(20) NOT NULL CHECK (room_status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
          room_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Table "rooms" created successfully!';
    ELSE
        RAISE NOTICE 'Table "rooms" already exists.';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'rooms'
ORDER BY ordinal_position;

-- Check if there's any data
SELECT COUNT(*) as room_count FROM rooms;

-- If no data, insert sample rooms
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM rooms) = 0 THEN
        RAISE NOTICE 'No rooms found. Inserting sample data...';
        
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
        
        RAISE NOTICE 'Sample data inserted successfully!';
    ELSE
        RAISE NOTICE 'Rooms table already has data.';
    END IF;
END $$;

-- Show all rooms
SELECT 
    room_number as "Room Number",
    room_status as "Status",
    room_type as "Type",
    created_at as "Created At"
FROM rooms
ORDER BY room_number;
