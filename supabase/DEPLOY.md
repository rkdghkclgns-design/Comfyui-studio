# 배포 상태 (joha-gallery / etasxbaorwgjoofdxean)

## ✅ 적용 완료 (2026-08-02)

| 항목 | 상태 | 검증 |
|---|---|---|
| `gemini-proxy` v3 배포 | ✅ version 2 ACTIVE | 아래 검증 결과 참조 |
| `showcase_posts` 테이블 + RLS | ✅ 정책 3개, RLS on | `pg_policies` 확인 |
| Gemini 사용량 쿼터 | ✅ `gemini_usage` + `gemini_consume_quota` | 한도 초과 시 false 반환 확인 |

검증 결과:
- 정상 요청 → `200`
- 외부 Origin(`evil.example`) → `403 Origin not allowed`
- `model: "gemini-2.5-pro"` + `maxOutputTokens: 65536` 요청 → 무시되고 `modelVersion: gemini-2.5-flash`로 응답
- `inlineData` 밀반입 시도 → `400`
- 쿼터 39/40 → `true`, 추가 5 → `false`
- `anon`의 `gemini_consume_quota` 실행 권한 → 없음

---

## 💰 예산 상한 (1만원/월)

**코드로 강제하는 방식을 택했습니다.** GCP 예산 알림은 지출을 *막지 않고 알리기만* 하므로,
공격이 새벽에 시작되면 알림을 읽기 전에 이미 초과됩니다. 그래서 프록시가 Gemini를
호출하기 **전에** DB 쿼터를 차감하고, 한도를 넘으면 429로 거절합니다.

계산 근거 (1만원 ≈ USD 7/월 ≈ USD 0.23/일):

| task | 출력 상한 | units | 비고 |
|---|---|---|---|
| interview | 1,024 | 1 | |
| generate | 2,048 | 2 | 인터뷰+생성 = 3 units |
| prompt | 1,024 | 1 | |
| diagnose | 4,096 | 4 | |
| improve | 16,384 | 16 | 가장 비쌈 |

- **전체 일일 한도: 700 units** — 최악의 경우(모든 응답이 상한까지 채움) 기준이라
  실제로는 이보다 훨씬 여유롭습니다. 워크플로우 생성 기준 하루 약 230회.
- **IP당 일일 한도: 40 units** — 생성 약 13회 또는 개선 2~3회.

한도 조정은 SQL만 고치면 되고 함수 재배포가 필요 없습니다:

```sql
alter function public.gemini_consume_quota(text,integer,integer,integer)
  rename to gemini_consume_quota;  -- (예시) 아래처럼 default 값을 바꿔 재정의하세요
```

실제로는 [`migrations/20260802_gemini_quota.sql`](migrations/20260802_gemini_quota.sql)의
`p_daily_global` / `p_daily_client` 기본값을 수정해 다시 실행하면 됩니다.

사용량 확인:

```sql
select bucket, day, units from public.gemini_usage
where day >= current_date - 7 order by day desc, units desc;
```

> **그래도 GCP 예산 알림은 별도로 걸어두시길 권합니다.** 위 쿼터는 이 프록시를 통한
> 지출만 막습니다. 같은 API 키를 다른 곳에서도 쓰고 있다면 그쪽은 통제되지 않습니다.
> https://console.cloud.google.com/billing → Budgets & alerts

---

## ⏳ 남은 수동 작업

### 1. GitHub OAuth (필수 — 현재 로그인 불가)

1. Dashboard → Authentication → Providers → GitHub 활성화
2. GitHub OAuth App의 Authorization callback URL을
   `https://etasxbaorwgjoofdxean.supabase.co/auth/v1/callback` 로 갱신
3. Dashboard → Authentication → URL Configuration → **Redirect URLs에 두 개 모두** 등록:
   - `https://comfyui-studio.com`
   - `https://comfyui-studio.com/showcase`

⚠️ 3번을 한쪽만 등록하면 어느 페이지에서 로그인했는지에 따라 결과가 달라지는 버그가 됩니다.

### 2. RLS 하드닝 — 검토 후 실행

[`migrations/REVIEW_BEFORE_RUNNING_rls_hardening.sql`](migrations/REVIEW_BEFORE_RUNNING_rls_hardening.sql)

이 프로젝트의 `pf_*` 테이블 13개는 RLS가 꺼져 있고, ComfyUI Studio의 anon key는
공개 번들에 평문으로 들어갑니다(정적 SPA에서는 불가피). 따라서 현재
**comfyui-studio.com 방문자 누구나 `pf_*` 앱의 데이터를 읽고 지울 수 있습니다.**

단, **RLS를 켜기만 하면 해당 앱이 즉시 멈출 수 있어** 자동 적용하지 않았습니다.
파일 안의 주석을 읽고 각 테이블의 정책을 함께 정의하세요.
`verify_admin_password`의 anon 실행 권한 회수(관리자 비밀번호 무제한 대입 가능)도
같은 파일에 있습니다.

### 3. 프런트엔드 배포

프런트엔드가 프록시 v3의 `task` 계약을 사용하도록 바뀌었습니다. 서버는 이미 v3이므로
프런트를 배포하면 즉시 맞물립니다. 배포 후 확인:

```bash
grep -c adsbygoogle-status dist/landing/index.html
```

`0`이어야 합니다. 0이 아니면 광고가 정적 HTML에 박제된 것이라 해당 슬롯 수익이 발생하지 않습니다.

---

## 남은 과제 (이번 작업 범위 밖)

- **프로젝트 분리**: ComfyUI Studio와 `pf_*`/`dl_*` 앱들이 DB 용량·egress·anon key·Auth
  설정을 공유합니다. 한쪽을 겨냥한 공격이 반드시 다른 쪽을 함께 죽입니다.
- **구 프로젝트 데이터 이관**: 일시정지된 `pkwbqbxuujpcvndpacsc`에 기존 게시물이 있다면,
  프로젝트를 재개해 export해야 합니다. `user_id`가 `auth.users` FK라 계정 uuid가 다르면
  소유권 복원이 불가능하니(재로그인해도 본인 글로 인식되지 않아 삭제 불가) 이관 전에 확인하세요.
- **개인정보처리방침 갱신**: 현재 AdSense와 Gemini만 고지하고 있으나, 실제로는 GitHub
  사용자명·아바타·계정 uuid를 Supabase에 저장합니다. Supabase(처리 위탁자) 고지와
  삭제 요청 경로가 필요합니다.
- **App.jsx 분할**: 4,400줄 단일 파일이라 이번에 발견된 무음 고장들(공유 링크, 히스토리
  미저장)이 오래 방치됐습니다. i18n 사전 → `src/i18n/`, 쇼케이스 → `ShowcasePage.jsx`로
  통합 권장.
