"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDF0F3" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "#800020" }}>
            <span className="text-2xl">🍫</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Biteez Admin</h1>
          <p className="text-sm mt-1" style={{ color: "#800020" }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ background: "white", boxShadow: "0 4px 32px rgba(45,0,10,0.10)", border: "1px solid #F5D0D8" }}>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#800020" }}>
              Username
            </label>
            <input
              autoFocus
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ border: "1.5px solid #F5D0D8", color: "#2D000A", background: "#FDF8F9" }}
              onFocus={e => (e.target.style.borderColor = "#800020")}
              onBlur={e  => (e.target.style.borderColor = "#F5D0D8")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#800020" }}>
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ border: "1.5px solid #F5D0D8", color: "#2D000A", background: "#FDF8F9" }}
              onFocus={e => (e.target.style.borderColor = "#800020")}
              onBlur={e  => (e.target.style.borderColor = "#F5D0D8")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: loading ? "#F5D0D8" : "#800020",
              color:      loading ? "#A05068" : "white",
              cursor:     loading ? "not-allowed" : "pointer",
            }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
