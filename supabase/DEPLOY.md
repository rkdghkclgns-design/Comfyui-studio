# 배포 상태 (joha-gallery / etasxbaorwgjoofdxean)

## ✅ 적용 완료

| 항목 | 상태 |
|---|---|
| `gemini-proxy` v5 배포 | ✅ version 4 ACTIVE |
| `showcase_posts` 테이블 + RLS + 신원 트리거 | ✅ |
| Gemini 사용량 쿼터 (예산 1만원/월) | ✅ |
| `pf_*` 13개 테이블 RLS | ✅ |
| `verify_admin_password` anon 권한 회수 | ✅ |

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

### 2. 함수 search_path 고정 (advisor WARN 11건)

권한 제한으로 적용하지 못했습니다. SQL Editor에서 실행하세요 —
[`migrations/20260803_pf_rls_hardening.sql`](migrations/20260803_pf_rls_hardening.sql)
하단에 주석 처리된 11줄입니다.

### 3. 프런트엔드 배포

프런트엔드가 프록시 v3의 `task` 계약을 쓰도록 바뀌었습니다. 서버는 이미 v3이므로
배포하면 즉시 맞물립니다. 배포 후:

```bash
grep -c adsbygoogle-status dist/landing/index.html
```

`0`이어야 합니다. 0이 아니면 광고가 정적 HTML에 박제된 것이라 해당 슬롯 수익이
발생하지 않습니다.

---

## 남은 과제 (이번 작업 범위 밖)

- **프로젝트 분리**: ComfyUI Studio와 `pf_*`/`dl_*` 앱들이 DB 용량·egress·anon key·Auth
  설정을 공유합니다. RLS로 데이터 접근은 막았지만, 용량과 egress는 여전히 공유
  자원이라 한쪽의 과부하가 다른 쪽을 스로틀합니다.
- **`dl_*` 테이블의 `using(true)` 정책**: advisor가 WARN 14건을 보고합니다. 이름이
  `demo_*`인 것으로 보아 데모용 임시 정책 같은데, `dl_students`에 224행,
  `dl_attendance`에 315행의 실제 데이터가 있습니다. 별도 검토가 필요합니다.
- **구 프로젝트 데이터 이관**: 일시정지된 `pkwbqbxuujpcvndpacsc`에 기존 게시물이 있다면,
  프로젝트를 재개해 export해야 합니다. `user_id`가 `auth.users` FK라 계정 uuid가 다르면
  소유권 복원이 불가능합니다(재로그인해도 본인 글로 인식되지 않아 삭제 불가).
- **개인정보처리방침 갱신**: 현재 AdSense와 Gemini만 고지하고 있으나, 실제로는 GitHub
  사용자명·아바타·계정 uuid를 Supabase에 저장합니다. Supabase(처리 위탁자) 고지와
  삭제 요청 경로가 필요합니다.
- **App.jsx 분할**: 4,400줄 단일 파일이라 이번에 발견된 무음 고장들(공유 링크, 히스토리
  미저장)이 오래 방치됐습니다.
