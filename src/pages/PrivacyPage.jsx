import React from "react";
import ContentLayout from "../components/ContentLayout.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function PrivacyPage() {
  const T = THEMES.dark;
  const h2 = { fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginTop: 40, marginBottom: 16, color: T.text };
  const p = { fontSize: 15, color: T.text2, lineHeight: 1.8, marginBottom: 16 };
  const th = { textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.text, fontWeight: 700 };
  const td = { padding: "8px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.text2, verticalAlign: "top" };

  return (
    <ContentLayout title="개인정보처리방침" description="ComfyUI Studio 개인정보처리방침">
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, marginBottom: 12, color: T.text }}>개인정보처리방침</h1>
        <p style={{ fontSize: 13, color: T.text4, marginBottom: 32 }}>최종 수정일: 2026년 8월 4일</p>

        <p style={p}>
          ComfyUI Studio(이하 "서비스")는 개인정보 보호법 등 관련 법령을 준수합니다.
          본 방침은 서비스가 어떤 정보를 어디에 저장하고 언제 파기하는지를 설명합니다.
        </p>

        <h2 style={h2}>1. 브라우저에만 저장되는 정보</h2>
        <p style={p}>
          다음 항목은 이용자의 브라우저 로컬 저장소(localStorage)에만 저장되며 서버로 전송되지 않습니다.
          브라우저 설정에서 언제든지 직접 삭제할 수 있습니다.
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>언어 설정 (한국어, 영어, 중국어, 일본어)</li>
          <li>테마 설정 (다크/라이트 모드)</li>
          <li>GPU VRAM 설정</li>
          <li>워크플로우 생성 기록</li>
          <li>튜토리얼 진행 상황</li>
        </ul>

        <h2 style={h2}>2. 서버에 저장되는 정보</h2>
        <p style={p}>
          아래 항목은 서비스의 데이터베이스(Supabase)에 저장됩니다.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                <th style={th}>항목</th>
                <th style={th}>수집 시점</th>
                <th style={th}>목적</th>
                <th style={th}>보관 기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>GitHub 사용자명, 프로필 이미지 주소, 계정 식별자</td>
                <td style={td}>GitHub 로그인 시</td>
                <td style={td}>게시물 작성자 표시 및 본인 확인</td>
                <td style={td}>회원 탈퇴 또는 삭제 요청 시까지</td>
              </tr>
              <tr>
                <td style={td}>쇼케이스 게시물(제목, 설명, 워크플로우 JSON, 태그)</td>
                <td style={td}>게시물 등록 시</td>
                <td style={td}>커뮤니티 게시판 운영</td>
                <td style={td}>이용자가 삭제할 때까지</td>
              </tr>
              <tr>
                <td style={td}>IP 주소</td>
                <td style={td}>AI 기능 사용 시</td>
                <td style={td}>AI 사용량 제한(비정상 사용 방지)</td>
                <td style={td}>30일</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={p}>
          IP 주소는 사용량 집계 목적으로만 사용하며 게시물이나 계정과 연결해 보관하지 않습니다.
        </p>

        <h2 style={h2}>3. 처리 위탁</h2>
        <p style={p}>서비스는 아래 사업자에게 개인정보 처리를 위탁하고 있습니다.</p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li><strong>Supabase</strong>: 데이터베이스 저장, 로그인 인증, 서버리스 함수 실행</li>
          <li><strong>GitHub</strong>: OAuth 로그인 인증</li>
          <li><strong>Google (Gemini API)</strong>: AI 워크플로우 생성·분석. 이용자가 입력한 프롬프트와 업로드한 워크플로우 내용이 API로 전송됩니다.</li>
          <li><strong>Google AdSense</strong>: 광고 게재. 쿠키를 사용해 이전 방문 기록 기반의 광고를 표시할 수 있습니다.</li>
          <li><strong>GitHub Pages</strong>: 웹사이트 호스팅</li>
        </ul>
        <p style={p}>
          <strong>AI 기능 이용 시 주의</strong> — 입력한 프롬프트와 업로드한 워크플로우 파일의 내용은
          Google의 서버로 전송됩니다. 개인정보나 민감한 정보를 입력하지 마십시오.
        </p>

        <h2 style={h2}>4. 쿠키</h2>
        <p style={p}>
          Google AdSense는 광고 게재 및 성과 측정을 위해 쿠키를 사용할 수 있습니다.
          이용자는 브라우저 설정에서 쿠키를 관리하거나 거부할 수 있으며,
          Google 광고 설정에서 광고 개인화를 비활성화할 수 있습니다.
        </p>

        <h2 style={h2}>5. 데이터 보안</h2>
        <p style={p}>
          모든 통신은 HTTPS로 암호화됩니다. 데이터베이스는 행 수준 보안(RLS)을 적용해
          본인의 게시물만 수정·삭제할 수 있도록 제한합니다.
          Google Gemini API 키는 서버 측 함수에만 보관되며 브라우저로 전달되지 않습니다.
        </p>

        <h2 style={h2}>6. 이용자의 권리</h2>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>본인이 작성한 게시물을 언제든지 삭제할 수 있습니다</li>
          <li>저장된 개인정보의 열람·정정·삭제를 요청할 수 있습니다 (아래 문의처)</li>
          <li>브라우저 로컬 저장소의 데이터를 직접 삭제할 수 있습니다</li>
          <li>쿠키 사용을 거부하고 광고 개인화를 비활성화할 수 있습니다</li>
        </ul>

        <h2 style={h2}>7. 변경 사항</h2>
        <p style={p}>
          본 방침이 변경되는 경우 본 페이지에 공지하며, 최종 수정일을 갱신합니다.
        </p>

        <h2 style={h2}>8. 문의</h2>
        <p style={p}>
          개인정보 열람·정정·삭제 요청 및 기타 문의는 GitHub 저장소의 Issues를 통해 접수할 수 있습니다.
          공개 저장소이므로 요청 시 개인정보를 본문에 적지 마시고, 연락 가능한 방법만 남겨주시면 개별적으로 안내드립니다.
        </p>
      </article>
    </ContentLayout>
  );
}
