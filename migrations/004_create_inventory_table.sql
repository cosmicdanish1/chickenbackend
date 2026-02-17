-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    minimum_stock_level DECIMAL(10, 2) DEFAULT 0,
    current_stock_level DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on item_type for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON inventory_items(item_type);

-- Create index on current_stock_level for low stock queries
CREATE INDEX IF NOT EXISTS idx_inventory_stock_level ON inventory_items(current_stock_level);

-- Insert sample inventory data
INSERT INTO inventory_items (item_type, item_name, quantity, unit, minimum_stock_level, current_stock_level, notes) VALUES
('feed', 'Chicken Feed - Starter', 500, 'kg', 100, 500, 'For chicks 0-6 weeks'),
('feed', 'Chicken Feed - Grower', 800, 'kg', 150, 800, 'For chickens 7-18 weeks'),
('feed', 'Chicken Feed - Layer', 1200, 'kg', 200, 1200, 'For laying hens'),
('medicine', 'Antibiotics - Amoxicillin', 50, 'bottles', 10, 50, 'For bacterial infections'),
('medicine', 'Vitamins - Multivitamin', 100, 'bottles', 20, 100, 'Daily supplement'),
('medicine', 'Vaccines - Newcastle', 200, 'doses', 50, 200, 'Disease prevention'),
('equipment', 'Feeders - Automatic', 25, 'pcs', 5, 25, 'Automatic feeding system'),
('equipment', 'Drinkers - Nipple', 50, 'pcs', 10, 50, 'Water dispensers'),
('equipment', 'Cages - Layer', 100, 'pcs', 20, 100, 'For laying hens'),
('supplies', 'Bedding - Wood Shavings', 300, 'bags', 50, 300, 'Floor bedding material'),
('supplies', 'Disinfectant', 40, 'liters', 10, 40, 'For cleaning and sanitation'),
('supplies', 'Egg Trays', 500, 'pcs', 100, 500, 'For egg collection');

-- Add comment to table
COMMENT ON TABLE inventory_items IS 'Stores inventory items for the poultry farm including feed, medicine, equipment, and supplies';
