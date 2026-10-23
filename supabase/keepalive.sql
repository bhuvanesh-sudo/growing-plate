-- Keep-alive heartbeat.
-- Supabase pauses free projects after 7 days without activity. A scheduled job calls
-- keepalive_ping() so there is always a real database write. Run this once in the
-- Supabase SQL editor.

create table if not exists public.keepalive (
  id int primary key default 1,
  pinged_at timestamptz not null default now(),
  constraint keepalive_single_row check (id = 1)
);

-- No policies: nobody can read or write the table directly.
alter table public.keepalive enable row level security;

-- The only way in is this function, which updates one timestamp and nothing else.
create or replace function public.keepalive_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  insert into public.keepalive (id, pinged_at)
  values (1, now())
  on conflict (id) do update set pinged_at = excluded.pinged_at
  returning pinged_at;
$$;

revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon, authenticated;
