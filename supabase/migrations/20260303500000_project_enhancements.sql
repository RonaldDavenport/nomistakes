-- =====================================================================
-- Project Enhancements: Subtasks + Activity Log
-- =====================================================================

-- Subtask support: deliverables can have a parent deliverable
ALTER TABLE deliverables
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES deliverables(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_deliverables_parent_id ON deliverables(parent_id);

-- ─── Project Activity Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  business_id UUID        REFERENCES businesses(id) NOT NULL,
  user_id     UUID        REFERENCES auth.users(id),
  type        TEXT        NOT NULL DEFAULT 'comment',
  -- 'comment'              — user-authored note
  -- 'status_change'        — project status updated
  -- 'deliverable_completed'— a deliverable was checked off
  body        TEXT,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_business_id ON project_activities(business_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at DESC);

-- RLS
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own project activities"
  ON project_activities FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to project_activities"
  ON project_activities FOR ALL
  TO service_role USING (true) WITH CHECK (true);
