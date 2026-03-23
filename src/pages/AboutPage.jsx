import React from "react";
import { Link } from "react-router-dom";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function AboutPage() {
  const T = THEMES.dark;

  return (
    <ContentLayout title="About" description="ComfyUI Studio \uC18C\uAC1C \uBC0F \uBB38\uC758">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, marginBottom: 32, color: T.text }}>About ComfyUI Studio</h1>

        {/* Intro */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>
            ComfyUI Studio\uB294 AI \uC774\uBBF8\uC9C0 \uC0DD\uC131\uC744 \uC704\uD55C ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C
            \uC27D\uACE0 \uBE60\uB974\uAC8C \uB9CC\uB4E4\uC5B4\uC8FC\uB294 \uBB34\uB8CC \uC628\uB77C\uC778 \uB3C4\uAD6C\uC785\uB2C8\uB2E4.
          </p>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>
            ComfyUI\uC758 \uBCF5\uC7A1\uD55C \uB178\uB4DC \uC5F0\uACB0 \uACFC\uC815\uC744 AI\uAC00 \uC790\uB3D9\uC73C\uB85C \uCC98\uB9AC\uD574\uC8FC\uC5B4,
            \uCD08\uBCF4\uC790\uBD80\uD130 \uC804\uBB38\uAC00\uAE4C\uC9C0 \uB204\uAD6C\uB098 \uD3B8\uC548\uD558\uAC8C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
          </p>
        </section>

        {/* Features Summary */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 20, color: T.text }}>\uC8FC\uC694 \uAE30\uB2A5</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["\uD83C\uDFA8", "AI \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0DD\uC131", "\uC6D0\uD558\uB294 \uC774\uBBF8\uC9C0\uB97C \uC124\uBA85\uD558\uBA74 \uCD5C\uC801\uC758 ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC790\uB3D9 \uC0DD\uC131"],
              ["\uD83D\uDCDA", "\uBAA8\uB378 \uCD94\uCC9C", "VRAM\uC5D0 \uB9DE\uB294 \uCD5C\uC801\uC758 \uBAA8\uB378\uC744 \uCD94\uCC9C"],
              ["\uD83D\uDD27", "\uB178\uB4DC \uB808\uD37C\uB7F0\uC2A4", "\uBAA8\uB4E0 ComfyUI \uB178\uB4DC\uC758 \uC0C1\uC138 \uC124\uBA85 \uBC0F \uD65C\uC6A9\uBC95"],
              ["\uD83C\uDF93", "\uD29C\uD1A0\uB9AC\uC5BC", "\uB2E8\uACC4\uBCC4 \uAC15\uC758\uC640 \uD034\uC988\uB85C \uCCB4\uACC4\uC801 \uD559\uC2B5"],
              ["\u26A1", "\uC6D0\uD074\uB9AD \uC124\uCE58", "Windows, macOS \uC9C0\uC6D0 \uC6D0\uD074\uB9AD \uC124\uCE58 \uC2A4\uD06C\uB9BD\uD2B8"],
            ].map(([icon, title, desc], i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 16, background: T.bg2, borderRadius: 12, border: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AdUnit slot="8326910361" format="auto" />

        {/* Links */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 20, color: T.text }}>\uB9C1\uD06C</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["\uD83D\uDCBB", "GitHub", "https://github.com/rkdghkclgns-design/Comfyui-studio"],
              ["\uD83C\uDF10", "ComfyUI \uACF5\uC2DD \uC0AC\uC774\uD2B8", "https://www.comfy.org/"],
              ["\uD83D\uDDBC\uFE0F", "Civitai (\uBAA8\uB378)", "https://civitai.com/"],
            ].map(([icon, label, url], i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                background: T.bg2, borderRadius: 10, border: `1px solid ${T.border}`,
                textDecoration: "none", color: T.text, fontSize: 14,
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontWeight: 500 }}>{label}</span>
                <span style={{ marginLeft: "auto", color: T.text4, fontSize: 12 }}>{url.replace(/^https?:\/\//, "")}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 16, color: T.text }}>\uBB38\uC758</h2>
          <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.8 }}>
            \uBC84\uADF8 \uC2E0\uACE0, \uAE30\uB2A5 \uC694\uCCAD, \uAE30\uD0C0 \uBB38\uC758\uB294 GitHub Issues\uB97C \uD1B5\uD574 \uC811\uC218\uD574\uC8FC\uC138\uC694.
          </p>
          <a href="https://github.com/rkdghkclgns-design/Comfyui-studio/issues" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block", marginTop: 12, padding: "10px 24px", borderRadius: 10,
            fontSize: 14, fontWeight: 600, background: T.bg3, color: T.text, textDecoration: "none",
            border: `1px solid ${T.border2}`,
          }}>
            GitHub Issues \uC5F4\uAE30
          </a>
        </section>
      </div>
    </ContentLayout>
  );
}
