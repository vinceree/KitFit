-- Add async job tracking to try_ons table.
-- job_id: client-generated UUID for polling.
-- status: tracks generation lifecycle.
-- error_message: stores failure reason.
-- Existing rows default to 'completed' so rate-limit counts stay correct.

ALTER TABLE try_ons ADD COLUMN job_id uuid UNIQUE;
ALTER TABLE try_ons ADD COLUMN status text NOT NULL DEFAULT 'completed';
ALTER TABLE try_ons ADD COLUMN error_message text;

CREATE INDEX idx_try_ons_job_id ON try_ons(job_id) WHERE job_id IS NOT NULL;
