-- Run this in Supabase: Dashboard → SQL Editor → New Query

-- "Want to rewatch" flag for movies already marked seen.
alter table public.movies
  add column if not exists rewatch boolean not null default false;
