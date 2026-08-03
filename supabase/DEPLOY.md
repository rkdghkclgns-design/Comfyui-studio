# 배포 상태 (joha-gallery / etasxbaorwgjoofdxean)

## ✅ 적용 완료

| 항목 | 상태 |
|---|---|
| `gemini-proxy` v5 배포 | ✅ version 4 ACTIVE |
| `showcase_posts` 테이블 + RLS + 신원 트리거 | ✅ |
| Gemini 사용량 쿼터 (예산 1만원/월) | ✅ |
| `pf_*` 13개 테이블 RLS | ✅ |
| `verify_admin_password` anon 권한 회수 | ✅ |
| 함수 `search_path` 고정 11건 | ✅ (advisor WARN 해소) |
| 쇼케이스 모더레이션 수단 (`hidden_at`) | ✅ |
| IP 30일 파기 (`pg_cron`) | ✅ |
| 프런트엔드 배포 | ✅ |

**Supabase security advisor ERROR: 13건 → 0건**

검증 결과:
- 정상 요청 → `200`
- 외부 Origin(`evil.example`) → `403 Origin not allowed`
- `model: "gemini-2.5-pro"` + `maxOutputTokens: 65536` → 무시되고 `modelVersion: gemini-2.5-flash`로 응답
- `inlineData` 밀반입 → `400`
- 쿼터 39/40 → `true`, 추가 5 → `false`
- `anon`의 `gemini_consume_quota` / `verify_admin_password` 실행 권한 → 없음
- `pf_*` RLS → 13/13 활성

---

## 💰 예산 상한 (1만원/월)

**코드로 강제합니다.** GCP 예산 알림은 지출을 *막지 않고 알리기만* 하므로, 공격이
새벽에 시작되면 알림을 읽기 전에 이미 초과됩니다. 그래서 프록시가 Gemini를
호출하기 **전에** DB 쿼터를 차감하고, 한도를 넘으면 429로 거절합니다. 거절된
요청은 비용이 0입니다.

계산 근거 — `gemini-2.5-flash` 단가는 **입력 $0.30/1M, 출력 $2.50/1M** 입니다.
(초기 산정은 출력에 입력 단가를 적용해 약 7.5배 과다했습니다. 2026-08-04 정정.)

```
1만원/월 ≈ $7 ≈ $0.233/일
$0.233 ÷ $2.50/1M ÷ 1024 ≈ 91 units/일   ← 이론상 한계
```

| task | 출력 상한 | thinking | units |
|---|---|---|---|
| interview | 2,048 | 0 | 2 |
| generate | 2,048 | 0 | 2 |
| prompt | 1,024 | 0 | 1 |
| diagnose | 4,096 | 1,024 | 4 |
| improve | 16,384 | 2,048 | 16 |

- **전체 일일 150 units** — units는 최악값(상한을 다 채운 경우) 기준이라 실사용은
  훨씬 적습니다. 워크플로우 생성(인터뷰+생성 = 4 units) 기준 최소 37회 보장.
- **IP당 일일 20 units** — 생성 5회 또는 개선 1회.
- **거절된 요청은 예산을 소모하지 않습니다** (v2에서 수정).

> 프록시가 매 호출의 실제 토큰 수를 `evt: "gemini_usage"` 로그로 남깁니다.
> 2주 뒤 Edge Function 로그에서 실측 평균을 확인해 한도를 재조정하세요.

한도 조정은 [`migrations/20260802_gemini_quota.sql`](migrations/20260802_gemini_quota.sql)의
`p_daily_global` / `p_daily_client` 기본값을 바꿔 다시 실행하면 됩니다. 함수 재배포 불필요.

사용량 확인:

```sql
select bucket, day, units from public.gemini_usage
where day >= current_date - 7 order by day desc, units desc;
```

> **GCP 예산 알림도 별도로 걸어두시길 권합니다.** 위 쿼터는 이 프록시를 통한 지출만
> 막습니다. 같은 API 키를 다른 곳에서도 쓰고 있다면 그쪽은 통제되지 않습니다.
> https://console.cloud.google.com/billing → Budgets & alerts

---

## 🛠 게시물 모더레이션 (운영자용)

이용약관 3.3에 명시한 삭제·노출제한 권한을 행사하는 방법입니다.
전용 관리 화면은 아직 없으므로 **Dashboard → SQL Editor**에서 실행하세요.
아래 쿼리는 모두 `service_role`(대시보드 기본)로 동작하며, 일반 사용자는 실행할 수 없습니다.

**최근 게시물 확인**

