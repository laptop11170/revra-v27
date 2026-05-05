"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import {
  Home,
  MessageSquare,
  Users,
  Target,
  BarChart3,
  Plug,
  Settings,
  Sparkles,
  Megaphone,
  Workflow,
  ChevronDown,
  ChevronRight,
  Check,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RevRaAIChat } from "@/components/features/ai/RevRaAIChat";
import { useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type Role = "superadmin" | "admin" | "user";

interface ShellProps {
  children: React.ReactNode;
  role: Role;
}

const userNav: NavItem[] = [
  { label: "Home", href: "/user", icon: <Home size={17} /> },
  { label: "Conversations", href: "/user/conversations", icon: <MessageSquare size={17} /> },
  { label: "Leads", href: "/user/pipeline", icon: <Target size={17} /> },
  { label: "Campaigns", href: "/user/campaigns", icon: <Megaphone size={17} /> },
  { label: "Automations", href: "/user/automations", icon: <Workflow size={17} /> },
  { label: "Analytics", href: "/user/analytics", icon: <BarChart3 size={17} /> },
  { label: "Integrations", href: "/user/integrations", icon: <Plug size={17} /> },
  { label: "Settings", href: "/user/settings", icon: <Settings size={17} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <Home size={17} /> },
  { label: "Lead Pool", href: "/admin/lead-pool", icon: <Target size={17} /> },
  { label: "Performance", href: "/admin/performance", icon: <BarChart3 size={17} /> },
  { label: "Team", href: "/admin/team", icon: <Users size={17} /> },
  { label: "Integrations", href: "/admin/integrations", icon: <Plug size={17} /> },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: <Settings size={17} /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={17} /> },
];

const superadminNav: NavItem[] = [
  { label: "Overview", href: "/superadmin", icon: <Home size={17} /> },
  { label: "Workspaces", href: "/superadmin/workspaces", icon: <Users size={17} /> },
  { label: "Users", href: "/superadmin/users", icon: <Users size={17} /> },
  { label: "Performance", href: "/superadmin/performance", icon: <BarChart3 size={17} /> },
  { label: "Subscriptions", href: "/superadmin/subscriptions", icon: <Settings size={17} /> },
  { label: "Integrations", href: "/superadmin/integrations", icon: <Plug size={17} /> },
  { label: "AI & LLM", href: "/superadmin/ai", icon: <Sparkles size={17} /> },
  { label: "Settings", href: "/superadmin/settings", icon: <Settings size={17} /> },
];

export function Shell({ children, role }: ShellProps) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const nav = role === "superadmin" ? superadminNav : role === "admin" ? adminNav : userNav;
  const roleLabel = role === "superadmin" ? "Super Admin" : role === "admin" ? "Workspace Admin" : "Agent";

  return (
    <div className="page-shell">
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={collapsed ? { width: 64, padding: "20px 8px" } : {}}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          {!collapsed ? (
            <span className="wordmark" style={{ fontSize: 18, color: "#fff" }}>REVRA</span>
          ) : (
            <span className="wordmark" style={{ fontSize: 18, color: "#fff", display: "block", textAlign: "center" }}>R</span>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/user" && item.href !== "/admin" && item.href !== "/superadmin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("sidebar-item", isActive && "active")}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* System Status */}
          {!collapsed && (
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                background: "rgba(19,24,38,0.7)",
                border: "1px solid rgba(37,43,63,0.6)",
                padding: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 4 }}>
                <span
                  className="pulse-dot"
                  style={{ width: 6, height: 6, borderRadius: 999, background: "var(--mint)", display: "inline-block" }}
                />
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>System Status</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-mute)" }}>
                <Check size={11} style={{ color: "var(--mint)" }} />
                All systems operational
              </div>
            </div>
          )}

          {/* User card */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              background: "rgba(19,24,38,0.7)",
              border: "1px solid rgba(37,43,63,0.6)",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            ) : (
              <div
                className="avatar"
                style={{ width: 32, height: 32, background: "var(--surface-3)", color: "var(--ink)", fontSize: 11, fontWeight: 700 }}
              >
                {role === "superadmin" ? "S" : role === "admin" ? "A" : "U"}
              </div>
            )}
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>{roleLabel}</p>
                <p style={{ fontSize: 11, color: "var(--ink-mute)" }}>Pro Plan</p>
              </div>
            )}
            {!collapsed && <ChevronDown size={14} style={{ color: "var(--ink-mute)" }} />}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 8,
              padding: "8px",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--ink-mute)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.12s",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} style={{ transform: "rotate(90deg)" }} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--page)" }}>
        {/* Top bar */}
        <div className="topbar">
          <div style={{ flex: 1 }}>
            {!collapsed && (
              <div className="search-bar">
                <Search size={14} style={{ color: "var(--ink-mute)", flexShrink: 0 }} />
                <input placeholder="Search anything..." />
                <kbd>⌘K</kbd>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="btn-icon p-2" title="Help">
              <Bell size={17} />
            </button>
            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* RevRa AI Chat — only for user role */}
      {role === "user" && <RevRaAIChat />}
    </div>
  );
}