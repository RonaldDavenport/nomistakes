-- ============================================
-- Post-Creation System: Checklist, Chat, Blog
-- ============================================

-- Checklist items — tracks per-business progress through launch tasks
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  task_id text NOT NULL,
  status text DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'skipped'
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}',    -- stores generated content IDs, links, notes
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, task_id)
);

-- Chat messages — persistent AI chat history per business
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,       -- 'user', 'assistant'
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blog posts — generated content (Phase 2, create table now)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  meta_description text,
  keywords text[] DEFAULT '{}',
  status text DEFAULT 'draft',  -- 'draft', 'published'
  published_at timestamptz,
  word_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- Column additions
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS checklist_initialized boolean DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS coach_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- ── RLS ──
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Checklist: users can manage their own business checklist items
CREATE POLICY "Users manage own checklist" ON public.checklist_items
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Chat: users can manage their own business chat messages
CREATE POLICY "Users manage own chat" ON public.chat_messages
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- Blog: users can manage their own business blog posts
CREATE POLICY "Users manage own blog" ON public.blog_posts
  FOR ALL USING (
    business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid())
  );

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_checklist_business_id ON public.checklist_items(business_id);
CREATE INDEX IF NOT EXISTS idx_checklist_status ON public.checklist_items(business_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_business_id ON public.chat_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.chat_messages(business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_blog_business_id ON public.blog_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_blog_status ON public.blog_posts(business_id, status);

-- Allow businesses delete policy (for settings page)
CREATE POLICY "Users delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);
