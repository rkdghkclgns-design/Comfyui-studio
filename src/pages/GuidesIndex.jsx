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
    <ContentLayout title="ComfyUI \uAC00\uC774\uB4DC" description="ComfyUI \uC0AC\uC6A9\uBC95, \uC6CC\uD06C\uD50C\uB85C\uC6B0, \uBAA8\uB378 \uAC00\uC774\uB4DC \uBAA8\uC74C">
      <section style={{ padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, textAlign: "center", marginBottom: 12, color: T.text }}>ComfyUI \uAC00\uC774\uB4DC</h1>
        <p style={{ textAlign: "center", color: T.text2, fontSize: 16, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          ComfyUI\uB97C \uB354 \uC798 \uD65C\uC6A9\uD558\uAE30 \uC704\uD55C \uB2E8\uACC4\uBCC4 \uAC00\uC774\uB4DC\uC785\uB2C8\uB2E4.
          \uCD08\uBCF4\uC790\uBD80\uD130 \uC911\uAE09\uC790\uAE4C\uC9C0 \uB204\uAD6C\uB098 \uC27D\uAC8C \uB530\uB77C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
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
                <span style={{ fontSize: 13, color: T.accent, fontWeight: 600 }}>\uC77D\uC5B4\uBCF4\uAE30 &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        <AdUnit slot="4387665358" format="auto" />  {/* guides-index */}

        <div style={{ textAlign: "center", marginTop: 40, padding: "32px", background: T.bg2, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 12, color: T.text }}>\uC9C0\uAE08 \uBC14\uB85C \uC2DC\uC791\uD558\uC138\uC694</h3>
          <p style={{ fontSize: 14, color: T.text2, marginBottom: 20 }}>ComfyUI Studio\uC5D0\uC11C AI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uD574\uBCF4\uC138\uC694.</p>
          <Link to="/" style={{
            display: "inline-block", padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: T.accent2, color: "#fff", textDecoration: "none",
          }}>ComfyUI Studio \uC5F4\uAE30 &rarr;</Link>
        </div>
      </section>
    </ContentLayout>
  );
}
