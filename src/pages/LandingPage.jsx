import React from "react";
import { Link } from "react-router-dom";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";

const SERIF = "'Source Serif 4','Georgia',serif";

const FEATURES = [
  { icon: "🎨", title: "AI 워크플로우 생성", desc: "원하는 이미지를 설명하면 AI가 최적의 ComfyUI 워크플로우를 자동으로 생성합니다. 초보자도 복잡한 노드 연결 없이 바로 사용할 수 있습니다." },
  { icon: "📚", title: "모델 추천", desc: "Civitai의 수천 개 모델 중 용도와 VRAM에 맞는 최적의 모델을 추천합니다. 체크포인트, LoRA, ControlNet 등 다양한 유형을 지원합니다." },
  { icon: "🔧", title: "노드 레퍼런스", desc: "ComfyUI의 모든 노드에 대한 상세 설명, 입력/출력 타입, 파라미터 가이드를 제공합니다. 노드 사용법을 한눈에 파악하세요." },
  { icon: "🎓", title: "튜토리얼", desc: "단계별 슬라이드 강의와 퀴즈로 ComfyUI를 체계적으로 배울 수 있습니다. 초급부터 중급까지 다양한 난이도를 제공합니다." },
  { icon: "⚡", title: "원클릭 설치", desc: "Windows, macOS 모두 지원하는 원클릭 설치 스크립트로 ComfyUI를 쉽게 설치하세요. Python, Git, 모델까지 자동으로 설정됩니다." },
  { icon: "🌐", title: "다국어 지원", desc: "한국어, 영어, 중국어, 일본어 4개 언어를 지원합니다. 원하는 언어로 편안하게 사용하세요." },
];

const STEPS = [
  { num: "1", title: "카테고리 선택", desc: "생성하고 싶은 이미지 유형을 선택하세요. 인물, 풍경, 애니메이션, 업스케일 등 다양한 카테고리를 제공합니다." },
  { num: "2", title: "설정 및 구성", desc: "해상도, 샘플러, 모델, 프롬프트 등 워크플로우 설정을 조정하세요. VRAM에 맞춰 최적화됩니다." },
  { num: "3", title: "워크플로우 생성", desc: "AI가 설정에 맞는 최적의 ComfyUI 워크플로우 JSON을 생성합니다. 바로 복사해서 사용하세요!" },
];

const GUIDE_PREVIEWS = [
  { slug: "comfyui-beginners-guide", title: "ComfyUI 초보자 가이드", desc: "처음 시작하는 분들을 위한 설치부터 첫 워크플로우 실행까지" },
  { slug: "comfyui-workflow-guide", title: "ComfyUI 워크플로우 완벽 가이드", desc: "노드 구성, 연결, 고급 기능까지 완벽 정복" },
  { slug: "comfyui-model-guide", title: "ComfyUI 모델 설치 및 추천", desc: "체크포인트, LoRA, ControlNet 모델 활용법" },
];

export default function LandingPage() {
  const T = THEMES.dark;

  return (
    <ContentLayout title="AI 워크플로우 생성기" description="ComfyUI Studio는 AI 이미지 생성을 위한 워크플로우를 쉽게 만들어주는 도구입니다.">
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 0 40px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: T.text }}>
          ComfyUI 워크플로우를<br />
          <span style={{ color: T.accent }}>AI로 쉽게</span> 만드세요
        </h1>
        <p style={{ fontSize: 18, color: T.text2, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7 }}>
          ComfyUI Studio는 복잡한 노드 구성 없이 원하는 이미지 생성 워크플로우를
          자동으로 생성해주는 무료 온라인 도구입니다.
          초보자부터 전문가까지 누구나 편안하게 사용할 수 있습니다.
        </p>
        <Link to="/" style={{
          display: "inline-block", padding: "14px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          background: T.accent2, color: "#fff", textDecoration: "none", transition: "transform 0.2s",
        }}>
          무료로 시작하기 &rarr;
        </Link>
      </section>

      {/* Features */}
      <section style={{ padding: "40px 0" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", marginBottom: 40, color: T.text }}>주요 기능</h2>
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
        <h2 style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", marginBottom: 40, color: T.text }}>사용 방법</h2>
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
        <h2 style={{ fontFamily: SERIF, fontSize: 28, textAlign: "center", marginBottom: 12, color: T.text }}>가이드</h2>
        <p style={{ textAlign: "center", color: T.text2, fontSize: 15, marginBottom: 32 }}>
          ComfyUI를 더 잘 활용하기 위한 가이드를 확인하세요.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {GUIDE_PREVIEWS.map((g, i) => (
            <Link key={i} to={`/guides/${g.slug}`} style={{
              textDecoration: "none", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24,
              transition: "border-color 0.2s",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>{g.title}</h3>
              <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>{g.desc}</p>
              <span style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: T.accent, fontWeight: 600 }}>읽어보기 &rarr;</span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/guides" style={{ fontSize: 14, color: T.accent, textDecoration: "none", fontWeight: 600 }}>모든 가이드 보기 &rarr;</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "60px 0 40px" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, marginBottom: 16, color: T.text }}>지금 바로 시작하세요</h2>
        <p style={{ fontSize: 15, color: T.text2, marginBottom: 24 }}>별도의 설치 없이 브라우저에서 바로 사용할 수 있습니다.</p>
        <Link to="/" style={{
          display: "inline-block", padding: "14px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          background: T.accent2, color: "#fff", textDecoration: "none",
        }}>
          ComfyUI Studio 열기 &rarr;
        </Link>
      </section>
    </ContentLayout>
  );
}
