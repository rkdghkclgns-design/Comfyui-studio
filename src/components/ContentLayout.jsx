import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { THEMES } from "../theme.js";
const FONTS = "'DM Sans','Segoe UI',sans-serif";
const SERIF = "'Source Serif 4','Georgia',serif";

const NAV_ITEMS = [
  { to: "/showcase", label: "Showcase" },
  { to: "/guides", label: "Guides" },
  { to: "/about", label: "About" },
];

export default function ContentLayout({ children, title, description }) {
  const [theme, setTheme] = useState("dark");
  const location = useLocation();
  const T = THEMES[theme];

  useEffect(() => {
    if (title) document.title = `${title} | ComfyUI Studio`;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
    window.scrollTo(0, 0);
  }, [title, description]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: FONTS, lineHeight: 1.7 }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.bg2, borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="ComfyUI Studio" style={{ width: 28, height: 28, borderRadius: 6 }} />
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 18, color: T.text }}>ComfyUI Studio</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {NAV_ITEMS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                textDecoration: "none", padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: location.pathname === to ? T.accent : T.text2,
                background: location.pathname === to ? T.glow : "transparent",
              }}>{label}</Link>
            ))}
            <Link to="/" style={{
              textDecoration: "none", padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: "#fff", background: T.accent2,
            }}>Open App</Link>
            <button onClick={toggleTheme} style={{
              background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "4px 8px", color: T.text2,
            }}>{theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px", minHeight: "calc(100vh - 200px)" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, background: T.bg2, padding: "40px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 32, marginBottom: 32 }}>
            <div>
              <h4 style={{ fontFamily: SERIF, fontSize: 16, marginBottom: 12, color: T.text }}>ComfyUI Studio</h4>
              <p style={{ fontSize: 13, color: T.text2, maxWidth: 300, margin: 0 }}>
                AI 이미지 생성을 위한 ComfyUI 워크플로우를 쉽게 만들어주는 도구입니다.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 14, marginBottom: 12, color: T.text }}>Links</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Link to="/guides" style={{ fontSize: 13, color: T.text2, textDecoration: "none" }}>Guides</Link>
                <Link to="/about" style={{ fontSize: 13, color: T.text2, textDecoration: "none" }}>About</Link>
                <Link to="/privacy" style={{ fontSize: 13, color: T.text2, textDecoration: "none" }}>Privacy Policy</Link>
                <Link to="/terms" style={{ fontSize: 13, color: T.text2, textDecoration: "none" }}>Terms of Service</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 14, marginBottom: 12, color: T.text }}>Community</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Link to="/showcase" style={{ fontSize: 13, color: T.text2, textDecoration: "none" }}>Showcase</Link>
                <a href="https://github.com/rkdghkclgns-design/Comfyui-studio" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.text2, textDecoration: "none" }}>GitHub</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, textAlign: "center", fontSize: 12, color: T.text4 }}>
            &copy; {new Date().getFullYear()} ComfyUI Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
