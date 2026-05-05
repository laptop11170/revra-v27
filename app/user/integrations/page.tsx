"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import {
  Plus,
  Plug,
  Check,
  ExternalLink,
  RefreshCw,
  Zap,
} from "lucide-react";

const categories = ["All", "Connected", "CRM", "Email", "Calendar", "Comms", "Data"];

type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  is_connected: boolean;
  initials: string;
  color: string;
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // Merge workspace connected integrations with catalog
      const workspaceIds = new Set(data.workspace.map((w: { id: string }) => w.id));
      const merged: Integration[] = data.catalog.map((cat: {
        id: string;
        name: string;
        category: string;
        description: string;
        initials: string;
        color: string;
      }) => ({
        ...cat,
        is_connected: workspaceIds.has(cat.id),
      }));

      setIntegrations(merged);
    } catch {
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return (
    <Shell role="user">
      <div style={{ padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.005em" }}>
              Integrations
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 4 }}>
              Connect Revra to your existing stack.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
              Browse marketplace
            </button>
            <button className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
              <Plus size={13} style={{ marginRight: 6 }} />
              Request integration
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filters-bar" style={{ marginBottom: 24 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat.toLowerCase())}
              className={`filter-btn ${activeTab === cat.toLowerCase() ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
            <div style={{
              width: 32,
              height: 32,
              border: "3px solid var(--line-3)",
              borderTopColor: "var(--ink)",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {integrations
              .filter((it) => {
                if (activeTab === "all") return true;
                if (activeTab === "connected") return it.is_connected;
                return it.category.toLowerCase() === activeTab;
              })
              .map((it) => (
                <div key={it.id} className="integ-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-lg)",
                        background: it.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {it.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{it.name}</h4>
                      <p style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.45 }}>{it.description}</p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTop: "1px solid var(--line-3)",
                      marginTop: 8,
                    }}
                  >
                    {it.is_connected ? (
                      <span
                        className="badge"
                        style={{
                          background: "rgba(16,185,129,0.15)",
                          color: "var(--mint)",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-md)",
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: 999, background: "var(--mint)", display: "inline-block" }} />
                        Connected
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>Not connected</span>
                    )}
                    <button
                      className="btn-ghost"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      {it.is_connected ? "Manage" : "Connect"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Shell>
  );
}