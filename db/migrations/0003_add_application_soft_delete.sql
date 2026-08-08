ALTER TABLE applications ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_applications_is_deleted ON applications(is_deleted);
