-- Migration: Allow negative amount in payment_history for refunds
-- Date: 2026-03-08

-- Drop the constraint that requires amount to be positive
ALTER TABLE payment_history 
DROP CONSTRAINT IF EXISTS chk_amount_positive;

-- Add new constraint that allows negative amounts (for refunds)
-- but still validates that amount is not zero
ALTER TABLE payment_history 
ADD CONSTRAINT chk_amount_not_zero CHECK (amount <> 0);
