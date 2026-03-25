import React from "react";
import ContentLayout from "../components/ContentLayout.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function PrivacyPage() {
  const T = THEMES.dark;
  const h2 = { fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginTop: 40, marginBottom: 16, color: T.text };
  const p = { fontSize: 15, color: T.text2, lineHeight: 1.8, marginBottom: 16 };

  return (
    <ContentLayout title="개인정보처리방침" description="ComfyUI Studio 개인정보처리방침">
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, marginBottom: 12, color: T.text }}>개인정보처리방침</h1>
        <p style={{ fontSize: 13, color: T.text4, marginBottom: 32 }}>최종 수정일: 2026년 3월 20일</p>

        <p style={p}>
          ComfyUI Studio(이하 "서비스")는 이용자의 개인정보 보호를 중요하게 생각하며,
          개인정보 보호법 등 관련 법령을 준수하고 있습니다.
        </p>

        <h2 style={h2}>1. 수집하는 정보</h2>
        <p style={p}>
          ComfyUI Studio는 웹 브라우저에서 실행되는 클라이언트 측 애플리케이션으로,
          별도의 서버를 통한 개인정보 수집을 하지 않습니다.
          다만, 다음 정보가 브라우저의 로컬 저장소(localStorage)에 저장됩니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>언어 설정 (한국어, 영어, 중국어, 일본어)</li>
          <li>테마 설정 (다크/라이트 모드)</li>
          <li>GPU VRAM 설정</li>
          <li>워크플로우 생성 기록</li>
          <li>튜토리얼 진행 상황</li>
        </ul>
        <p style={p}>이 데이터는 사용자의 브라우저에만 저장되며, 외부 서버로 전송되지 않습니다.</p>

        <h2 style={h2}>2. 제3자 서비스</h2>
        <p style={p}>
          본 서비스는 다음의 제3자 서비스를 사용합니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li><strong>Google AdSense</strong>: 광고 게재를 위해 사용됩니다. Google은 쿠키를 사용하여 이전 방문 기록을 기반으로 관련성 높은 광고를 표시할 수 있습니다.</li>
          <li><strong>Google Gemini API</strong>: AI 워크플로우 생성을 위해 Supabase Edge Function을 통해 호출됩니다. 사용자의 프롬프트가 API로 전송될 수 있으며, 개인정보는 포함되지 않습니다.</li>
        </ul>

        <h2 style={h2}>3. 쿠키 정책</h2>
        <p style={p}>
          Google AdSense는 광고 게재 및 성과 측정을 위해 쿠키를 사용할 수 있습니다.
          사용자는 브라우저 설정을 통해 쿠키를 관리하거나 거부할 수 있습니다.
          Google의 광고 개인화에 대한 자세한 내용은
          Google의 광고 정책 페이지를 참고하세요.
        </p>

        <h2 style={h2}>4. 데이터 보안</h2>
        <p style={p}>
          본 서비스는 HTTPS 암호화를 통해 데이터를 보호합니다.
          모든 사용자 데이터는 브라우저의 로컬 저장소에만 보관되며,
          외부 서버에 저장되지 않습니다.
        </p>

        <h2 style={h2}>5. 이용자의 권리</h2>
        <p style={p}>
          이용자는 다음의 권리를 가집니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>브라우저 로컬 저장소의 데이터를 언제든지 삭제할 수 있습니다</li>
          <li>쿠키 사용을 거부할 수 있습니다</li>
          <li>광고 개인화를 비활성화할 수 있습니다</li>
        </ul>

        <h2 style={h2}>6. 변경 사항</h2>
        <p style={p}>
          본 개인정보처리방침은 변경될 수 있으며,
          변경 시 본 페이지에 공지합니다.
        </p>

        <h2 style={h2}>7. 문의</h2>
        <p style={p}>
          개인정보 처리에 대한 문의는 GitHub 저장소의 Issues를 통해 접수할 수 있습니다.
        </p>
      </article>
    </ContentLayout>
  );
}
