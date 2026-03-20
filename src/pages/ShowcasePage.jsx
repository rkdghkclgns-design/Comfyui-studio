import React, { useState, useEffect, useCallback } from "react";
import ContentLayout from "../components/ContentLayout.jsx";
import AdUnit from "../components/AdUnit.jsx";
import { THEMES } from "../theme.js";
import { supabase } from "../lib/supabase.js";

const SERIF = "'Source Serif 4','Georgia',serif";

const TAG_OPTIONS = ["txt2img", "img2img", "controlnet", "upscale", "inpaint", "anime", "realistic", "SDXL", "Flux", "SD1.5", "LoRA", "video"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export default function ShowcasePage() {
  const T = THEMES.dark;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", workflow_json: "", tags: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("showcase_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!err) setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // GitHub login
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin + "/showcase" },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.title.trim() || !formData.workflow_json.trim()) {
      setError("Title and Workflow JSON are required.");
      return;
    }
    // Validate JSON
    try { JSON.parse(formData.workflow_json); } catch { setError("Invalid JSON format."); return; }

    setSubmitting(true);
    setError("");
    const { error: insertErr } = await supabase.from("showcase_posts").insert({
      user_id: user.id,
      username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || "anonymous",
      avatar_url: user.user_metadata?.avatar_url || null,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      workflow_json: formData.workflow_json.trim(),
      tags: formData.tags,
    });
    setSubmitting(false);
    if (insertErr) { setError(insertErr.message); return; }
    setFormData({ title: "", description: "", workflow_json: "", tags: [] });
    setShowForm(false);
    fetchPosts();
  };

  // Delete post
  const handleDelete = async (postId) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("showcase_posts").delete().eq("id", postId);
    setSelectedPost(null);
    fetchPosts();
  };

  // Copy JSON
  const copyJSON = (json) => {
    navigator.clipboard.writeText(json).catch(() => {});
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border2}`, background: T.bg3, color: T.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };

  return (
    <ContentLayout title="Showcase" description="ComfyUI Studio \uCEE4\uBBA4\uB2C8\uD2F0 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uAC8C\uC2DC\uD310">
      <section style={{ padding: "40px 0" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 800, marginBottom: 8, color: T.text }}>Showcase</h1>
            <p style={{ fontSize: 15, color: T.text2, margin: 0 }}>\uB098\uC758 ComfyUI \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uACF5\uC720\uD558\uACE0 \uB2E4\uB978 \uC0AC\uB78C\uB4E4\uC758 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uD0D0\uC0C9\uD558\uC138\uC694.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user ? (
              <>
                <img src={user.user_metadata?.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                <span style={{ fontSize: 13, color: T.text2 }}>{user.user_metadata?.user_name}</span>
                <button onClick={() => setShowForm(true)} style={{
                  padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: T.accent2, color: "#fff", fontSize: 13, fontWeight: 700,
                }}>+ Share Workflow</button>
                <button onClick={handleLogout} style={{
                  padding: "8px 14px", borderRadius: 10, border: `1px solid ${T.border2}`,
                  background: "transparent", color: T.text2, fontSize: 12, cursor: "pointer",
                }}>Logout</button>
              </>
            ) : (
              <button onClick={handleLogin} style={{
                padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "#24292f", color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                Login with GitHub
              </button>
            )}
          </div>
        </div>

        {/* Post Form Modal */}
        {showForm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowForm(false)}>
            <div style={{ background: T.bg2, borderRadius: 20, padding: 32, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontFamily: SERIF, fontSize: 24, marginBottom: 24, color: T.text }}>Share Your Workflow</h2>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: T.text2, marginBottom: 6, display: "block" }}>Title *</label>
                  <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="My awesome workflow" maxLength={100} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: T.text2, marginBottom: 6, display: "block" }}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="What does this workflow do?" rows={3} maxLength={500} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: T.text2, marginBottom: 6, display: "block" }}>Workflow JSON *</label>
                  <textarea value={formData.workflow_json} onChange={e => setFormData(p => ({ ...p, workflow_json: e.target.value }))} placeholder='{"nodes": [...], "connections": [...]}' rows={6} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: T.text2, marginBottom: 8, display: "block" }}>Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {TAG_OPTIONS.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                        padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${formData.tags.includes(tag) ? T.accent : T.border}`,
                        background: formData.tags.includes(tag) ? `${T.accent}20` : "transparent",
                        color: formData.tags.includes(tag) ? T.accent : T.text3,
                      }}>{tag}</button>
                    ))}
                  </div>
                </div>
                {error && <p style={{ color: "#e55", fontSize: 13, margin: 0 }}>{error}</p>}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border2}`, background: "transparent", color: T.text2, cursor: "pointer", fontSize: 13 }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.accent2, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: submitting ? 0.5 : 1 }}>
                    {submitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelectedPost(null)}>
            <div style={{ background: T.bg2, borderRadius: 20, padding: 32, maxWidth: 700, width: "100%", maxHeight: "90vh", overflow: "auto", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: SERIF, fontSize: 24, marginBottom: 8, color: T.text }}>{selectedPost.title}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {selectedPost.avatar_url && <img src={selectedPost.avatar_url} alt="" style={{ width: 20, height: 20, borderRadius: "50%" }} />}
                    <span style={{ fontSize: 13, color: T.text2 }}>{selectedPost.username}</span>
                    <span style={{ fontSize: 12, color: T.text4 }}>{timeAgo(selectedPost.created_at)}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", color: T.text2, fontSize: 20, cursor: "pointer" }}>&times;</button>
              </div>
              {selectedPost.description && <p style={{ fontSize: 14, color: T.text2, marginBottom: 16, lineHeight: 1.6 }}>{selectedPost.description}</p>}
              {selectedPost.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {selectedPost.tags.map(tag => <span key={tag} style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, background: `${T.accent}15`, color: T.accent, border: `1px solid ${T.accent}30` }}>{tag}</span>)}
                </div>
              )}
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: T.text2, fontWeight: 600 }}>Workflow JSON</span>
                  <button onClick={() => copyJSON(selectedPost.workflow_json)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.bg3, color: T.text2, fontSize: 12, cursor: "pointer" }}>Copy</button>
                </div>
                <pre style={{ background: T.bg, padding: 16, borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.text2, overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {selectedPost.workflow_json}
                </pre>
              </div>
              {user && user.id === selectedPost.user_id && (
                <button onClick={() => handleDelete(selectedPost.id)} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, border: `1px solid #e55`, background: "transparent", color: "#e55", fontSize: 12, cursor: "pointer" }}>Delete Post</button>
              )}
            </div>
          </div>
        )}

        <AdUnit slot="" format="auto" />

        {/* Posts Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text2 }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: T.text2 }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No workflows shared yet.</p>
            <p style={{ fontSize: 14 }}>Be the first to share your ComfyUI workflow!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {posts.map(post => (
              <div key={post.id} onClick={() => setSelectedPost(post)} style={{
                background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {post.avatar_url && <img src={post.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: "50%" }} />}
                  <span style={{ fontSize: 12, color: T.text2, fontWeight: 500 }}>{post.username}</span>
                  <span style={{ fontSize: 11, color: T.text4, marginLeft: "auto" }}>{timeAgo(post.created_at)}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.3 }}>{post.title}</h3>
                {post.description && <p style={{ fontSize: 13, color: T.text2, margin: "0 0 12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</p>}
                {post.tags?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {post.tags.slice(0, 4).map(tag => <span key={tag} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, background: `${T.accent}12`, color: T.accent, border: `1px solid ${T.accent}25` }}>{tag}</span>)}
                    {post.tags.length > 4 && <span style={{ fontSize: 10, color: T.text4, padding: "2px 4px" }}>+{post.tags.length - 4}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </ContentLayout>
  );
}
