ALTER TABLE applications ADD COLUMN owner_email TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_applications_owner_email ON applications(owner_email);

-- Backfill: every application row created before this migration was created during dev
-- testing by boudhayan.dev@gmail.com — assign existing rows to that account so they don't
-- become invisible (unowned) once per-user filtering is enforced.
UPDATE applications SET owner_email = 'boudhayan.dev@gmail.com' WHERE owner_email = '';
