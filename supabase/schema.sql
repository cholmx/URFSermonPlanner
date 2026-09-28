-- URF Sermon Planner database schema
-- Run this in the Supabase SQL editor first, then run seed.sql.

create table if not exists public.teachers (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.sermons (
  sunday date primary key,
  teacher text not null default '',
  series text not null default '',
  topic text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.teachers enable row level security;
alter table public.sermons enable row level security;

-- Anyone with the link can read the schedule.
create policy "Public read teachers" on public.teachers
  for select to anon, authenticated using (true);
create policy "Public read sermons" on public.sermons
  for select to anon, authenticated using (true);

-- Only signed-in users can change anything.
create policy "Signed-in insert teachers" on public.teachers
  for insert to authenticated with check (true);
create policy "Signed-in delete teachers" on public.teachers
  for delete to authenticated using (true);

create policy "Signed-in insert sermons" on public.sermons
  for insert to authenticated with check (true);
create policy "Signed-in update sermons" on public.sermons
  for update to authenticated using (true) with check (true);
create policy "Signed-in delete sermons" on public.sermons
  for delete to authenticated using (true);
