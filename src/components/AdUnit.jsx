import React, { useEffect, useRef, useState } from "react";
import { isPrerender } from "../lib/prerender.js";

const AD_CLIENT = "ca-pub-2318294479713516";
let scriptLoaded = false;

function ensureAdScript() {
  if (scriptLoaded) return;
  if (document.querySelector(`script[src*="adsbygoogle.js?client=${AD_CLIENT}"]`)) {
    scriptLoaded = true;
    return;
  }
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
  scriptLoaded = true;
}

// AdSense는 "콘텐츠가 없거나 가치가 낮은 화면"에 광고를 싣는 것을 금지한다.
// 개별 페이지에서 조건을 거는 것만으로는 새 페이지를 추가할 때마다 같은 실수를
// 반복하게 되므로, 컴포넌트 자체가 마지막 방어선이 된다.
const MIN_BODY_CHARS = 1800;

export default function AdUnit({ slot, format = "auto", style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);
  // Mount ads only after hydration on a real browser, so the prerendered HTML
  // contains a plain placeholder and the live page owns the ad lifecycle.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isPrerender()) return;
    // 하이드레이션 직후에는 본문이 아직 안 그려졌을 수 있어 한 프레임 뒤에 잰다.
    const t = setTimeout(() => {
      const chars = (document.body?.innerText || "").replace(/\s+/g, " ").length;
      if (chars >= MIN_BODY_CHARS) setEnabled(true);
      else console.warn(`AdUnit: 본문 ${chars}자로 최소 ${MIN_BODY_CHARS}자 미달 — 광고를 렌더하지 않음`);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!slot || !enabled) return;
    ensureAdScript();
    const timer = setTimeout(() => {
      if (pushed.current) return;
      try {
        if (window.adsbygoogle && adRef.current) {
          window.adsbygoogle.push({});
          pushed.current = true;
        }
      } catch (e) {
        console.warn("AdSense push error:", e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slot, enabled]);

  if (!slot) return null;

  // Reserve the space during prerender/SSR without emitting an <ins> for AdSense to claim.
  if (!enabled) {
    return <div style={{ textAlign: "center", margin: "32px 0", minHeight: 100, ...style }} />;
  }

  return (
    <div style={{ textAlign: "center", margin: "32px 0", minHeight: 100, ...style }}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
