-- Hotel Front Desk Management System - Foreign Key Relationships
-- Migration 003: Create foreign key constraints

-- ============================================================================
-- BOOKINGS TABLE FOREIGN KEYS
-- ============================================================================
-- Foreign key from bookings.room_id to rooms.room_id
-- ON DELETE RESTRICT prevents deletion of rooms with active bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_room
FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT;

-- Foreign key from bookings.customer_id to customers.customer_id
-- ON DELETE RESTRICT prevents deletion of customers with bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_customer
FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT;

-- ============================================================================
-- GUESTS TABLE FOREIGN KEYS
-- ============================================================================
-- Foreign key from guests.booking_id to bookings.booking_id
-- ON DELETE CASCADE automatically removes guests when booking is deleted
ALTER TABLE guests
ADD CONSTRAINT fk_guests_booking
FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE;

-- ============================================================================
-- ROOM_PRICES TABLE FOREIGN KEYS
-- ============================================================================
-- Foreign key from room_prices.room_id to rooms.room_id
-- ON DELETE CASCADE automatically removes prices when room is deleted
ALTER TABLE room_prices
ADD CONSTRAINT fk_room_prices_room
FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE;

-- ============================================================================
-- ROOM_STATUS_HISTORY TABLE FOREIGN KEYS
-- ============================================================================
-- Foreign key from room_status_history.room_id to rooms.room_id
-- ON DELETE CASCADE automatically removes history when room is deleted
ALTER TABLE room_status_history
ADD CONSTRAINT fk_room_status_history_room
FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE;
