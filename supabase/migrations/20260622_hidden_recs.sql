-- Run this in Supabase: Dashboard → SQL Editor → New Query

-- Movies the user dismissed ("not interested") from the recommendations row.
alter table public.profiles
  add column if not exists hidden_recs jsonb not null default '[]';
