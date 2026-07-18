"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, LayoutDashboard, ShoppingBag, Package, LogOut, Layers, Gift, FolderTree, Settings, CircleDollarSign, Images, Truck } from "lucide-react";

const nav = [
  {
    href:  "/dashboard",
    label: "Dashboard",
    Icon:  LayoutDashboard,
    desc:  "Overview & analytics",
  },
  {
    href:  "/dashboard/orders",
    label: "Orders",
    Icon:  ShoppingBag,
    desc:  "Manage customer orders",
  },
  {
    href:  "/dashboard/products",
    label: "Products",
    Icon:  Package,
    desc:  "Product catalogue",
  },
  {
    href:  "/dashboard/stickers",
    label: "Stickers",
    Icon:  Layers,
    desc:  "Manage sticker library",
  },
  {
    href:  "/dashboard/extras",
    label: "Extras",
    Icon:  Gift,
    desc:  "Candles, balloons & cards",
  },
  {
    href:  "/dashboard/categories",
    label: "Categories",
    Icon:  FolderTree,
    desc:  "Manage menu categories",
  },
  {
    href:  "/dashboard/slideshow",
    label: "Slideshow",
    Icon:  Images,
    desc:  "Home page banner images",
  },
  {
    href:  "/dashboard/delivery",
    label: "Delivery",
    Icon:  Truck,
    desc:  "Time slots & order limits",
  },
  {
    href:  "/dashboard/pricing",
    label: "Pricing",
    Icon:  CircleDollarSign,
    desc:  "Shapes, extras & addon prices",
  },
  {
    href:  "/dashboard/settings",
    label: "Settings",
    Icon:  Settings,
    desc:  "Shape images & writing limits",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed top-0 left-0 z-30 h-full w-64 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0 md:static md:z-auto md:h-screen md:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          background: "linear-gradient(180deg, #3d0a14 0%, #2a0710 100%)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
        }}
      >
        {/* Pink top accent line */}
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #FF6B9D, #3d0a14)" }} />

        {/* ── Logo / Brand ── */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Icon mark */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,107,157,0.18)", border: "1px solid rgba(255,107,157,0.25)" }}
              >
                <span style={{ color: "#FF6B9D", fontSize: 16, fontWeight: 800, lineHeight: 1 }}>B</span>
              </div>
              <div>
                <p className="font-bold text-white text-base leading-none tracking-wide">Biteez</p>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-md mt-0.5 inline-block"
                  style={{ background: "rgba(255,107,157,0.18)", color: "#FF6B9D" }}
                >
                  Admin
                </span>
              </div>
            </div>

            {/* Mobile close */}
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <X size={15} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p
            className="text-[9px] font-bold tracking-[0.2em] uppercase mb-3 px-3"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            Menu
          </p>

          <div className="space-y-1">
            {nav.map(({ href, label, Icon, desc }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative overflow-hidden"
                  style={{
                    background: active ? "rgba(255,255,255,0.10)" : "transparent",
                    border: active
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid transparent",
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Active left accent bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                      style={{ background: "#FF6B9D" }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: active
                        ? "rgba(255,107,157,0.20)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon
                      size={15}
                      style={{ color: active ? "#FF6B9D" : "rgba(255,255,255,0.45)" }}
                    />
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold leading-none"
                      style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.65)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 leading-none truncate"
                      style={{ color: "rgba(255,255,255,0.30)" }}
                    >
                      {desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── Bottom: sign out ── */}
        <div className="px-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="pt-4">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <LogOut size={14} style={{ color: "rgba(255,255,255,0.40)" }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Sign out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
