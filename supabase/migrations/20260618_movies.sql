-- Run this in Supabase: Dashboard → SQL Editor → New Query

create table if not exists public.movies (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  tmdb_id      bigint not null,
  title        text not null,
  poster_path  text,
  backdrop_path text,
  release_year text not null default '',
  overview     text not null default '',
  tmdb_rating  numeric not null default 0,
  genres       text[] not null default '{}',
  status       text not null check (status in ('want', 'seen')),
  user_rating  integer,
  notes        text,
  added_at     timestamptz not null default now(),
  watched_at   timestamptz,
  unique (user_id, tmdb_id)
);

alter table public.movies enable row level security;

create policy "Users manage own movies"
  on public.movies for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
