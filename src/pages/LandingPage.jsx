import React from "react";
import { Link } from "react-router-dom";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

const FEATURES = [
  { icon: "\uD83C\uDFA8", title: "AI \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131", desc: "\uC6D0\uD558\uB294 \uC774\uBBF8\uC9C0\uB97C \uC124\uBA85\uD558\uBA74 AI\uAC00 \uCD5C\uC801\uC758 ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uD569\uB2C8\uB2E4. \uCD08\uBCF4\uC790\uB3C4 \uBCF5\uC7A1\uD55C \uB178\uB4DC \uC5F0\uACB0 \uC5C6\uC774 \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." },
  { icon: "\uD83D\uDCDA", title: "\uBAA8\uB378 \uCD94\uCC9C", desc: "Civitai\uC758 \uC218\uCC9C \uAC1C \uBAA8\uB378 \uC911 \uC6A9\uB3C4\uC640 VRAM\uC5D0 \uB9DE\uB294 \uCD5C\uC801\uC758 \uBAA8\uB378\uC744 \uCD94\uCC9C\uD569\uB2C8\uB2E4. \uCCB4\uD06C\uD3EC\uC778\uD2B8, LoRA, ControlNet \uB4F1 \uB2E4\uC591\uD55C \uC720\uD615\uC744 \uC9C0\uC6D0\uD569\uB2C8\uB2E4." },
  { icon: "\uD83D\uDD27", title: "\uB178\uB4DC \uB808\uD37C\uB7F0\uC2A4", desc: "ComfyUI\uC758 \uBAA8\uB4E0 \uB178\uB4DC\uC5D0 \uB300\uD55C \uC0C1\uC138 \uC124\uBA85, \uC785\uB825/\uCD9C\uB825 \uD0C0\uC785, \uD30C\uB77C\uBBF8\uD130 \uAC00\uC774\uB4DC\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4. \uB178\uB4DC \uC0AC\uC6A9\uBC95\uC744 \uD55C\uB208\uC5D0 \uD30C\uC545\uD558\uC138\uC694." },
  { icon: "\uD83C\uDF93", title: "\uD29C\uD1A0\uB9AC\uC5BC", desc: "\uB2E8\uACC4\uBCC4 \uC2AC\uB77C\uC774\uB4DC \uAC15\uC758\uC640 \uD034\uC988\uB85C ComfyUI\uB97C \uCCB4\uACC4\uC801\uC73C\uB85C \uBC30\uC6B8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uCD08\uAE09\uBD80\uD130 \uC911\uAE09\uAE4C\uC9C0 \uB2E4\uC591\uD55C \uB09C\uC774\uB3C4\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4." },
  { icon: "\u26A1", title: "\uC6D0\uD074\uB9AD \uC124\uCE58", desc: "Windows, macOS \uBAA8\uB450 \uC9C0\uC6D0\uD558\uB294 \uC6D0\uD074\uB9AD \uC124\uCE58 \uC2A4\uD06C\uB9BD\uD2B8\uB85C ComfyUI\uB97C \uC27D\uAC8C \uC124\uCE58\uD558\uC138\uC694. Python, Git, \uBAA8\uB378\uAE4C\uC9C0 \uC790\uB3D9\uC73C\uB85C \uC124\uC815\uB429\uB2C8\uB2E4." },
  { icon: "\uD83C\uDF10", title: "\uB2E4\uAD6D\uC5B4 \uC9C0\uC6D0", desc: "\uD55C\uAD6D\uC5B4, \uC601\uC5B4, \uC911\uAD6D\uC5B4, \uC77C\uBCF8\uC5B4 4\uAC1C \uC5B8\uC5B4\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4. \uC6D0\uD558\uB294 \uC5B8\uC5B4\uB85C \uD3B8\uC548\uD558\uAC8C \uC0AC\uC6A9\uD558\uC138\uC694." },
];

const STEPS = [
  { num: "1", title: "\uCE74\uD14C\uACE0\uB9AC \uC120\uD0DD", desc: "\uC0DD\uC131\uD558\uACE0 \uC2F6\uC740 \uC774\uBBF8\uC9C0 \uC720\uD615\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC778\uBB3C, \uD48D\uACBD, \uC560\uB2C8\uBA54\uC774\uC158, \uC5C5\uC2A4\uCF00\uC77C \uB4F1 \uB2E4\uC591\uD55C \uCE74\uD14C\uACE0\uB9AC\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4." },
  { num: "2", title: "\uC124\uC815 \uBC0F \uAD6C\uC131", desc: "\uD574\uC0C1\uB3C4, \uC0D8\uD50C\uB7EC, \uBAA8\uB378, \uD504\uB86C\uD504\uD2B8 \uB4F1 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC124\uC815\uC744 \uC870\uC815\uD558\uC138\uC694. VRAM\uC5D0 \uB9DE\uCDB0 \uCD5C\uC801\uD654\uB429\uB2C8\uB2E4." },
  { num: "3", title: "\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131", desc: "AI\uAC00 \uC124\uC815\uC5D0 \uB9DE\uB294 \uCD5C\uC801\uC758 ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0 JSON\uC744 \uC0DD\uC131\uD569\uB2C8\uB2E4. \uBC14\uB85C \uBCF5\uC0AC\uD574\uC11C \uC0AC\uC6A9\uD558\uC138\uC694!" },
];

