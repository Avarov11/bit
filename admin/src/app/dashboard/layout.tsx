"use client";

import { useState } from "react";
import { Menu, EyeOff } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function ReadOnlyBanner() {
  const { isReadOnly, username } = useAuth();
  if (!isReadOnly) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
      style={{ background: "#fef3c7", color: "#92400e", borderBottom: "1px solid #fde68a" }}>
      <EyeOff size={13} />
      Signed in as <strong>{username}</strong> — Read-only mode. Changes are disabled.
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile top bar ── */}
        <header
          className="md:hidden flex items-center gap-3 px-4 sticky top-0 z-10"
          style={{
            background: "linear-gradient(90deg, #3d0a14 0%, #2a0710 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            height: 56,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Menu size={17} className="text-white/80" />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,107,157,0.20)", border: "1px solid rgba(255,107,157,0.25)" }}
            >
              <span style={{ color: "#FF6B9D", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>B</span>
            </div>
            <span className="font-bold text-white text-sm tracking-wide">Biteez</span>
            <span
              className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(255,107,157,0.18)", color: "#FF6B9D" }}
            >
              Admin
            </span>
          </div>

          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#FF6B9D" }} />
        </header>

        <ReadOnlyBanner />

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
}
