-- 함수 search_path 고정 + 쇼케이스 모더레이션
-- APPLIED to joha-gallery (etasxbaorwgjoofdxean) on 2026-08-04.

-- search_path가 가변인 SECURITY DEFINER / 트리거 함수는 호출자가 search_path를
-- 조작할 수 있는 경로에서 스키마 하이재킹 여지를 남긴다. advisor WARN 11건 해소.
-- 시그니처는 pg_proc에서 실제 확인한 값이다(인자 없는 것으로 적으면 42883).
alter function public.increment_likes(text) set search_path = public, pg_temp;
alter function public.decrement_likes(text) set search_path = public, pg_temp;
alter function public.verify_admin_password(text) set search_path = public, pg_temp;
alter function public.pf_body_template(text, integer) set search_path = public, pg_temp;
alter function public.pf_update_post_replies() set search_path = public, pg_temp;
alter function public.pf_award_points_post() set search_path = public, pg_temp;
alter function public.pf_award_points_comment() set search_path = public, pg_temp;
alter function public.pf_award_points_bookmark() set search_path = public, pg_temp;
alter function public.dl_touch_updated_at() set search_path = public, pg_temp;
alter function public.touch_updated_at() set search_path = public, pg_temp;
alter function public.touch_dl_mentoring_updated_at() set search_path = public, pg_temp;

-- 약관 3.3에 "서비스는 위반 게시물을 삭제하거나 노출을 제한할 수 있다"고 명시했으니
-- 그 권한을 실제로 행사할 수단을 만든다. 지금까지는 정책이 select(all)/insert(own)/
-- delete(own) 뿐이라 운영자도 대시보드에 직접 들어가지 않으면 글을 내릴 수 없었다.
--
-- 노출 제한(숨김)은 삭제와 달리 되돌릴 수 있어 오탐 시 복구가 쉽고, 신고 검토 중인
-- 게시물을 일단 내려두는 용도로도 쓴다.
alter table public.showcase_posts
  add column if not exists hidden_at timestamptz,
  add column if not exists hidden_reason text;

comment on column public.showcase_posts.hidden_at is
  'Set by an operator to withhold a post from the public list without deleting it.';

-- 공개 조회에서 숨긴 글을 제외한다. 작성자 본인은 자기 글이 사라진 것처럼 보이지
-- 않도록 계속 볼 수 있게 한다.
drop policy if exists "showcase_posts_select_all" on public.showcase_posts;
create policy "showcase_posts_select_visible"
  on public.showcase_posts for select
  using (hidden_at is null or auth.uid() = user_id);

-- 숨김/해제는 service_role(RLS 우회)로만 수행한다. UPDATE 정책을 만들지 않는 것이
-- 곧 authenticated의 수정 전면 차단이다.
create index if not exists showcase_posts_visible_idx
  on public.showcase_posts (created_at desc) where hidden_at is null;
