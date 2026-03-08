-- Migration: Add payment status column to payment_history table
-- Description: Add status field to track payment transaction status (SUCCESS, FAILED, PENDING)

-- Create enum type for payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('SUCCESS', 'FAILED', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column with default value 'SUCCESS' for backward compatibility
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS status payment_status NOT NULL DEFAULT 'SUCCESS';

-- Update existing records to have status = 'SUCCESS'
UPDATE payment_history 
SET status = 'SUCCESS' 
WHERE status IS NULL;

-- Create index on status column for faster filtering
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- Add column comment
COMMENT ON COLUMN payment_history.status IS 'Payment transaction status: SUCCESS, FAILED, PENDING';
