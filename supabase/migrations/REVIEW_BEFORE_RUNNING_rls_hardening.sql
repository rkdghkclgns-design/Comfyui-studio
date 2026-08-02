-- ⚠️ 검토 필수 — 그대로 실행하지 마십시오 ⚠️
--
-- 대상: joha-gallery (etasxbaorwgjoofdxean)
-- 이 파일은 ComfyUI Studio가 아니라, 같은 프로젝트를 쓰는 **다른 앱들**의 테이블을 건드립니다.
--
-- 배경:
--   ComfyUI Studio의 anon key는 공개 정적 번들에 평문으로 실려 있습니다(불가피).
--   그런데 같은 프로젝트의 pf_* 테이블 13개는 RLS가 꺼져 있어, 그 anon key만으로
--   누구나 읽고/쓰고/지울 수 있습니다. Supabase advisor도 ERROR로 보고합니다.
--   즉 comfyui-studio.com 방문자가 pf_* 앱의 데이터를 조작할 수 있는 상태입니다.
--
-- 위험:
--   RLS를 켜기만 하고 정책을 만들지 않으면 **해당 앱이 즉시 전면 중단됩니다**
--   (모든 접근이 거부됨). 각 테이블이 어떻게 쓰이는지 확인한 뒤,
--   아래 STEP 2에서 앱에 맞는 정책을 반드시 함께 정의하십시오.
--
-- 권장 절차:
--   1. pf_* 앱이 anon key로 접근하는지, service_role로 접근하는지 먼저 확인
--      → service_role만 쓴다면 STEP 1만으로 충분하고 앱은 계속 동작합니다
--      → anon key로 직접 접근한다면 STEP 2의 정책이 반드시 필요합니다
--   2. 스테이징에서 먼저 적용
--   3. 중장기적으로 ComfyUI Studio를 전용 Supabase 프로젝트로 분리
--      (지금은 DB 용량·egress·anon key·Auth 설정을 두 서비스가 공유하므로,
--       한쪽을 겨냥한 공격이 반드시 다른 쪽을 함께 죽입니다)

-- ═══════════════════════════════════════════
-- STEP 1: RLS 활성화
-- ═══════════════════════════════════════════
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

-- ═══════════════════════════════════════════
-- STEP 2: 정책 정의 (앱 동작 방식에 맞게 반드시 수정할 것)
-- ═══════════════════════════════════════════
-- 아래는 "공개 읽기 전용" 가정의 예시입니다. 실제 요구사항에 맞게 고치십시오.
--
-- 공개 열람이 필요한 테이블:
--   create policy "pf_posts_public_read" on public.pf_posts for select using (true);
--   create policy "pf_boards_public_read" on public.pf_boards for select using (true);
--   create policy "pf_banners_public_read" on public.pf_banners for select using (true);
--   create policy "pf_levels_public_read" on public.pf_levels for select using (true);
--
-- 민감 테이블(정책 없음 = anon 전면 차단, service_role만 접근):
--   pf_users, pf_audit_logs, pf_contact_messages, pf_subscribers, pf_jam_signups
--   → 이 테이블들은 정책을 만들지 않는 편이 안전합니다.

-- ═══════════════════════════════════════════
-- STEP 3: anon이 실행 가능한 SECURITY DEFINER 함수 차단
-- ═══════════════════════════════════════════
-- verify_admin_password가 /rest/v1/rpc/verify_admin_password 로 anon에게 열려 있습니다.
-- 관리자 비밀번호를 무제한 대입할 수 있는 표면이므로 즉시 회수를 권장합니다.
revoke execute on function public.verify_admin_password(text) from anon;
revoke execute on function public.verify_admin_password(text) from authenticated;

-- ═══════════════════════════════════════════
-- STEP 4: 함수 search_path 고정 (advisor WARN 11건)
-- ═══════════════════════════════════════════
-- search_path가 가변이면 스키마 조작을 통한 권한 상승 여지가 생깁니다.
alter function public.increment_likes() set search_path = public, pg_temp;
alter function public.decrement_likes() set search_path = public, pg_temp;
alter function public.verify_admin_password(text) set search_path = public, pg_temp;
alter function public.pf_body_template() set search_path = public, pg_temp;
alter function public.pf_update_post_replies() set search_path = public, pg_temp;
alter function public.pf_award_points_post() set search_path = public, pg_temp;
alter function public.pf_award_points_comment() set search_path = public, pg_temp;
alter function public.pf_award_points_bookmark() set search_path = public, pg_temp;
alter function public.dl_touch_updated_at() set search_path = public, pg_temp;
alter function public.touch_updated_at() set search_path = public, pg_temp;
alter function public.touch_dl_mentoring_updated_at() set search_path = public, pg_temp;
