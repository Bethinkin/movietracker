-- Run this in Supabase: Dashboard → SQL Editor → New Query

-- Pin movies to feature them in the hero background
alter table public.movies
  add column if not exists pinned boolean not null default false;

-- Per-user hero background preference
alter table public.profiles
  add column if not exists hero_source text not null default 'recent';
alter table public.profiles
  add column if not exists hero_count int not null default 5;

-- Existing RLS policies on movies/profiles already cover these columns.
