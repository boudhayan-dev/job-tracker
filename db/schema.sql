-- CareerRecall D1 schema.
-- requirements / skills / work_experience / nudge points are stored as JSON text
-- (SQLite has no native JSON column type) — parsed/serialized at the Functions layer.

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role_title TEXT NOT NULL,
  jd_summary TEXT NOT NULL DEFAULT '',
  jd_full_text TEXT NOT NULL DEFAULT '',
  jd_url TEXT,
  requirements TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'in_progress', 'interviewing', 'offer', 'rejected')),
  applied_date TEXT NOT NULL,
  owner_email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
CREATE INDEX IF NOT EXISTS idx_applications_owner_email ON applications(owner_email);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  r2_object_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  skills TEXT NOT NULL DEFAULT '[]',
  work_experience TEXT NOT NULL DEFAULT '[]',
  raw_text TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_application_id ON resumes(application_id);

CREATE TABLE IF NOT EXISTS nudges (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  points TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_nudges_application_id ON nudges(application_id);
