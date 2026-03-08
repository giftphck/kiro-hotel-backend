-- Hotel Front Desk Management System - Database Indexes
-- Migration 002: Create performance indexes

-- ============================================================================
-- ROOMS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_rooms_status ON rooms(room_status);
CREATE INDEX idx_rooms_number ON rooms(room_number);

-- ============================================================================
-- CUSTOMERS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_id_card ON customers(thai_id_card);

-- ============================================================================
-- BOOKINGS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_checkout_date ON bookings(check_out_date) WHERE booking_status = 'ACTIVE';
CREATE INDEX idx_bookings_actual_check_in ON bookings(actual_check_in_at);
CREATE INDEX idx_bookings_actual_check_out ON bookings(actual_check_out_at);

-- ============================================================================
-- GUESTS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_guests_booking ON guests(booking_id);

-- ============================================================================
-- ROOM_PRICES TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_room_prices_room_date ON room_prices(room_id, date);

-- ============================================================================
-- ROOM_STATUS_HISTORY TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_room_status_history_room ON room_status_history(room_id);
CREATE INDEX idx_room_status_history_changed_at ON room_status_history(changed_at);
CREATE INDEX idx_room_status_history_room_changed_at ON room_status_history(room_id, changed_at);
