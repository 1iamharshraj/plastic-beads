import { type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Boxes,
  Palette,
  Factory,
  History,
  Settings,
  LogOut,
  Gem,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ToastProvider } from "./Toast";
import { Skeleton } from "./ui";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/materials", label: "Materials", icon: Boxes },
  { to: "/dashboard/formulas", label: "Formulas", icon: Palette },
  { to: "/dashboard/production", label: "Production", icon: Factory },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function LoadingShell() {
  return (
    <div className="app-root">
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="app-brand">
            <span className="app-brand-gem"><Gem size={15} /></span>
            <span className="app-brand-name">BeadFactory<small>PRO</small></span>
          </div>
          {NAV.map((n) => (
            <div key={n.to} style={{ padding: "4px 2px" }}><Skeleton h={40} /></div>
          ))}
        </aside>
        <main className="app-main">
          <Skeleton h={34} w={260} />
          <div style={{ height: 18 }} />
          <div className="app-grid cols-4">
            <Skeleton h={104} /><Skeleton h={104} /><Skeleton h={104} /><Skeleton h={104} />
          </div>
          <div style={{ height: 14 }} />
          <Skeleton h={300} />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const location = useLocation();

  if (isLoading) return <LoadingShell />;
  if (!user) return <LoadingShell />;

  return (
    <ToastProvider>
      <div className="app-root">
        <div className="app-shell">
          <aside className="app-sidebar">
            <Link to="/dashboard" className="app-brand" aria-label="BeadFactory Pro home">
              <span className="app-brand-gem"><Gem size={15} /></span>
              <span className="app-brand-name">BeadFactory<small>PRO</small></span>
            </Link>
            <nav aria-label="Dashboard">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => `app-nav-item${isActive ? " active" : ""}`}
                >
                  <n.icon className="app-nav-ico" size={18} />
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="app-sidebar-foot">
              <div className="app-user-chip">
                <span className="app-avatar">
                  {(user.name ?? "F").slice(0, 1).toUpperCase()}
                </span>
                <span className="app-user-meta">
                  <span className="app-user-name">{user.name ?? "Factory user"}</span>
                  <span className="app-user-mail">{user.email ?? "signed in"}</span>
                </span>
              </div>
              <button className="app-nav-item" onClick={() => logout()} style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}>
                <LogOut className="app-nav-ico" size={18} />
                Log out
              </button>
            </div>
          </aside>

          <main className="app-main">
            <div className="app-mobile-topbar">
              <Link to="/dashboard" className="app-brand" style={{ padding: 0 }}>
                <span className="app-brand-gem"><Gem size={15} /></span>
                <span className="app-brand-name">BeadFactory<small>PRO</small></span>
              </Link>
              <button className="app-btn app-btn-ghost app-btn-sm" onClick={() => logout()}>
                <LogOut size={14} /> Log out
              </button>
            </div>
            {children}
          </main>
        </div>

        <nav className="app-bottomnav" aria-label="Dashboard sections">
          {NAV.map((n) => {
            const active = n.end ? location.pathname === n.to : location.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
                <n.icon size={20} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
