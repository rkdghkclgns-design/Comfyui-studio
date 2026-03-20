import React from "react";

export default function DonationButtons({ theme: T }) {
  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    textDecoration: "none", border: `1px solid ${T.border2}`, color: T.text,
    background: T.bg3, cursor: "pointer", transition: "opacity 0.2s",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <a href="https://github.com/sponsors/rkdghkclgns-design" target="_blank" rel="noopener noreferrer" style={btnStyle}>
        <span style={{ fontSize: 16 }}>&#10084;&#65039;</span> GitHub Sponsor
      </a>
      <a href="https://ko-fi.com/comfyuistudio" target="_blank" rel="noopener noreferrer" style={btnStyle}>
        <span style={{ fontSize: 16 }}>&#9749;</span> Ko-fi
      </a>
    </div>
  );
}