```sql
select id, username, title, category, created_at, hidden_at
from public.showcase_posts
order by created_at desc limit 30;
```

**노출 제한 (되돌릴 수 있음 — 신고 검토 중 임시 조치에 권장)**

```sql
update public.showcase_posts
set hidden_at = now(), hidden_reason = '신고 접수 — 악성 커스텀 노드 의심'
where id = '<게시물 UUID>';
```

숨긴 글은 목록에서 사라지지만 **작성자 본인에게는 계속 보입니다.**
"글이 통째로 사라졌다"는 오해를 막기 위한 의도적 설계입니다.

**노출 제한 해제**

```sql
update public.showcase_posts set hidden_at = null, hidden_reason = null
where id = '<게시물 UUID>';
```

**영구 삭제 (되돌릴 수 없음 — 명백한 위반에만)**

```sql
delete from public.showcase_posts where id = '<게시물 UUID>';
```

**특정 사용자의 게시물 전체 확인**

```sql
select id, title, created_at, hidden_at
from public.showcase_posts
where username = '<GitHub 핸들>'
order by created_at desc;
```

> `username`은 게시 시점에 GitHub OAuth 신원에서 서버가 찍은 값입니다.
> 클라이언트가 보낸 값이 아니므로 사칭이 아닌 실제 계정을 가리킵니다.
> 다만 GitHub 핸들은 개명 후 타인이 재취득할 수 있으므로,
> 동일 인물 여부는 `user_id`(계정 UUID)로 판단하세요.

**현재 숨겨진 게시물 목록**

```sql
select id, username, title, hidden_at, hidden_reason
from public.showcase_posts
where hidden_at is not null order by hidden_at desc;
```

---

## ⏳ 남은 수동 작업

### 1. GitHub OAuth (필수 — 현재 로그인 불가)

MCP로 접근할 수 없는 영역이라 직접 하셔야 합니다.

1. Dashboard → Authentication → Providers → GitHub 활성화
2. GitHub OAuth App의 Authorization callback URL을
   `https://etasxbaorwgjoofdxean.supabase.co/auth/v1/callback` 로 갱신
3. Dashboard → Authentication → URL Configuration → **Redirect URLs에 두 개 모두** 등록:
   - `https://comfyui-studio.com`
   - `https://comfyui-studio.com/showcase`

⚠️ 3번을 한쪽만 등록하면 어느 페이지에서 로그인했는지에 따라 결과가 달라지는 버그가 됩니다.

> 설정 후 확인: 게시물을 하나 올려보고 `username`이 본인 GitHub 핸들로 채워지는지
> 보세요. 트리거가 `auth.identities`에서 읽으므로, GitHub OAuth가 연결되어 있지
> 않으면 `anonymous`로 기록됩니다.

### 2. 게시물 모더레이션 UI

DB 수단(`hidden_at`)과 운영 절차는 준비돼 있지만 전용 화면이 없어 SQL Editor를
거쳐야 합니다. 게시물이 실제로 쌓이기 시작하면(= OAuth 설정 이후) 만드는 것이
순서에 맞습니다.

---

## 남은 과제 (이번 작업 범위 밖)

- **⚠️ `dl_*` 테이블 13개가 익명 사용자에게 전면 개방** — 아래 별도 섹션 참조.
- **프로젝트 분리**: ComfyUI Studio와 `pf_*`/`dl_*` 앱들이 DB 용량·egress·anon key·Auth
  설정을 공유합니다. RLS로 데이터 접근은 막았지만, 용량과 egress는 여전히 공유
  자원이라 한쪽의 과부하가 다른 쪽을 스로틀합니다.
- **구 프로젝트 데이터 이관**: 일시정지된 `pkwbqbxuujpcvndpacsc`에 기존 게시물이 있다면,
  프로젝트를 재개해 export해야 합니다. `user_id`가 `auth.users` FK라 계정 uuid가 다르면
  소유권 복원이 불가능합니다(재로그인해도 본인 글로 인식되지 않아 삭제 불가).
- **`pf_*` RLS 적용 후 회귀 확인**: PromForge 저장소에서 `.from("pf_` 를 grep해
  anon key로 직접 접근하는 경로가 없는지 확인하세요. 있었다면 8/3부터 조용히 빈
  배열을 반환하고 있을 것입니다(RLS 차단은 에러가 아니라 0행).
- **`pg_net` 확장이 public 스키마에 설치됨** (advisor WARN).

---

## ⚠️ 미해결 — `dl_*` 테이블 익명 전면 개방 (판단 필요)

### 확인된 사실

