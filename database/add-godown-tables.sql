-- Add Godown (Warehouse) Management Tables

-- Godown Inward Entries (Birds coming into warehouse)
CREATE TABLE IF NOT EXISTS godown_inward_entries (
  id                    BIGSERIAL PRIMARY KEY,
  entry_date            DATE NOT NULL,
  purchase_invoice_no   VARCHAR(50),
  supplier_name         VARCHAR(150),
  vehicle_id            BIGINT REFERENCES vehicles(id),
  number_of_birds       INTEGER NOT NULL,
  average_weight        NUMERIC(10,2),
  total_weight          NUMERIC(10,2),
  rate_per_kg           NUMERIC(10,2),
  total_amount          NUMERIC(14,2),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_godown_inward_entry_date ON godown_inward_entries (entry_date);

-- Godown Sales (Birds sold from warehouse)
CREATE TABLE IF NOT EXISTS godown_sales (
  id                    BIGSERIAL PRIMARY KEY,
  sale_date             DATE NOT NULL,
  invoice_number        VARCHAR(50) UNIQUE,
  customer_name         VARCHAR(150) NOT NULL,
  retailer_id           BIGINT REFERENCES retailers(id),
  vehicle_id            BIGINT REFERENCES vehicles(id),
  number_of_birds       INTEGER NOT NULL,
  average_weight        NUMERIC(10,2),
  total_weight          NUMERIC(10,2),
  rate_per_kg           NUMERIC(10,2),
  total_amount          NUMERIC(14,2),
  payment_status        payment_status_type NOT NULL DEFAULT 'pending',
  amount_received       NUMERIC(14,2) DEFAULT 0,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_godown_sales_sale_date ON godown_sales (sale_date);

-- Godown Mortality (Bird deaths in warehouse)
CREATE TABLE IF NOT EXISTS godown_mortality (
  id                    BIGSERIAL PRIMARY KEY,
  mortality_date        DATE NOT NULL,
  number_of_birds_died  INTEGER NOT NULL,
  reason                TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_godown_mortality_date ON godown_mortality (mortality_date);

-- Godown Expenses (Warehouse-specific expenses)
CREATE TABLE IF NOT EXISTS godown_expenses (
  id                    BIGSERIAL PRIMARY KEY,
  expense_date          DATE NOT NULL,
  category              expense_category_type NOT NULL,
  description           TEXT NOT NULL,
  amount                NUMERIC(14,2) NOT NULL,
  payment_method        payment_method_type NOT NULL,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_godown_expenses_date ON godown_expenses (expense_date);

-- Add status columns to farmers and retailers if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='farmers' AND column_name='status') THEN
    ALTER TABLE farmers ADD COLUMN status user_status NOT NULL DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='retailers' AND column_name='status') THEN
    ALTER TABLE retailers ADD COLUMN status user_status NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Update inventory_items table to match backend entity
DO $$
BEGIN
  -- Rename 'name' to 'item_name' if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='inventory_items' AND column_name='name') THEN
    ALTER TABLE inventory_items RENAME COLUMN name TO item_name;
  END IF;
  
  -- Rename 'min_stock_level' to 'minimum_stock_level' if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='inventory_items' AND column_name='min_stock_level') THEN
    ALTER TABLE inventory_items RENAME COLUMN min_stock_level TO minimum_stock_level;
  END IF;
  
  -- Add current_stock_level if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='inventory_items' AND column_name='current_stock_level') THEN
    ALTER TABLE inventory_items ADD COLUMN current_stock_level NUMERIC(10,2) DEFAULT 0;
  END IF;
  
  -- Rename last_updated_at to last_updated if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='inventory_items' AND column_name='last_updated_at') THEN
    ALTER TABLE inventory_items RENAME COLUMN last_updated_at TO last_updated;
  END IF;
END $$;

-- Update purchase_order_items to match backend entity
DO $$
BEGIN
  -- Rename 'description' to 'item_name' if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='purchase_order_items' AND column_name='description') THEN
    ALTER TABLE purchase_order_items RENAME COLUMN description TO item_name;
  END IF;
  
  -- Rename 'unit_cost' to 'unit_price' if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='purchase_order_items' AND column_name='unit_cost') THEN
    ALTER TABLE purchase_order_items RENAME COLUMN unit_cost TO unit_price;
  END IF;
  
  -- Rename 'line_total' to 'total_price' and make it regular column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='purchase_order_items' AND column_name='line_total') THEN
    ALTER TABLE purchase_order_items DROP COLUMN line_total;
    ALTER TABLE purchase_order_items ADD COLUMN total_price NUMERIC(14,2);
  END IF;
END $$;

-- Add settings category and description columns if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='settings' AND column_name='category') THEN
    ALTER TABLE settings ADD COLUMN category VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='settings' AND column_name='description') THEN
    ALTER TABLE settings ADD COLUMN description TEXT;
  END IF;
END $$;
