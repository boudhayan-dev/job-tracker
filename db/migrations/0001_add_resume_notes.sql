-- One-off migration for databases created before `notes` was added to db/schema.sql.
-- Fresh databases (schema.sql run from scratch) already have this column — this file exists
-- only to bring already-provisioned local/dev/prod databases in sync.
ALTER TABLE resumes ADD COLUMN notes TEXT NOT NULL DEFAULT '';
