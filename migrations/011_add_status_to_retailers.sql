-- Migration: Add status column to retailers table
-- Date: 2026-02-15

-- Add status column with default value 'active'
ALTER TABLE retailers 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add index for better query performance
CREATE INDEX idx_retailers_status ON retailers(status);

-- Update existing records to have 'active' status
UPDATE retailers SET status = 'active' WHERE status IS NULL;
