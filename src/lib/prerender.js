// Build-time prerendering runs the app in headless Chrome and serializes the
// resulting DOM. Anything rendered there is frozen into the static HTML until the
// next deploy, so two kinds of content must opt out:
//   - ads (a loaded <ins> makes the live page's push() abort, earning nothing)
//   - user-submitted content (a deleted post would keep serving until redeploy)
export function isPrerender() {
  if (typeof window === "undefined") return true;
  return Boolean(window.__PRERENDER_INJECTED) || navigator.webdriver === true;
}
