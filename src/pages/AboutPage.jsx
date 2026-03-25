import React from "react";
import { Link } from "react-router-dom";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

export default function AboutPage() {
  const T = THEMES.dark;

  return (
    <ContentLayout title="About" description="ComfyUI Studio 소개 및 문의">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 0" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, marginBottom: 32, color: T.text }}>About ComfyUI Studio</h1>

        {/* Intro */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>
            ComfyUI Studio는 AI 이미지 생성을 위한 ComfyUI 워크플로우를
            쉽고 빠르게 만들어주는 무료 온라인 도구입니다.
          </p>
          <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, marginBottom: 16 }}>
            ComfyUI의 복잡한 노드 연결 과정을 AI가 자동으로 처리해주어,
            초보자부터 전문가까지 누구나 편안하게 사용할 수 있습니다.
          </p>
        </section>

        {/* Features Summary */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 20, color: T.text }}>주요 기능</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["🎨", "AI 워크플로우 생성", "원하는 이미지를 설명하면 최적의 ComfyUI 워크플로우를 자동 생성"],
              ["📚", "모델 추천", "VRAM에 맞는 최적의 모델을 추천"],
              ["🔧", "노드 레퍼런스", "모든 ComfyUI 노드의 상세 설명 및 활용법"],
              ["🎓", "튜토리얼", "단계별 강의와 퀴즈로 체계적 학습"],
              ["⚡", "원클릭 설치", "Windows, macOS 지원 원클릭 설치 스크립트"],
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

        <AdUnit slot="5130868986" format="auto" />  {/* about-bottom */}

        {/* Links */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 20, color: T.text }}>링크</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["💻", "GitHub", "https://github.com/rkdghkclgns-design/Comfyui-studio"],
              ["🌐", "ComfyUI 공식 사이트", "https://www.comfy.org/"],
              ["🖼️", "Civitai (모델)", "https://civitai.com/"],
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
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 16, color: T.text }}>문의</h2>
          <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.8 }}>
            버그 신고, 기능 요청, 기타 문의는 GitHub Issues를 통해 접수해주세요.
          </p>
          <a href="https://github.com/rkdghkclgns-design/Comfyui-studio/issues" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block", marginTop: 12, padding: "10px 24px", borderRadius: 10,
            fontSize: 14, fontWeight: 600, background: T.bg3, color: T.text, textDecoration: "none",
            border: `1px solid ${T.border2}`,
          }}>
            GitHub Issues 열기
          </a>
        </section>
      </div>
    </ContentLayout>
  );
}
