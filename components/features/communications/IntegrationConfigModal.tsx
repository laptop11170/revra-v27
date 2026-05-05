"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RefreshCw, Copy, ExternalLink } from "lucide-react";

interface IntegrationConfigModalProps {
  open: boolean;
  onClose: () => void;
  integration: {
    name: string;
    category: string;
    description: string;
    connected?: boolean;
    status?: "connected" | "disconnected" | "pending";
    icon: string;
    colorVar?: string;
    color?: string;
  } | null;
}

const CONFIG_FIELDS: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string; helper?: string }>> = {
  Twilio: [
    { key: "accountSid", label: "Account SID", type: "text", placeholder: "AC..." },
    { key: "authToken", label: "Auth Token", type: "password", placeholder: "••••••••" },
    { key: "phoneNumber", label: "Phone Number", type: "text", placeholder: "+1 (555) 000-0000" },
    { key: "webhookUrl", label: "Webhook URL", type: "text", helper: "Incoming calls and messages are sent here" },
  ],
  "Meta Ads": [
    { key: "adAccountId", label: "Ad Account ID", type: "text", placeholder: "act_000000000000000" },
    { key: "pageId", label: "Facebook Page ID", type: "text", placeholder: "000000000000000" },
    { key: "webhookUrl", label: "Webhook URL", type: "text", helper: "Receive lead form submissions from Meta" },
    { key: "testConnection", label: "Test Connection", type: "button" },
  ],
  "Google Calendar": [
    { key: "clientId", label: "Client ID", type: "text", placeholder: "...apps.googleusercontent.com" },
    { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Secret Key" },
    { key: "syncDirection", label: "Sync Direction", type: "select" },
  ],
  Stripe: [
    { key: "stripeKey", label: "Stripe API Key", type: "password", placeholder: "sk_..." },
    { key: "webhookSecret", label: "Webhook Secret", type: "text", helper: "Verify Stripe webhook signatures" },
  ],
  EMMA: [
    { key: "emmaApiKey", label: "EMMA API Key", type: "password", placeholder: "API Key" },
    { key: "workspaceId", label: "Workspace ID", type: "text" },
    { key: "emmaEndpoint", label: "API Endpoint", type: "text", helper: "Default: api.emmaai.com/v1" },
  ],
  Slack: [
    { key: "slackClientId", label: "Client ID", type: "text", placeholder: "xxxxxxxxxxxxxxxxxxxx" },
    { key: "slackClientSecret", label: "Client Secret", type: "password" },
    { key: "slackWebhookUrl", label: "Webhook URL", type: "text", helper: "Post notifications to a Slack channel" },
  ],
};

const DEFAULT_FIELDS = [
  { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-..." },
  { key: "webhookUrl", label: "Webhook URL", type: "text" },
];

function getColorVar(integration: IntegrationConfigModalProps["integration"]): string {
  return integration?.colorVar || integration?.color || "primary";
}

export function IntegrationConfigModal({ open, onClose, integration }: IntegrationConfigModalProps) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const fields = integration ? (CONFIG_FIELDS[integration.name] || DEFAULT_FIELDS) : [];
  const colorVar = getColorVar(integration);

  const update = (key: string, value: string) => setConfig((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSyncing(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!integration) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Configure ${integration.name}`}
      description={integration.description}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={syncing}>
            {saved ? <CheckCircle2 size={14} className="mr-1" /> : null}
            {saved ? "Saved" : "Save Configuration"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Status badge */}
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: `hsl(var(--${colorVar}))` }}>
            {integration.icon}
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: "hsl(var(--on-surface))" }}>{integration.name}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{integration.category}</p>
          </div>
          <Badge variant={integration.connected ?? integration.status === "connected" ? "success" : "default"}>
            {integration.connected ?? integration.status === "connected" ? <CheckCircle2 size={10} className="mr-1" /> : null}
            {integration.connected ?? integration.status === "connected" ? "Connected" : "Not Connected"}
          </Badge>
        </div>

        {/* Config fields */}
        {fields.map((field) => (
          <div key={field.key}>
            <Label>{field.label}</Label>
            {field.type === "select" ? (
              <select
                value={config[field.key] || "bi-directional"}
                onChange={(e) => update(field.key, e.target.value)}
                className="mt-1 w-full h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2"
                style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--surface-container-low))", color: "hsl(var(--on-surface))" }}
              >
                <option value="bi-directional">Bi-directional (both ways)</option>
                <option value="to-revra">To RevRa only</option>
                <option value="from-revra">From RevRa only</option>
              </select>
            ) : field.type === "button" ? (
              <Button variant="outline" size="sm" className="mt-1" onClick={handleSync}>
                <RefreshCw size={14} className="mr-1" />Test Connection
              </Button>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type={field.type}
                  value={config[field.key] || ""}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex-1"
                />
                {field.key.includes("secret") || field.key.includes("token") || field.key.includes("key") ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(config[field.key] || "")}
                    title="Copy"
                  >
                    {copied ? <CheckCircle2 size={14} style={{ color: "hsl(var(--success))" }} /> : <Copy size={14} />}
                  </Button>
                ) : null}
              </div>
            )}
            {field.helper && <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{field.helper}</p>}
          </div>
        ))}

        {/* Webhook URL display for integrations that receive data */}
        {(integration.name === "Twilio" || integration.name === "Meta Ads") && (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: "hsl(var(--info)_/_0.1)", border: "1px solid hsl(var(--info)_/_0.3)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium" style={{ color: "hsl(var(--info))" }}>Webhook URL</p>
              <Button variant="ghost" size="sm" onClick={() => handleCopy("https://api.revra.com/webhooks/" + integration.name.toLowerCase().replace(/\s/g, "-"))}>
                <Copy size={12} className="mr-1" />Copy
              </Button>
            </div>
            <p className="text-xs font-mono break-all" style={{ color: "hsl(var(--info))" }}>
              https://api.revra.com/webhooks/{integration.name.toLowerCase().replace(/\s/g, "-")}
            </p>
          </div>
        )}

        {/* Google Calendar OAuth */}
        {integration.name === "Google Calendar" && (
          <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: "hsl(var(--success)_/_0.1)", border: "1px solid hsl(var(--success)_/_0.3)" }}>
            <p className="text-sm font-medium mb-2" style={{ color: "hsl(var(--success))" }}>OAuth Connection</p>
            <p className="text-xs mb-3" style={{ color: "hsl(var(--success))", opacity: 0.8 }}>Connect your Google account for seamless calendar sync</p>
            <Button variant="outline" size="sm">
              <ExternalLink size={14} className="mr-1" />Connect Google Account
            </Button>
          </div>
        )}

        {/* Stripe billing portal */}
        {integration.name === "Stripe" && (
          <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "hsl(var(--primary)_/_0.1)", border: "1px solid hsl(var(--primary)_/_0.3)" }}>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>Stripe Billing Portal</p>
              <p className="text-xs" style={{ color: "hsl(var(--primary))", opacity: 0.8 }}>Manage subscriptions and invoices</p>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink size={14} className="mr-1" />Open Portal
            </Button>
          </div>
        )}

        {/* EMMA AI special config */}
        {integration.name === "EMMA" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "hsl(var(--primary)_/_0.1)" }}>
              <p className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>24</p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--primary))", opacity: 0.8 }}>Active Calls</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "hsl(var(--info)_/_0.1)" }}>
              <p className="text-2xl font-bold" style={{ color: "hsl(var(--info))" }}>1,284</p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--info))", opacity: 0.8 }}>Completed Today</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
