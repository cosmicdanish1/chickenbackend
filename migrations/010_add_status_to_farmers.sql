-- Migration: Add status column to farmers table
-- Date: 2026-02-15

-- Add status column with default value 'active'
ALTER TABLE farmers 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add index for better query performance
CREATE INDEX idx_farmers_status ON farmers(status);

-- Update existing records to have 'active' status
UPDATE farmers SET status = 'active' WHERE status IS NULL;
