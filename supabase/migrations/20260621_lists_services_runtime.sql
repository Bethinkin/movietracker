-- Run this in Supabase: Dashboard → SQL Editor → New Query

-- ----------------------------------------------------------------------------
-- Custom lists
-- ----------------------------------------------------------------------------
create table if not exists public.lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  created_at timestamptz not null default now()
);

alter table public.lists enable row level security;

create policy "Users manage own lists"
  on public.lists for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.list_items (
  list_id  uuid references public.lists(id) on delete cascade not null,
  tmdb_id  bigint not null,
  added_at timestamptz not null default now(),
  primary key (list_id, tmdb_id)
);

alter table public.list_items enable row level security;

create policy "Users manage items in their own lists"
  on public.list_items for all
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id and lists.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Runtime (for Stats hours watched) + subscribed streaming services
-- ----------------------------------------------------------------------------
alter table public.movies
  add column if not exists runtime int;

alter table public.profiles
  add column if not exists services jsonb not null default '[]';
