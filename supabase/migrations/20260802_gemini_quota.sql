-- Cost guard for the public (unauthenticated) Gemini proxy.
-- APPLIED to joha-gallery (etasxbaorwgjoofdxean) on 2026-08-02.
--
-- Budget: 10,000 KRW/month (~USD 7) => ~USD 0.23/day.
-- Accounting is by "unit" = 1024 output tokens, charged at each task's CEILING
-- (worst case), so real spend lands well under the cap. At gemini-2.5-flash
-- output pricing, ~700 units/day is roughly the break-even for that budget.
--
-- Task weights (see supabase/functions/gemini-proxy/index.ts):
--   interview 1 / generate 2 / prompt 1 / diagnose 4 / improve 16
-- One full interview + generate = 3 units, so 700 units/day is ~230 generations
-- worst case, and considerably more in practice since responses rarely hit the ceiling.
--
-- To retune, change the DEFAULT values below — no function redeploy needed:
--   p_daily_global : whole-service daily budget
--   p_daily_client : per-IP daily budget

create table if not exists public.gemini_usage (
  bucket text not null,
  day date not null,
  units integer not null default 0,
  primary key (bucket, day)
);

comment on table public.gemini_usage is 'Daily quota counters for the gemini-proxy edge function. Written only via gemini_consume_quota (service_role).';

alter table public.gemini_usage enable row level security;
-- No policies by design: only service_role (which bypasses RLS) may touch this.

create or replace function public.gemini_consume_quota(
  p_client text,
  p_units integer,
  p_daily_global integer default 700,
  p_daily_client integer default 40
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_global integer;
  v_client integer;
begin
  -- Reserve first, then check: two concurrent callers cannot both slip past the cap.
  insert into public.gemini_usage (bucket, day, units)
  values ('__global__', v_day, p_units)
  on conflict (bucket, day) do update set units = public.gemini_usage.units + excluded.units
  returning units into v_global;

  insert into public.gemini_usage (bucket, day, units)
  values (p_client, v_day, p_units)
  on conflict (bucket, day) do update set units = public.gemini_usage.units + excluded.units
  returning units into v_client;

  if v_global > p_daily_global or v_client > p_daily_client then
    return false;
  end if;
  return true;
end;
$$;

-- The proxy calls this with the service role key; nobody else should reach it.
revoke execute on function public.gemini_consume_quota(text, integer, integer, integer) from public;
revoke execute on function public.gemini_consume_quota(text, integer, integer, integer) from anon;
revoke execute on function public.gemini_consume_quota(text, integer, integer, integer) from authenticated;

create index if not exists gemini_usage_day_idx on public.gemini_usage (day);
