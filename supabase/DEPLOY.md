# 배포 체크리스트 (joha-gallery / etasxbaorwgjoofdxean)

MCP 권한 제한으로 아래 항목은 코드로 자동 적용하지 못했습니다.
**위에서부터 순서대로** 진행하세요 — 순서가 바뀌면 부분 장애가 생깁니다.

---

## 0. (선행) Google Cloud 예산 상한 — 오늘 안에

가장 중요합니다. 프록시 코드를 아무리 고쳐도, 예산 상한이 없으면 사고 시 손실에 바닥이 없습니다.

1. https://console.cloud.google.com/billing → Budgets & alerts
2. Gemini API를 쓰는 프로젝트에 월 예산 + 50% / 90% / 100% 알림 설정
3. 가능하면 Generative Language API에 **쿼터 상한**도 별도 설정

---

## 1. Edge Function 재배포 (`gemini-proxy` v3)

**무엇이 바뀌나:** 이전 버전은 클라이언트가 `model`·`maxOutputTokens`·Imagen `sampleCount`를
자유롭게 지정할 수 있어, 인증 없이 누구나 비싼 모델을 무제한 호출할 수 있었습니다.
v3는 그 값을 전부 서버에서 고정합니다.

- Dashboard → Edge Functions → `gemini-proxy` → Code
- [`functions/gemini-proxy/index.ts`](functions/gemini-proxy/index.ts) 전체 내용으로 교체 → Deploy
- `verify_jwt`는 **false 유지** (비로그인 사용자도 AI 기능을 쓰므로)

⚠️ **`ALLOWED_ORIGINS`를 실제 도메인으로 확인하세요.** 현재 값:
`comfyui-studio.com`, `www.comfyui-studio.com`, `localhost:5173`, `localhost:4173`.
도메인이 다르면 모든 AI 기능이 403으로 막힙니다.

> 다음 단계(권장): Origin 헤더는 위조 가능하므로 완전한 방어가 아닙니다.
> 실사용량을 본 뒤 IP 단위 rate limit(예: Upstash Redis) 또는 Turnstile 추가를 검토하세요.

---

## 2. showcase_posts 테이블 생성

- Dashboard → SQL Editor
- [`migrations/20260731_create_showcase_posts.sql`](migrations/20260731_create_showcase_posts.sql) 붙여넣고 Run

포함된 방어:
- 길이/개수 CHECK — 계정 하나가 DB 용량을 고갈시켜 **같은 프로젝트의 다른 앱까지** 멈추는 것을 방지
- `username`을 JWT의 GitHub 핸들과 일치시키는 INSERT 정책 — 공식 계정 사칭 게시 방지
  (워크플로우 JSON은 사용자가 자기 ComfyUI에 붙여넣는 실행 아티팩트이므로 사칭 위험이 큽니다)
- `avatar_url`을 `avatars.githubusercontent.com`으로 제한 — 방문자 IP 수집 방지

---

## 3. GitHub OAuth 설정

1. Dashboard → Authentication → Providers → GitHub 활성화
2. GitHub OAuth App의 Authorization callback URL을
   `https://etasxbaorwgjoofdxean.supabase.co/auth/v1/callback` 로 갱신
3. Dashboard → Authentication → URL Configuration → **Redirect URLs에 두 개 모두** 등록:
   - `https://comfyui-studio.com`
   - `https://comfyui-studio.com/showcase`

⚠️ 3번을 한쪽만 등록하면 **어느 페이지에서 로그인했는지에 따라 결과가 달라지는** 버그가 됩니다.

---

## 4. RLS 하드닝 — 검토 후 실행

[`migrations/REVIEW_BEFORE_RUNNING_rls_hardening.sql`](migrations/REVIEW_BEFORE_RUNNING_rls_hardening.sql)

이 프로젝트의 `pf_*` 테이블 13개는 RLS가 꺼져 있고, ComfyUI Studio의 anon key는
공개 번들에 평문으로 들어갑니다(정적 SPA에서는 불가피). 따라서 현재
**comfyui-studio.com 방문자 누구나 `pf_*` 앱의 데이터를 읽고 지울 수 있습니다.**

단, **RLS를 켜기만 하면 해당 앱이 즉시 멈출 수 있어** 파일 안의 주석을 읽고
정책을 함께 정의해야 합니다. 파일에는 `verify_admin_password`의 anon 실행 권한 회수도
포함되어 있습니다(관리자 비밀번호 무제한 대입이 가능한 상태).

---

## 5. 배포 후 확인

```bash
# 정상 요청 — 200
curl -s -X POST https://etasxbaorwgjoofdxean.supabase.co/functions/v1/gemini-proxy \
  -H "Content-Type: application/json" -H "Origin: https://comfyui-studio.com" \
  -d '{"task":"generate","contents":[{"parts":[{"text":"Reply with OK"}]}]}'
```

```bash
# 모델 승격 시도 — 무시되고 서버 고정 모델로 처리되어야 함
curl -s -X POST https://etasxbaorwgjoofdxean.supabase.co/functions/v1/gemini-proxy \
  -H "Content-Type: application/json" -H "Origin: https://comfyui-studio.com" \
  -d '{"model":"gemini-2.5-pro","contents":[{"parts":[{"text":"hi"}]}],"generationConfig":{"maxOutputTokens":65536}}'
```

```bash
# 외부 Origin — 403이어야 함
curl -s -X POST https://etasxbaorwgjoofdxean.supabase.co/functions/v1/gemini-proxy \
  -H "Content-Type: application/json" -H "Origin: https://evil.example" \
  -d '{"contents":[{"parts":[{"text":"hi"}]}]}'
```

빌드 산출물 확인:

```bash
grep -c adsbygoogle-status dist/landing/index.html
```

`0`이어야 합니다. 0이 아니면 광고가 정적 HTML에 박제된 것이라 해당 슬롯 수익이 발생하지 않습니다.

---

## 남은 과제 (이번 작업 범위 밖)

- **프로젝트 분리**: ComfyUI Studio와 `pf_*`/`dl_*` 앱들이 DB 용량·egress·anon key·Auth 설정을
  공유합니다. 한쪽을 겨냥한 공격이 반드시 다른 쪽을 함께 죽입니다.
- **구 프로젝트 데이터 이관**: 일시정지된 `pkwbqbxuujpcvndpacsc`에 기존 게시물이 있다면,
  프로젝트를 재개해 export해야 합니다. `user_id`가 `auth.users` FK라 계정 uuid가 다르면
  소유권 복원이 불가능하니(재로그인해도 본인 글로 인식되지 않아 삭제 불가) 이관 전에 확인하세요.
- **개인정보처리방침 갱신**: 현재 AdSense와 Gemini만 고지하고 있으나, 실제로는 GitHub 사용자명·
  아바타·계정 uuid를 Supabase에 저장합니다. Supabase(처리 위탁자) 고지와 삭제 요청 경로가 필요합니다.
- **App.jsx 분할**: 4,400줄 단일 파일이라 이번에 발견된 무음 고장들(공유 링크, 히스토리 미저장)이
  오래 방치됐습니다. i18n 사전 → `src/i18n/`, 쇼케이스 → `ShowcasePage.jsx`로 통합 권장.
