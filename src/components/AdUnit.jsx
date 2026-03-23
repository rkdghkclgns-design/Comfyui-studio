import React, { useEffect, useRef } from "react";

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

export default function AdUnit({ slot, format = "auto", style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot) return;
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
  }, [slot]);

  if (!slot) return null;

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
