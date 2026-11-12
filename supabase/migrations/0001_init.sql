-- ═══════════════════════════════════════════════════════════════════
-- NetLab — initial schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor
-- Then run seed.sql, then make the first admin (see README).
-- ═══════════════════════════════════════════════════════════════════

-- ------------------------------------------------------------------
-- 0. profiles — one row per auth user; role drives permissions
--    (must exist before is_admin(), which references it)
-- ------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth.users entry. role: ''user'' | ''admin''. Promote the first admin with: update public.profiles set role = ''admin'' where id = (select id from auth.users where email = ''...'');';

alter table public.profiles enable row level security;

create policy "profiles: users read own row"
  on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- ------------------------------------------------------------------
-- 1. Helper: is the current user an admin?
--    security definer so policies never recurse through RLS.
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: admins read all rows"
  on public.profiles
  for select to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------------
-- 2. posts — blog articles stored as markdown
-- ------------------------------------------------------------------
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  slug       text not null unique,
  excerpt    text not null default '',
  content    text not null default '',
  category   text not null
             check (category in ('OSI', 'Routing', 'Wireless', 'Fiber', '5G', 'Security')),
  cover_url  text,
  published  boolean not null default false,
  created_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, created_at desc);
create index posts_category_idx  on public.posts (category);

comment on table public.posts is
  'Blog articles. content is Markdown (GFM). Only role=''admin'' may write.';

alter table public.posts enable row level security;

create policy "posts: anyone reads published posts"
  on public.posts
  for select to anon, authenticated
  using (published);

create policy "posts: admins manage all posts"
  on public.posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------
-- 3. questions — theory quiz bank
-- ------------------------------------------------------------------
create table public.questions (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  options      jsonb not null
               check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_index int not null check (correct_index between 0 and 3),
  explanation  text not null default '',
  topic        text not null,
  difficulty   int not null default 1 check (difficulty between 1 and 3),
  created_at   timestamptz not null default now()
);

create index questions_topic_idx on public.questions (topic);

comment on table public.questions is
  'Multiple-choice theory bank. options = jsonb array of 4 strings; correct_index = 0..3.';

alter table public.questions enable row level security;

create policy "questions: anyone reads the bank"
  on public.questions
  for select to anon, authenticated
  using (true);

create policy "questions: admins manage the bank"
  on public.questions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------
-- 4. quiz_results — scores, saved only when logged in
-- ------------------------------------------------------------------
create table public.quiz_results (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  mode       text not null,
  score      int not null check (score >= 0),
  total      int not null check (total > 0),
  created_at timestamptz not null default now()
);

create index quiz_results_user_idx on public.quiz_results (user_id, created_at desc);

comment on table public.quiz_results is
  'One row per finished quiz run. mode: ''subnetting'' | ''theory'' | ''mixed''.';

alter table public.quiz_results enable row level security;

create policy "quiz_results: users read own results"
  on public.quiz_results
  for select to authenticated
  using (user_id = auth.uid());

create policy "quiz_results: admins read all results"
  on public.quiz_results
  for select to authenticated
  using (public.is_admin());

create policy "quiz_results: users save own results"
  on public.quiz_results
  for insert to authenticated
  with check (user_id = auth.uid());

-- ------------------------------------------------------------------
-- 5. auto-create a profile whenever someone signs up
-- ------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    split_part(coalesce(new.email, 'student'), '@', 1),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
