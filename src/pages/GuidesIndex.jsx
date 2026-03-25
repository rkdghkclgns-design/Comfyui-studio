import React from "react";
import { Link } from "react-router-dom";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";
import { GUIDES } from "../content/guides.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function GuidesIndex() {
  const T = THEMES.dark;

  return (
    <ContentLayout title="ComfyUI 가이드" description="ComfyUI 사용법, 워크플로우, 모델 가이드 모음">
      <section style={{ padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, textAlign: "center", marginBottom: 12, color: T.text }}>ComfyUI 가이드</h1>
        <p style={{ textAlign: "center", color: T.text2, fontSize: 16, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          ComfyUI를 더 잘 활용하기 위한 단계별 가이드입니다.
          초보자부터 중급자까지 누구나 쉽게 따라할 수 있습니다.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40 }}>
          {GUIDES.map((g, i) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} style={{
              textDecoration: "none", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28,
              display: "flex", flexDirection: "column", transition: "border-color 0.2s, transform 0.2s",
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, textTransform: "uppercase", marginBottom: 8 }}>{g.category}</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 12, lineHeight: 1.4 }}>{g.title}</h2>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, margin: 0, flex: 1 }}>{g.description}</p>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.text4 }}>{g.date}</span>
                <span style={{ fontSize: 13, color: T.accent, fontWeight: 600 }}>읽어보기 &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        <AdUnit slot="4387665358" format="auto" />  {/* guides-index */}

        <div style={{ textAlign: "center", marginTop: 40, padding: "32px", background: T.bg2, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 12, color: T.text }}>지금 바로 시작하세요</h3>
          <p style={{ fontSize: 14, color: T.text2, marginBottom: 20 }}>ComfyUI Studio에서 AI 워크플로우를 자동으로 생성해보세요.</p>
          <Link to="/" style={{
            display: "inline-block", padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: T.accent2, color: "#fff", textDecoration: "none",
          }}>ComfyUI Studio 열기 &rarr;</Link>
        </div>
      </section>
    </ContentLayout>
  );
}
