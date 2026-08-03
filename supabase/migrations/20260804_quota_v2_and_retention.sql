-- 쿼터 v2 + IP 보존기간
-- APPLIED to joha-gallery (etasxbaorwgjoofdxean) on 2026-08-04.
--
-- ── 왜 고쳤나 ──────────────────────────────────────────────
-- v1은 "선차감 후 검사"였는데 초과 시 되돌리지 않아, 거절된 요청도 전역 카운터를
-- 올렸다. improve(16 units) 기준 인증 없는 44요청이면 전역 700을 넘겨 그날 전체
-- 사용자의 AI 기능이 멈췄다. 실제 과금은 2회분(~$0.08)뿐이었으므로, 비용을 지키려
-- 만든 장치가 가용성에 대한 가장 값싼 공격 수단이 되어 있었다.
--
-- ── 예산 재산정 ────────────────────────────────────────────
-- gemini-2.5-flash 단가: 입력 $0.30/1M, 출력 $2.50/1M.
-- v1 주석은 출력에 입력 단가를 적용해 약 7.5배 과다 산정했다.
--   700 units × 1024 tok = 716,800 tok/일 × $2.50/1M = $1.79/일 = 월 $53.8 (약 7.5만원)
--   1만원/월(≈$7 = $0.233/일) → 0.233 / 2.50 × 1e6 / 1024 ≈ 91 units/일
-- units는 최악값(상한) 기준이라 실사용은 이보다 훨씬 적다. 여유 1.6배로 150을 잡는다.
-- 실제 소비 토큰은 이제 프록시가 로그로 남기므로, 2주 뒤 실측으로 재조정할 것.

create or replace function public.gemini_consume_quota(
  p_client text,
  p_units integer,
  p_daily_global integer default 150,
  p_daily_client integer default 20
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_global_ok boolean := false;
  v_client_ok boolean := false;
begin
  if p_units is null or p_units <= 0 or p_units > 64 then
    return false;
  end if;
  -- 임의 문자열로 행을 무한 생성하는 것을 막는다.
  if p_client is null or char_length(p_client) > 64 then
    return false;
  end if;

  -- 한도 안에서만 증가한다. where 절이 조건과 갱신을 한 문장에 묶어
  -- 동시 요청이 함께 한도를 넘는 것을 막는다.
  insert into public.gemini_usage (bucket, day, units)
  values ('__global__', v_day, p_units)
  on conflict (bucket, day) do update
    set units = public.gemini_usage.units + excluded.units
    where public.gemini_usage.units + excluded.units <= p_daily_global
  returning true into v_global_ok;

  if not coalesce(v_global_ok, false) then
    return false;
  end if;

  insert into public.gemini_usage (bucket, day, units)
  values (p_client, v_day, p_units)
  on conflict (bucket, day) do update
    set units = public.gemini_usage.units + excluded.units
    where public.gemini_usage.units + excluded.units <= p_daily_client
  returning true into v_client_ok;

  if not coalesce(v_client_ok, false) then
    -- 개인 한도에서 막혔으니 전역에서 이미 올린 몫을 되돌린다.
    update public.gemini_usage
      set units = greatest(0, units - p_units)
      where bucket = '__global__' and day = v_day;
    return false;
  end if;

  return true;
end;
$$;

revoke execute on function public.gemini_consume_quota(text, integer, integer, integer) from public;
revoke execute on function public.gemini_consume_quota(text, integer, integer, integer) from anon;
revoke execute on function public.gemini_consume_quota(text, integer, integer, integer) from authenticated;

-- ── IP 보존기간 ────────────────────────────────────────────
-- bucket에 'ip:1.2.3.4' 형태로 IP가 들어간다. IP는 개인정보이므로 무기한 보관할 수
-- 없고, 개인정보처리방침에 30일로 고지했으니 그 약속을 코드로 이행한다.
-- 겸사겸사 usage 테이블 무한 증식(pf_*/dl_*와 용량 공유)도 막는다.
create or replace function public.gemini_usage_prune()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.gemini_usage where day < (now() at time zone 'utc')::date - 30;
$$;

revoke execute on function public.gemini_usage_prune() from public;
revoke execute on function public.gemini_usage_prune() from anon;
revoke execute on function public.gemini_usage_prune() from authenticated;

select cron.schedule(
  'gemini-usage-prune',
  '17 4 * * *',
  $$select public.gemini_usage_prune();$$
);
