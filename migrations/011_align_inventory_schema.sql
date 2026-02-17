-- Migration to align inventory_items table with entity definition
-- This migration renames and adds columns to match the InventoryItem entity

BEGIN;

-- Rename 'name' to 'item_name'
ALTER TABLE inventory_items 
  RENAME COLUMN name TO item_name;

-- Rename 'min_stock_level' to 'minimum_stock_level'
ALTER TABLE inventory_items 
  RENAME COLUMN min_stock_level TO minimum_stock_level;

-- Add 'current_stock_level' column (copy from quantity initially)
ALTER TABLE inventory_items 
  ADD COLUMN current_stock_level NUMERIC(10,2) DEFAULT 0;

-- Copy quantity values to current_stock_level
UPDATE inventory_items 
  SET current_stock_level = quantity;

-- Make current_stock_level NOT NULL
ALTER TABLE inventory_items 
  ALTER COLUMN current_stock_level SET NOT NULL;

-- Rename 'last_updated_at' to 'last_updated'
ALTER TABLE inventory_items 
  RENAME COLUMN last_updated_at TO last_updated;

-- Add 'notes' column (nullable text)
ALTER TABLE inventory_items 
  ADD COLUMN notes TEXT;

-- Make item_type NOT NULL if it isn't already
ALTER TABLE inventory_items 
  ALTER COLUMN item_type SET NOT NULL;

-- Update quantity default to 0 if needed
ALTER TABLE inventory_items 
  ALTER COLUMN quantity SET DEFAULT 0;

-- Update minimum_stock_level default to 0
ALTER TABLE inventory_items 
  ALTER COLUMN minimum_stock_level SET DEFAULT 0;

COMMIT;
