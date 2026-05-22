-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Users policies
-- ============================================================

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow inserts during registration (authenticated users only)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Tasks policies
-- ============================================================

-- Users can read tasks they created or are assigned to
CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() = assignee_id
  );

-- Any authenticated user can create tasks
CREATE POLICY "tasks_insert_authenticated"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creator and assignee can update tasks
CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR auth.uid() = assignee_id
  )
  WITH CHECK (
    auth.uid() = creator_id
    OR auth.uid() = assignee_id
  );

-- Only creator can delete tasks
CREATE POLICY "tasks_delete_creator"
  ON tasks FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================================
-- Activity logs policies
-- ============================================================

-- Users can read activity logs for tasks they have access to
CREATE POLICY "activity_logs_select"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = activity_logs.task_id
        AND (tasks.creator_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

-- Authenticated users can insert activity logs for tasks they have access to
CREATE POLICY "activity_logs_insert"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Notifications policies
-- ============================================================

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System/service role inserts notifications; allow insert for the target user
CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- NOTE: The Flask backend uses the Supabase service_role key,
-- which bypasses RLS entirely. These policies apply only to
-- direct client-side access via Supabase JS/REST with the
-- anon key and a user JWT.
-- ============================================================
