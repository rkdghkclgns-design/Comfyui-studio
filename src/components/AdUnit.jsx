import React, { useEffect, useRef, useState } from "react";

const AD_CLIENT = "ca-pub-2318294479713516";
let scriptLoaded = false;

// Prerendering runs the app in headless Chrome at build time. If ads render there,
// the loaded <ins data-adsbygoogle-status="done"> is serialized into the static HTML —
// the real visitor's push() then aborts ("already have ads in them") and the slot
// earns nothing, while every build fires ad requests from a datacenter IP.
function isPrerender() {
  if (typeof window === "undefined") return true;
  return Boolean(window.__PRERENDER_INJECTED) || navigator.webdriver === true;
}

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

export default function AdUnit({ slot, format = "auto", style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);
  // Mount ads only after hydration on a real browser, so the prerendered HTML
  // contains a plain placeholder and the live page owns the ad lifecycle.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isPrerender()) setEnabled(true);
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