const GUIDE_PREVIEWS = [
  { slug: "comfyui-beginners-guide", title: "ComfyUI \uCD08\uBCF4\uC790 \uAC00\uC774\uB4DC", desc: "\uCC98\uC74C \uC2DC\uC791\uD558\uB294 \uBD84\uB4E4\uC744 \uC704\uD55C \uC124\uCE58\uBD80\uD130 \uCCAB \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC2E4\uD589\uAE4C\uC9C0" },
  { slug: "comfyui-workflow-guide", title: "ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC644\uBCBD \uAC00\uC774\uB4DC", desc: "\uB178\uB4DC \uAD6C\uC131, \uC5F0\uACB0, \uACE0\uAE09 \uAE30\uB2A5\uAE4C\uC9C0 \uC644\uBCBD \uC815\uBCF5" },
  { slug: "comfyui-model-guide", title: "ComfyUI \uBAA8\uB378 \uC124\uCE58 \uBC0F \uCD94\uCC9C", desc: "\uCCB4\uD06C\uD3EC\uC778\uD2B8, LoRA, ControlNet \uBAA8\uB378 \uD65C\uC6A9\uBC95" },
];

export default function LandingPage() {
  const T = THEMES.dark;

  return (
    <ContentLayout title="AI \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131\uAE30" description="ComfyUI Studio\uB294 AI \uC774\uBBF8\uC9C0 \uC0DD\uC131\uC744 \uC704\uD55C \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC27D\uAC8C \uB9CC\uB4E4\uC5B4\uC8FC\uB294 \uB3C4\uAD6C\uC785\uB2C8\uB2E4.">
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 0 40px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: T.text }}>
          ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C<br />
          <span style={{ color: T.accent }}>AI\uB85C \uC27D\uAC8C</span> \uB9CC\uB4DC\uC138\uC694
        </h1>
        <p style={{ fontSize: 18, color: T.text2, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7 }}>
          ComfyUI Studio\uB294 \uBCF5\uC7A1\uD55C \uB178\uB4DC \uAD6C\uC131 \uC5C6\uC774 \uC6D0\uD558\uB294 \uC774\uBBF8\uC9C0 \uC0DD\uC131 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C
          \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uD574\uC8FC\uB294 \uBB34\uB8CC \uC628\uB77C\uC778 \uB3C4\uAD6C\uC785\uB2C8\uB2E4.
          \uCD08\uBCF4\uC790\uBD80\uD130 \uC804\uBB38\uAC00\uAE4C\uC9C0 \uB204\uAD6C\uB098 \uD3B8\uC548\uD558\uAC8C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
        </p>
        <Link to="/" style={{
          display: "inline-block", padding: "14px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          background: T.accent2, color: "#fff", textDecoration: "none", transition: "transform 0.2s",
        }}>
          \uBB34\uB8CC\uB85C \uC2DC\uC791\uD558\uAE30 &rarr;
        </Link>
      </section>

      {/* Features */}
      <section style={{ padding: "40px 0" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", marginBottom: 40, color: T.text }}>\uC8FC\uC694 \uAE30\uB2A5</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: T.text2, margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <AdUnit slot="2635599981" format="auto" />  {/* landing-bottom */}

      {/* How it works */}
      <section style={{ padding: "40px 0" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", marginBottom: 40, color: T.text }}>\uC0AC\uC6A9 \uBC29\uBC95</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600, margin: "0 auto" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: T.accent2, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, flexShrink: 0,
              }}>{s.num}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: T.text }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: T.text2, margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guides Preview */}
      <section style={{ padding: "40px 0" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", marginBottom: 12, color: T.text }}>\uAC00\uC774\uB4DC</h2>
        <p style={{ textAlign: "center", color: T.text2, fontSize: 15, marginBottom: 32 }}>
          ComfyUI\uB97C \uB354 \uC798 \uD65C\uC6A9\uD558\uAE30 \uC704\uD55C \uAC00\uC774\uB4DC\uB97C \uD655\uC778\uD558\uC138\uC694.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {GUIDE_PREVIEWS.map((g, i) => (
            <Link key={i} to={`/guides/${g.slug}`} style={{
              textDecoration: "none", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24,
              transition: "border-color 0.2s",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>{g.title}</h3>
              <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{g.desc}</p>
              <span style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: T.accent, fontWeight: 600 }}>\uC77D\uC5B4\uBCF4\uAE30 &rarr;</span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/guides" style={{ fontSize: 14, color: T.accent, textDecoration: "none", fontWeight: 600 }}>\uBAA8\uB4E0 \uAC00\uC774\uB4DC \uBCF4\uAE30 &rarr;</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "60px 0 40px" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, marginBottom: 16, color: T.text }}>\uC9C0\uAE08 \uBC14\uB85C \uC2DC\uC791\uD558\uC138\uC694</h2>
        <p style={{ fontSize: 15, color: T.text2, marginBottom: 24 }}>\uBCC4\uB3C4\uC758 \uC124\uCE58 \uC5C6\uC774 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uBC14\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
        <Link to="/" style={{
          display: "inline-block", padding: "14px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          background: T.accent2, color: "#fff", textDecoration: "none",
        }}>
          ComfyUI Studio \uC5F4\uAE30 &rarr;
        </Link>
      </section>
    </ContentLayout>
  );
}
