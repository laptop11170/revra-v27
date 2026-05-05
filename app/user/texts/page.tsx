"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/constants";
import { useTheme } from "@/context/theme-provider";
import {
  Search,
  Send,
  MessageSquare,
  Phone,
  Bot,
  Download,
  MoreHorizontal,
  Check,
  CheckCheck,
  Paperclip,
  Loader2,
} from "lucide-react";

type ApiConversation = {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  channel: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
};

type ApiMessage = {
  id: string;
  conversation_id: string;
  direction: string;
  body: string;
  created_at: string;
  status: string;
};

const CHANNEL_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  sms: { bg: "bg-[hsl(var(--info)_/_0.15)]", text: "text-[hsl(var(--info))]", label: "SMS" },
  imessage: { bg: "bg-[hsl(var(--muted-foreground)_/_0.1)]", text: "text-[hsl(var(--on-surface-variant))]", label: "iMessage" },
  rcs: { bg: "bg-[hsl(var(--success)_/_0.15)]", text: "text-[hsl(var(--success))]", label: "RCS" },
  whatsapp: { bg: "bg-[hsl(var(--success))]", text: "text-white", label: "WhatsApp" },
};

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function formatMessageTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function TextHistoryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [convs, setConvs] = useState<ApiConversation[]>([]);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [selectedConv, setSelectedConv] = useState<ApiConversation | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [newMsg, setNewMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        setConvs(data.conversations || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    } else {
      setMessages([]);
    }
  }, [selectedConv, fetchMessages]);

  const filteredConvs = convs.filter((c) => {
    if (channelFilter !== "all" && c.channel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.lead_name.toLowerCase().includes(q) && !c.lead_phone.includes(q)) return false;
    }
    return true;
  });

  const currentMsgs = selectedConv
    ? messages.filter((m) => m.conversation_id === selectedConv.id)
    : [];

  const handleAiDraft = async () => {
    if (!newMsg.trim()) return;
    setAiDrafting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAiDrafting(false);
    setNewMsg(
      `Hi ${selectedConv?.lead_name.split(" ")[0] || "there"}, thanks for reaching out! I'd love to help you find the right coverage. Do you have 15 minutes to chat this week?`
    );
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedConv) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMsg.trim() }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      setConvs((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: newMsg.trim(), last_message_at: new Date().toISOString(), unread_count: 0 }
            : c
        )
      );
      setNewMsg("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const channelTabs = [
    { key: "all", label: "All" },
    { key: "sms", label: "SMS" },
    { key: "imessage", label: "iMessage" },
    { key: "rcs", label: "RCS" },
    { key: "whatsapp", label: "WhatsApp" },
  ];

  const unreadCount = convs.filter((c) => c.unread_count > 0).length;

  return (
    <Shell role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--on-surface))" }}>Text Messages</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              {unreadCount} unread · {convs.length} conversations
            </p>
          </div>
          <Button variant="outline"><Download size={16} className="mr-2" />Export</Button>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-2 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          {channelTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setChannelFilter(tab.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={
                channelFilter === tab.key
                  ? { backgroundColor: "hsl(var(--primary)_/_0.12)", color: "hsl(var(--primary))" }
                  : { color: "hsl(var(--muted-foreground))", backgroundColor: "transparent" }
              }
              onMouseEnter={(e) => { if (channelFilter !== tab.key) e.currentTarget.style.backgroundColor = "hsl(var(--surface-container-low))"; }}
              onMouseLeave={(e) => { if (channelFilter !== tab.key) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversations List */}
          <Card>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
              ) : filteredConvs.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No conversations found</p>
              ) : (
                <div className="space-y-2">
                  {filteredConvs.map((conv) => {
                    const cc = CHANNEL_CONFIG[conv.channel];
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConv(conv)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                        style={
                          selectedConv?.id === conv.id
                            ? { backgroundColor: "hsl(var(--primary)_/_0.08)", border: "1px solid hsl(var(--primary)_/_0.2)" }
                            : { backgroundColor: "hsl(var(--surface-container-low))" }
                        }
                        onMouseEnter={(e) => { if (selectedConv?.id !== conv.id) e.currentTarget.style.backgroundColor = "hsl(var(--surface-container))"; }}
                        onMouseLeave={(e) => { if (selectedConv?.id !== conv.id) e.currentTarget.style.backgroundColor = "hsl(var(--surface-container-low))"; }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(conv.lead_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm" style={{ color: "hsl(var(--on-surface))" }}>{conv.lead_name}</p>
                            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{formatTime(conv.last_message_at)}</span>
                          </div>
                          <p className="text-sm truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{conv.last_message}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${cc.bg} ${cc.text}`}>
                          {conv.channel}
                        </span>
                        {conv.unread_count > 0 && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "hsl(var(--primary))" }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card>
            <CardContent className="p-4">
              {selectedConv ? (
                <div className="flex flex-col" style={{ height: "520px" }}>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(selectedConv.lead_name)}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{selectedConv.lead_name}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{selectedConv.lead_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${CHANNEL_CONFIG[selectedConv.channel].bg} ${CHANNEL_CONFIG[selectedConv.channel].text}`}>
                        {CHANNEL_CONFIG[selectedConv.channel].label}
                      </Badge>
                      <Button variant="ghost" size="sm"><Phone size={14} /></Button>
                      <Button variant="ghost" size="sm"><MoreHorizontal size={14} /></Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 size={24} className="animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
                      </div>
                    ) : currentMsgs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <MessageSquare size={32} className="mb-2" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    ) : (
                      currentMsgs.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                          <div
                            className="max-w-[75%] rounded-lg px-4 py-2"
                            style={
                              msg.direction === "outbound"
                                ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--on-primary))" }
                                : { backgroundColor: "hsl(var(--surface-bright))", color: "hsl(var(--on-surface))", border: "1px solid hsl(var(--border))" }
                            }
                          >
                            <p className="text-sm">{msg.body}</p>
                            <div className="flex items-center gap-1 mt-1" style={{ color: msg.direction === "outbound" ? "hsl(var(--on-primary)_/_0.7)" : "hsl(var(--muted-foreground))" }}>
                              <span className="text-xs">{formatMessageTime(msg.created_at)}</span>
                              {msg.direction === "outbound" && msg.status && (
                                <span className="text-xs">
                                  {msg.status === "delivered" ? <CheckCheck size={12} /> :
                                   msg.status === "sent" ? <Check size={12} /> : null}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <div className="pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <div className="flex gap-2 items-end">
                      <Button variant="ghost" size="sm"><Paperclip size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={handleAiDraft} disabled={aiDrafting || !selectedConv}>
                        <Bot size={16} className={aiDrafting ? "animate-spin" : ""} />
                      </Button>
                      <textarea
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type a message..."
                        className="flex-1 min-h-[40px] max-h-[80px] p-2 rounded-lg text-sm resize-none focus:outline-none"
                        style={{
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--surface-container-low))",
                          color: "hsl(var(--on-surface))",
                        }}
                        rows={1}
                      />
                      <Button onClick={sendMessage} disabled={!newMsg.trim()}>
                        <Send size={16} />
                      </Button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Press Enter to send · Shift+Enter for new line</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <MessageSquare size={48} className="mb-4" />
                  <p className="text-sm">Select a conversation to view messages</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}