import "./storage-polyfill.js";
import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const GuidesIndex = lazy(() => import("./pages/GuidesIndex.jsx"));
const GuideArticle = lazy(() => import("./pages/GuideArticle.jsx"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage.jsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));

const Loading = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#040404", color: "#e8e4dc", fontFamily: "'DM Sans', sans-serif" }}>
    Loading...
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/guides" element={<GuidesIndex />} />
        <Route path="/guides/:slug" element={<GuideArticle />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
