-- IT-Runway Supabase schema
-- Run this in the Supabase SQL editor BEFORE running seed.sql.

-- Events: all categories share one table (hero, new, popular, recommend,
-- others, register, current). core fields are columns; richer payloads
-- (desc, distances, schedule, ...) live in the `extra` jsonb.
create table if not exists public.events (
  id          text primary key,
  code        text,
  category    text not null default 'others',
  sort        int  not null default 0,
  tag         text,
  tag_type    text,
  title       text,
  sub         text,
  date        text,
  start       text,
  place       text,
  org         text,
  dist        text,
  dist_label  text,
  deadline    text,
  slots_left  int,
  slots_total int,
  grad        text,
  route_color text,
  ghost_color text,
  extra       jsonb
);

-- Organizer page content: one row, everything as jsonb blobs.
create table if not exists public.organizer_content (
  id             text primary key,
  support_email  text,
  hero_slides    jsonb,
  roadmap        jsonb,
  stats_track    jsonb,
  stats_community jsonb,
  trusted        jsonb,
  services       jsonb,
  form           jsonb
);

alter table public.events enable row level security;
alter table public.organizer_content enable row level security;

-- Public read: the anon key can read everything the site renders.
-- (Registration submissions are intentionally NOT stored here yet.)
drop policy if exists "anon read events" on public.events;
create policy "anon read events" on public.events
  for select to anon using (true);

drop policy if exists "anon read organizer_content" on public.organizer_content;
create policy "anon read organizer_content" on public.organizer_content
  for select to anon using (true);