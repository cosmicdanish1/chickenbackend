-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_entity_id ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- Add comment to table
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of user who performed the action';
COMMENT ON COLUMN audit_logs.user_email IS 'Email of user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action (CREATE, UPDATE, DELETE, LOGIN, etc.)';
COMMENT ON COLUMN audit_logs.entity IS 'Entity type affected (users, sales, etc.)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string';
COMMENT ON COLUMN audit_logs.description IS 'Human-readable description of the action';
