"use client";

import Link from "next/link";
import { Shield, LayoutDashboard, Users } from "lucide-react";

const roles = [
  {
    href: "/superadmin",
    icon: Shield,
    color: "var(--indi-400)",
    bg: "rgba(99,102,241,0.12)",
    hoverBorder: "var(--indi-500)",
    title: "Super Admin",
    desc: "Platform-wide control. All workspaces, integrations, providers, AI, and system health.",
    tags: ["Providers", "AI / LLM", "Billing"],
  },
  {
    href: "/admin",
    icon: LayoutDashboard,
    color: "var(--cyan)",
    bg: "rgba(6,182,212,0.12)",
    hoverBorder: "var(--cyan)",
    title: "Workspace Admin",
    desc: "Manage leads, campaigns, team, integrations, and performance for your organization.",
    tags: ["Leads", "Campaigns", "Team"],
  },
  {
    href: "/user",
    icon: Users,
    color: "var(--mint)",
    bg: "rgba(16,185,129,0.12)",
    hoverBorder: "var(--mint)",
    title: "Agent",
    desc: "Your daily workspace — conversations, pipeline, tasks, and Emma AI at your side.",
    tags: ["Emma AI", "Pipeline", "Tasks"],
  },
];

export function RoleCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
      {roles.map((r) => (
        <Link key={r.href} href={r.href} style={{ textDecoration: "none" }}>
          <div
            style={{
              background: "rgba(19,24,38,0.5)",
              border: "1px solid rgba(37,43,63,0.6)",
              borderRadius: "var(--radius-xl)",
              padding: 32,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = r.hoverBorder)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(37,43,63,0.6)")}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-lg)",
                background: r.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <r.icon size={24} style={{ color: r.color }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>{r.title}</h2>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.55, marginBottom: 24 }}>
              {r.desc}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {r.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-md)",
                    fontSize: 11,
                    fontWeight: 500,
                    background: r.bg,
                    color: r.color,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
