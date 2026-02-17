-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
    ('currency', 'INR', 'general', 'System currency'),
    ('theme', 'light', 'appearance', 'UI theme (light/dark)'),
    ('company_name', 'Aziz Poultry', 'company', 'Company name'),
    ('company_email', '', 'company', 'Company email address'),
    ('company_phone', '', 'company', 'Company phone number'),
    ('company_address', '', 'company', 'Company address')
ON CONFLICT (key) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE settings IS 'System settings and configuration';
COMMENT ON COLUMN settings.key IS 'Unique setting key';
COMMENT ON COLUMN settings.value IS 'Setting value';
COMMENT ON COLUMN settings.category IS 'Setting category for grouping';
COMMENT ON COLUMN settings.description IS 'Setting description';
