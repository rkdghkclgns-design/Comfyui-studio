import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";
import { GUIDES } from "../content/guides.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function GuideArticle() {
  const { slug } = useParams();
  const T = THEMES.dark;
  const guide = GUIDES.find(g => g.slug === slug);

  if (!guide) return <Navigate to="/guides" replace />;

  const otherGuides = GUIDES.filter(g => g.slug !== slug);

  return (
    <ContentLayout title={guide.title} description={guide.description}>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "40px 0" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/guides" style={{ fontSize: 13, color: T.accent, textDecoration: "none", fontWeight: 500 }}>&larr; \uAC00\uC774\uB4DC \uBAA9\uB85D</Link>
          <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.accent, textTransform: "uppercase", marginTop: 16, marginBottom: 8 }}>{guide.category}</span>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.3, marginBottom: 12, color: T.text }}>{guide.title}</h1>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, marginBottom: 8 }}>{guide.description}</p>
          <span style={{ fontSize: 13, color: T.text4 }}>{guide.date}</span>
        </div>

        {/* Table of Contents */}
        <nav style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.text }}>\uBAA9\uCC28</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {guide.sections.map((s, i) => (
              <li key={i}>
                <a href={`#section-${i}`} style={{ fontSize: 14, color: T.accent, textDecoration: "none" }}>{s.heading}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        {guide.sections.map((s, i) => (
          <React.Fragment key={i}>
            <section id={`section-${i}`} style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 16, color: T.text, paddingTop: 16 }}>{s.heading}</h2>
              <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.8, whiteSpace: "pre-line" }}>{s.content}</div>
            </section>
            {i === 0 && <AdUnit slot="8326910361" format="auto" />}
          </React.Fragment>
        ))}

        <AdUnit slot="8326910361" format="auto" />

        {/* Related Guides */}
        {otherGuides.length > 0 && (
          <section style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${T.border}` }}>
            <h3 style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 20, color: T.text }}>\uAD00\uB828 \uAC00\uC774\uB4DC</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {otherGuides.map(g => (
                <Link key={g.slug} to={`/guides/${g.slug}`} style={{
                  textDecoration: "none", padding: 16, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>{g.title}</h4>
                    <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{g.description}</p>
                  </div>
                  <span style={{ fontSize: 13, color: T.accent, flexShrink: 0, marginLeft: 16 }}>&rarr;</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48, padding: 32, background: T.bg2, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 12, color: T.text }}>ComfyUI Studio\uB85C \uBC14\uB85C \uC2DC\uC791\uD558\uC138\uC694</h3>
          <p style={{ fontSize: 14, color: T.text2, marginBottom: 20 }}>\uBCF5\uC7A1\uD55C \uC124\uC815 \uC5C6\uC774 AI\uAC00 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uD574\uC90D\uB2C8\uB2E4.</p>
          <Link to="/" style={{
            display: "inline-block", padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: T.accent2, color: "#fff", textDecoration: "none",
          }}>ComfyUI Studio \uC5F4\uAE30 &rarr;</Link>
        </div>
      </article>
    </ContentLayout>
  );
}
