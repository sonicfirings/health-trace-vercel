create table if not exists public.wallet_profiles (
  wallet_address text primary key,
  display_name text not null default '',
  connected_health_apps jsonb not null default '[]'::jsonb,
  connected_app_count integer not null default 0,
  health_permissions jsonb not null default '{}'::jsonb,
  reward_points integer not null default 0,
  guardian_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  reset_at timestamptz
);

alter table public.wallet_profiles
  add column if not exists guardian_data jsonb not null default '{}'::jsonb;

create table if not exists public.daily_records (
  wallet_address text not null references public.wallet_profiles(wallet_address) on delete cascade,
  date_key text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (wallet_address, date_key)
);

create table if not exists public.wallet_events (
  id bigint generated always as identity primary key,
  wallet_address text not null references public.wallet_profiles(wallet_address) on delete cascade,
  event_type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id bigint generated always as identity primary key,
  admin_wallet text not null,
  target_wallet text not null,
  action text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
