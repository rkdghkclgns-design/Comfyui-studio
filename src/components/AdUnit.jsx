import React, { useEffect, useRef } from "react";

export default function AdUnit({ slot = "", format = "auto", style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
      console.warn("AdSense push error:", e);
    }
  }, []);

  return (
    <div style={{ textAlign: "center", margin: "32px 0", minHeight: 100, ...style }}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: "block" }}
        data-ad-client="ca-pub-2318294479713516"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
