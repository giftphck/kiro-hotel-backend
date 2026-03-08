-- Migration: Add price_type column to payment_history table
-- Description: Store the booking's price type at the time of payment

ALTER TABLE payment_history 
ADD COLUMN price_type VARCHAR(20);

-- Add comment
COMMENT ON COLUMN payment_history.price_type IS 'Price type of the booking at the time of payment: 3_HOUR, DAILY, MONTHLY';
