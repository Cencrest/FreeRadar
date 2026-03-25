create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  zip text,
  is_admin boolean not null default false,
  is_premium boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  source_name text not null default 'manual',
  source_url text not null,
  category text not null default 'other',
  city text,
  state text,
  zip text,
  lat double precision,
  lng double precision,
  created_by uuid references public.profiles(id) on delete set null,
  dedupe_key text unique,
  is_active boolean not null default true,
  posted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  source_url text,
  category text default 'other',
  city text,
  state text,
  zip text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  keyword text not null,
  zip text,
  radius_miles integer not null default 25,
  category text not null default 'all',
  is_active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, listing_id)
);

create table if not exists public.alert_matches (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  sent_at timestamptz not null default timezone('utc', now()),
  unique (alert_id, listing_id)
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.submissions enable row level security;
alter table public.alerts enable row level security;
alter table public.favorites enable row level security;
alter table public.alert_matches enable row level security;

create policy "Profiles can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Profiles can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can view active listings"
on public.listings
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage listings"
on public.listings
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

create policy "Users can view own submissions"
on public.submissions
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

create policy "Users can create own submissions"
on public.submissions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can delete pending own submissions"
on public.submissions
for delete
to authenticated
using (user_id = auth.uid() and status = 'pending');

create policy "Admins can update submissions"
on public.submissions
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);

create policy "Users can manage own alerts"
on public.alerts
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage own favorites"
on public.favorites
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Admins can view alert matches"
on public.alert_matches
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_admin = true
  )
);