`pg_policies` 조회 결과, `dl_*` 13개 테이블의 정책이 모두 동일합니다:

```
roles = {public}   cmd = ALL   qual = true   with_check = true
```

`{public}` 롤은 `anon`을 포함하고 `ALL`은 SELECT/INSERT/UPDATE/DELETE 전부입니다.
즉 **RLS가 켜져 있지만 정책이 모든 것을 허용**하고 있어, 실질 노출은 RLS를 끈 것과 같습니다.

ComfyUI Studio의 anon key는 공개 번들에 평문으로 들어갑니다(정적 SPA에서는 불가피).
따라서 **comfyui-studio.com 방문자 누구나 아래 데이터를 읽고, 고치고, 지울 수 있습니다.**

| 테이블 | 행 수 | 내용 |
|---|---|---|
| `dl_students` | 224 | 학생 정보 |
| `dl_attendance` | 315 | 출결 기록 |
| `dl_comments` | 8 | 코멘트 |
| `dl_daily_reports` | 4 | 일일 보고 |
| `dl_counseling` | 1 | 상담 기록 |
| `dl_evaluations` | 1 | 평가 |
| `dl_career_change_requests` | 0 | 진로 변경 요청 |
| `dl_documents` | 2 | 문서 (+ `dl-documents` 버킷도 공개 목록 조회 가능) |

정책 이름이 전부 `demo_*` / `dl_demo_*` 인 것으로 보아 **데모용 임시 정책이 그대로 남은 것**으로 보입니다.

### `pf_*` 때와 무엇이 다른가

`pf_*`는 `pf-api` 엣지 함수가 13개 테이블 전부를 `service_role`로 접근하고
자체 인증(bcrypt + `x-pf-token`)을 쓴다는 **코드 근거**가 있어, RLS를 켜도 앱이
멈추지 않는다고 판단할 수 있었습니다.

`dl_*`는 그 근거가 없습니다. 이 프로젝트의 엣지 함수를 확인했으나 `dl_*`를 다루는
전용 API가 없습니다. 정황상 **해당 앱이 anon key로 DB에 직접 접근**하는 클라이언트
SPA일 가능성이 높고, 그렇다면 정책을 좁히는 순간 그 앱이 멈춥니다.

**그래서 자동으로 적용하지 않았습니다.** 잘못 건드리면 운영 중인 앱과 학생 데이터
접근이 끊깁니다.

### 판단에 필요한 확인

해당 앱의 코드에서 다음을 확인해 주세요.

1. `createClient(...)`에 **anon key**를 쓰는지, **service_role**을 쓰는지
2. `.from('dl_` 형태로 DB에 **직접 접근**하는지, 아니면 별도 서버/함수를 거치는지
3. Supabase Auth로 **로그인**을 하는지 (`authenticated` 롤을 쓸 수 있는지)

### 확인 결과별 조치

**(A) 앱이 Supabase Auth 로그인을 사용하는 경우** — 가장 깔끔합니다.

```sql
-- 익명은 차단하고 로그인 사용자에게만 허용
drop policy if exists "dl_demo_all_students" on public.dl_students;
create policy "dl_students_authenticated" on public.dl_students
  for all to authenticated using (true) with check (true);
-- 나머지 12개 테이블도 동일 패턴
```

**(B) 앱이 로그인 없이 anon key로 직접 접근하는 경우** — 구조를 바꿔야 합니다.
`pf-api` 같은 엣지 함수를 두어 `service_role`로 접근하게 하고, 그 뒤에 RLS를 잠급니다.
당장의 임시 완화로는 최소한 삭제만이라도 막을 수 있습니다.

```sql
-- 익명 삭제/수정만 차단 (읽기·쓰기는 유지 — 임시 조치)
drop policy if exists "dl_demo_all_students" on public.dl_students;
create policy "dl_students_read"   on public.dl_students for select using (true);
create policy "dl_students_insert" on public.dl_students for insert with check (true);
-- UPDATE/DELETE 정책을 만들지 않는 것이 곧 차단
```

**(C) 이미 사용하지 않는 데모라면** — 데이터를 백업 후 테이블을 삭제하거나,
정책을 모두 제거해 `service_role` 전용으로 잠그십시오.

> 어느 쪽이든 **스테이징에서 먼저 확인**하고, 적용 직후 해당 앱의 주요 화면이
> 정상 동작하는지 눈으로 확인하세요. RLS 차단은 에러가 아니라 **빈 결과**로
> 나타나므로 화면상 "데이터 없음"으로 조용히 보입니다.
