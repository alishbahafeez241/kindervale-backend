ALTER TABLE "leave_requests"
  ADD COLUMN IF NOT EXISTS "student_id" text REFERENCES "students"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "type" text,
  ADD COLUMN IF NOT EXISTS "added_by" text;
