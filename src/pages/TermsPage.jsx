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
        <p style={{ fontSize: 13, color: T.text4, marginBottom: 32 }}>최종 수정일: 2026년 8월 4일</p>

        <h2 style={h2}>1. 서비스 개요</h2>
        <p style={p}>
          ComfyUI Studio(이하 "서비스")는 AI 이미지 생성을 위한 ComfyUI 워크플로우를
          자동으로 생성해주는 무료 웹 기반 도구이며, 이용자가 워크플로우를 공유할 수 있는
          커뮤니티 게시판(이하 "쇼케이스")을 함께 제공합니다.
          본 서비스를 사용함으로써 본 약관에 동의하는 것으로 간주합니다.
        </p>

        <h2 style={h2}>2. 이용 조건</h2>
        <p style={p}>
          워크플로우 생성 등 대부분의 기능은 로그인 없이 무료로 이용할 수 있습니다.
          쇼케이스에 게시물을 등록하거나 삭제하려면 GitHub 계정 로그인이 필요합니다.
          다음의 행위는 금지됩니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>서비스를 이용한 불법적인 콘텐츠 생성</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>AI 기능을 자동화 도구로 과도하게 호출하거나 사용량 제한을 우회하는 행위</li>
          <li>타인의 계정을 도용하거나 다른 이용자·운영자를 사칭하는 행위</li>
        </ul>

        <h2 style={h2}>3. 쇼케이스 게시물 (이용자 제작 콘텐츠)</h2>

        <p style={{ ...p, fontWeight: 600, color: T.text, marginBottom: 8 }}>3.1 저작권과 이용 허락</p>
        <p style={p}>
          이용자가 등록한 게시물의 저작권은 이용자에게 있습니다.
          다만 이용자는 게시물을 등록함으로써, 서비스가 해당 게시물을 서비스 내에 표시·복제·전송하고
          검색 노출 및 서비스 홍보에 사용할 수 있는 <strong>비독점적·무상의 이용 권한</strong>을
          서비스에 부여합니다. 이 권한은 이용자가 게시물을 삭제하면 소멸합니다.
          다만 다른 이용자가 이미 내려받은 워크플로우 파일까지 회수되지는 않습니다.
        </p>

        <p style={{ ...p, fontWeight: 600, color: T.text, marginBottom: 8 }}>3.2 게시 금지 콘텐츠</p>
        <p style={p}>다음에 해당하는 게시물은 등록할 수 없습니다.</p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>악성 코드를 포함하거나, 신뢰할 수 없는 출처의 커스텀 노드·스크립트 설치를 유도하는 워크플로우</li>
          <li>타인의 저작권·상표권·초상권을 침해하는 콘텐츠</li>
          <li>음란물, 아동을 성적으로 대상화한 콘텐츠, 실존 인물의 비동의 성적 이미지</li>
          <li>폭력·혐오·차별을 조장하거나 타인을 괴롭히는 콘텐츠</li>
          <li>타인의 개인정보를 포함한 콘텐츠</li>
          <li>광고, 스팸, 피싱 링크, 서비스와 무관한 반복 게시물</li>
          <li>타인의 게시물을 무단으로 복제해 자신의 것으로 등록하는 행위</li>
        </ul>
        <p style={p}>
          <strong>다운로드 시 주의</strong> — 쇼케이스의 워크플로우는 이용자가 직접 올린 것으로
          서비스가 사전에 검수하지 않습니다. 내려받은 워크플로우를 실행하기 전에 내용을
          확인하시고, 낯선 커스텀 노드를 요구하는 경우 출처를 반드시 확인하십시오.
        </p>

        <p style={{ ...p, fontWeight: 600, color: T.text, marginBottom: 8 }}>3.3 게시물 삭제 및 이용 제한</p>
        <p style={p}>
          서비스는 게시물이 3.2에 해당하거나 법령을 위반한다고 판단되는 경우,
          사전 통지 없이 해당 게시물을 삭제하거나 노출을 제한할 수 있습니다.
          위반이 반복되거나 그 정도가 중대한 경우 해당 계정의 게시 기능 이용을 제한할 수 있습니다.
          삭제·제한 조치에 이의가 있는 이용자는 제6조의 문의 창구를 통해 재검토를 요청할 수 있습니다.
        </p>

        <p style={{ ...p, fontWeight: 600, color: T.text, marginBottom: 8 }}>3.4 신고</p>
        <p style={p}>
          위반 게시물을 발견한 경우 GitHub 저장소의 Issues를 통해 신고할 수 있습니다.
          공개 저장소이므로 신고 시 게시물 제목이나 링크만 남기시고
          본인의 개인정보는 적지 마십시오.
        </p>

        <h2 style={h2}>4. 생성된 콘텐츠에 대한 책임</h2>
        <p style={p}>
          서비스를 통해 생성된 워크플로우 및 이미지에 대한 책임은 이용자에게 있습니다.
          AI로 생성된 콘텐츠는 저작권, 초상권 등 법적 문제가 발생할 수 있으며,
          이에 대한 책임은 이용자에게 있습니다.
          쇼케이스 게시물의 내용에 대한 책임은 해당 게시물을 등록한 이용자에게 있습니다.
        </p>

        <h2 style={h2}>5. 면책 조항</h2>
        <p style={p}>
          서비스는 "있는 그대로" 제공되며, 명시적이든 묵시적이든 어떠한 보증도 하지 않습니다.
          서비스 사용으로 인한 손해에 대해 책임을 지지 않습니다.
          이에는 다음이 포함되지만 이에 국한되지 않습니다:
        </p>
        <ul style={{ ...p, paddingLeft: 24 }}>
          <li>서비스 중단이나 오류로 인한 손해</li>
          <li>생성된 워크플로우의 부정확성으로 인한 손해</li>
          <li>AI 모델의 한계로 인한 문제</li>
          <li>다른 이용자가 등록한 게시물로 인해 발생한 손해</li>
          <li>AI 기능의 일일 사용량 한도 도달로 인한 일시적 이용 제한</li>
        </ul>

        <h2 style={h2}>6. 지적재산권</h2>
        <p style={p}>
          ComfyUI Studio의 디자인 및 서비스 콘텐츠에 대한 권리는 서비스 운영자에게 있습니다.
          소스 코드는 GitHub 저장소에 공개되어 있으며, 저장소에 명시된 라이선스 조건을 따릅니다.
          이용자가 생성하거나 등록한 워크플로우의 권리는 제3조에 따릅니다.
        </p>

        <h2 style={h2}>7. 약관 변경</h2>
        <p style={p}>
          본 약관은 변경될 수 있으며, 변경된 약관은 본 페이지에 게시된 시점부터 효력이 발생합니다.
          이용자에게 불리한 중요한 변경이 있는 경우 서비스 내에 별도로 공지합니다.
        </p>

        <h2 style={h2}>8. 문의</h2>
        <p style={p}>
          약관에 대한 문의, 게시물 신고, 삭제 조치에 대한 이의 제기는
          GitHub 저장소의 Issues를 통해 접수할 수 있습니다.
        </p>
      </article>
    </ContentLayout>
  );
}
