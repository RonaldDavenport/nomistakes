-- ============================================
-- No Mistakes — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Businesses table: stores each generated business
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  tagline text,
  type text, -- 'products', 'digital', 'services'
  status text default 'building', -- 'building', 'live', 'paused'

  -- Wizard inputs
  skills text[] default '{}',
  time_commitment text,
  budget text,
  biz_type text,

  -- AI-generated content (JSONB)
  brand jsonb default '{}',
  -- { colors: { primary, secondary, accent }, fonts: { heading, body }, logo_desc }
  site_content jsonb default '{}',
  -- { hero: { headline, subheadline }, about, features: [], products: [], cta, testimonials: [] }
  business_plan jsonb default '{}',
  -- { summary, target_market, revenue_model, marketing_strategy, competitive_edge }

  revenue_estimate text,
  startup_cost text,
  audience text,
  live_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Generations log: tracks every AI call for cost tracking
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null, -- 'concepts', 'brand', 'site_content', 'business_plan'
  model text, -- 'claude-haiku-4-5-20251001', 'claude-sonnet-4-5-20250929'
  input_tokens int default 0,
  output_tokens int default 0,
  cost_cents numeric(10,4) default 0,
  duration_ms int default 0,
  created_at timestamptz default now()
);

-- Profiles table: extends auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  plan text default 'free', -- 'free', 'starter', 'growth', 'pro'
  businesses_count int default 0,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.businesses enable row level security;
alter table public.generations enable row level security;
alter table public.profiles enable row level security;

-- Users can only see their own data
create policy "Users read own businesses" on public.businesses
  for select using (auth.uid() = user_id);

create policy "Users insert own businesses" on public.businesses
  for insert with check (auth.uid() = user_id);

create policy "Users update own businesses" on public.businesses
  for update using (auth.uid() = user_id);

create policy "Users read own generations" on public.generations
  for select using (auth.uid() = user_id);

create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Public can read live business sites (for /site/[slug])
create policy "Public read live businesses" on public.businesses
  for select using (status = 'live');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index if not exists idx_businesses_user_id on public.businesses(user_id);
create index if not exists idx_businesses_slug on public.businesses(slug);
create index if not exists idx_businesses_status on public.businesses(status);
create index if not exists idx_generations_business_id on public.generations(business_id);
