-- Create the typeorm_metadata table that TypeORM expects
CREATE TABLE IF NOT EXISTS typeorm_metadata (
    "type" varchar,
    "database" varchar,
    "schema" varchar,
    "table" varchar,
    "name" varchar,
    "value" text
);

-- Also ensure we have the correct enum types that our entities expect
DO $$ 
BEGIN
    -- Check and create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
    END IF;
    
    -- Check and create user_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive');
    END IF;
    
    -- Check and create vehicle_status_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status_type') THEN
        CREATE TYPE vehicle_status_type AS ENUM ('active', 'inactive');
    END IF;
    
    -- Check and create purchase_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_status') THEN
        CREATE TYPE purchase_status AS ENUM ('pending', 'received', 'cancelled');
    END IF;
    
    -- Check and create sale_product_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_product_type') THEN
        CREATE TYPE sale_product_type AS ENUM ('eggs', 'meat', 'chicks', 'other');
    END IF;
    
    -- Check and create payment_status_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN
        CREATE TYPE payment_status_type AS ENUM ('paid', 'pending', 'partial');
    END IF;
    
    -- Check and create expense_category_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category_type') THEN
        CREATE TYPE expense_category_type AS ENUM (
            'feed', 'labor', 'medicine', 'utilities', 'equipment', 
            'maintenance', 'transportation', 'other'
        );
    END IF;
    
    -- Check and create payment_method_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
        CREATE TYPE payment_method_type AS ENUM ('cash', 'bank_transfer', 'check', 'credit_card');
    END IF;
END $$;