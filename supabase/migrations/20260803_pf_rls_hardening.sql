-- PromForge(pf_*) 테이블 잠금 + SECURITY DEFINER 함수 권한 정리
-- APPLIED to joha-gallery (etasxbaorwgjoofdxean) on 2026-08-03.
--
-- 왜 안전한가:
--   pf-api 엣지 함수("PromForge unified API")가 이 13개 테이블 전부를
--   SUPABASE_SERVICE_ROLE_KEY로 접근한다. service_role은 RLS를 우회하므로
--   앱 동작에 영향이 없다. PromForge는 Supabase Auth가 아니라 자체 bcrypt +
--   x-pf-token JWT 인증을 쓰기 때문에 anon key를 사용하는 경로가 없다.
--
-- 왜 필요한가:
--   ComfyUI Studio의 anon key는 공개 번들에 평문으로 들어간다(정적 SPA에서는
--   불가피). RLS가 꺼져 있던 동안에는 그 사이트 방문자 누구나 PromForge의
--   데이터를 읽고 수정할 수 있었다 — pf_users(계정), pf_contact_messages(문의) 포함.
--
-- 정책을 만들지 않는 것이 의도다: anon/authenticated는 전면 차단,
-- service_role만 접근한다. (advisor의 "RLS Enabled No Policy" INFO는 정상)

alter table public.pf_users enable row level security;
alter table public.pf_boards enable row level security;
alter table public.pf_posts enable row level security;
alter table public.pf_studies enable row level security;
alter table public.pf_showcases enable row level security;
alter table public.pf_subscribers enable row level security;
alter table public.pf_audit_logs enable row level security;
alter table public.pf_contact_messages enable row level security;
alter table public.pf_jam_signups enable row level security;
alter table public.pf_banners enable row level security;
alter table public.pf_comments enable row level security;
alter table public.pf_levels enable row level security;
alter table public.pf_bookmarks enable row level security;

-- verify_admin_password는 /rest/v1/rpc/verify_admin_password 로 anon에게 열려 있던
-- SECURITY DEFINER 함수다 — 인증도 스로틀도 없는 관리자 비밀번호 오라클.
-- anon/authenticated에서만 회수하면 소용없다: PUBLIC의 기본 EXECUTE 권한을
-- 모든 롤이 상속하므로 PUBLIC부터 회수해야 한다.
revoke execute on function public.verify_admin_password(text) from public;
revoke execute on function public.verify_admin_password(text) from anon;
revoke execute on function public.verify_admin_password(text) from authenticated;

-- ─────────────────────────────────────────────
-- 미적용: 함수 search_path 고정 (advisor WARN 11건)
-- ─────────────────────────────────────────────
-- 아래는 권한 제한으로 적용하지 못했다. 대시보드 SQL Editor에서 실행하면 된다.
-- (시그니처는 실제 DB에서 확인한 값)
--
-- alter function public.increment_likes(text) set search_path = public, pg_temp;
-- alter function public.decrement_likes(text) set search_path = public, pg_temp;
-- alter function public.verify_admin_password(text) set search_path = public, pg_temp;
-- alter function public.pf_body_template(text, integer) set search_path = public, pg_temp;
-- alter function public.pf_update_post_replies() set search_path = public, pg_temp;
-- alter function public.pf_award_points_post() set search_path = public, pg_temp;
-- alter function public.pf_award_points_comment() set search_path = public, pg_temp;
-- alter function public.pf_award_points_bookmark() set search_path = public, pg_temp;
-- alter function public.dl_touch_updated_at() set search_path = public, pg_temp;
-- alter function public.touch_updated_at() set search_path = public, pg_temp;
-- alter function public.touch_dl_mentoring_updated_at() set search_path = public, pg_temp;
