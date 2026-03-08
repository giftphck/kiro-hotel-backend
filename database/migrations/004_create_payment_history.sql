-- Migration: Create payment_history table
-- Description: Store payment transaction history for bookings

CREATE TABLE IF NOT EXISTS payment_history (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'DEPOSIT', 'PARTIAL', 'FULL'
    payment_method VARCHAR(50), -- 'CASH', 'TRANSFER', 'CARD', etc.
    remark TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

-- Create index for faster queries
CREATE INDEX idx_payment_history_booking_id ON payment_history(booking_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- Add comment
COMMENT ON TABLE payment_history IS 'Payment transaction history for bookings';
COMMENT ON COLUMN payment_history.payment_type IS 'Type of payment: DEPOSIT (initial), PARTIAL (additional), FULL (mark as paid)';
COMMENT ON COLUMN payment_history.payment_method IS 'Payment method: CASH, TRANSFER, CARD, etc.';
