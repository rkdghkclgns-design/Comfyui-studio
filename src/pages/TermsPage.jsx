import React from "react";
import ContentLayout from "../components/ContentLayout.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function TermsPage() {
  const T = THEMES.dark;
  const h2 = { fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginTop: 40, marginBottom: 16, color: T.text };
  const p = { fontSize: 15, color: T.text2, lineHeight: 1.8, marginBottom: 16 };

  return (
    <ContentLayout title="이용약관" description="ComfyUI Studio 이용약관">
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, marginBottom: 12, color: T.text }}>이용약관</h1>
        <p style={{ fontSize: 13, color: T.text4, marginBottom: 32 }}>최종 수정일: 2026년 3월 20일</p>

        <h2 style={h2}>1. 서비스 개요</h2>
        <p style={p}>
          ComfyUI Studio(이하 "서비스")는 AI 이미지 생성을 위한 ComfyUI 워크플로우를
          자동으로 생성해주는 무료 웹 기반 도구입니다.
          본 서비스를 사용함으로써 본 약관에 동의하는 것으로 간주합니다.
        </p>

        <h2 style={h2}>2. 이용 조건</h2>
        <p style={p}>
          서비스는 무료로 제공되며, 별도의 회원가입 없이 사용할 수 있습니다.
          다만, 다음의 행위는 금지됩니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>서비스를 이용한 불법적인 콘텐츠 생성</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>API를 비정상적으로 과도하게 호출하는 행위</li>
          <li>서비스의 코드를 무단으로 복제하여 상업적으로 이용하는 행위</li>
        </ul>

        <h2 style={h2}>3. 생성된 콘텐츠에 대한 책임</h2>
        <p style={p}>
          서비스를 통해 생성된 워크플로우 및 이미지에 대한 책임은 사용자에게 있습니다.
          AI로 생성된 콘텐츠는 저작권, 초상권 등 법적 문제가 발생할 수 있으며,
          이에 대한 책임은 사용자에게 있습니다.
        </p>

        <h2 style={h2}>4. 면책 조항</h2>
        <p style={p}>
          서비스는 "있는 그대로" 제공되며, 비트의 아무런 보증을 하지 않습니다.
          서비스 사용으로 인한 손해에 대해 책임을 지지 않습니다.
          이에는 다음이 포함되지만 이에 국한되지 않습니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>서비스 중단이나 오류로 인한 손해</li>
          <li>생성된 워크플로우의 부정확성으로 인한 손해</li>
          <li>AI 모델의 한계로 인한 문제</li>
        </ul>

        <h2 style={h2}>5. 지적재산권</h2>
        <p style={p}>
          ComfyUI Studio의 소스 코드, 디자인, 콘텐츠에 대한 지적재산권은
          서비스 운영자에게 있습니다. 사용자가 생성한 워크플로우의
          사용 권한은 사용자에게 있습니다.
        </p>

        <h2 style={h2}>6. 약관 변경</h2>
        <p style={p}>
          본 약관은 사전 공지 없이 변경될 수 있으며,
          변경된 약관은 본 페이지에 게시된 시점부터 효력이 발생합니다.
        </p>

        <h2 style={h2}>7. 문의</h2>
        <p style={p}>
          약관에 대한 문의는 GitHub 저장소의 Issues를 통해 접수할 수 있습니다.
        </p>
      </article>
    </ContentLayout>
  );
}
