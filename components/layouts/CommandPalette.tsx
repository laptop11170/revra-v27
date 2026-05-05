"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, ArrowUp, ArrowDown, CornerDownLeft, Hash, Phone, MessageSquare, Calendar, Users, Settings, Target, FileText, Bot, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Search index — all searchable items across the app
interface SearchItem {
  id: string;
  type: "lead" | "page" | "action" | "contact";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  url?: string;
  action?: () => void;
}

const LEADS = [
  { id: "l1", name: "Michael Torres", phone: "(555) 234-8901", type: "Medicare" },
  { id: "l2", name: "Linda Chen", phone: "(555) 345-6789", type: "ACA" },
  { id: "l3", name: "Robert Williams", phone: "(555) 456-1234", type: "Final Expense" },
  { id: "l4", name: "Patricia Moore", phone: "(555) 111-2233", type: "Medicare" },
  { id: "l5", name: "James Wilson", phone: "(555) 222-3344", type: "Life Insurance" },
  { id: "l6", name: "Nancy Garcia", phone: "(555) 789-0123", type: "Final Expense" },
];

const PAGES: SearchItem[] = [
  { id: "p1", type: "page", title: "Dashboard", subtitle: "Your daily overview", icon: <Target size={16} />, url: "/user" },
  { id: "p2", type: "page", title: "Pipeline", subtitle: "All your leads", icon: <FileText size={16} />, url: "/user/pipeline" },
  { id: "p3", type: "page", title: "Call History", subtitle: "View past calls", icon: <Phone size={16} />, url: "/user/calls" },
  { id: "p4", type: "page", title: "Text Messages", subtitle: "SMS & iMessage conversations", icon: <MessageSquare size={16} />, url: "/user/texts" },
  { id: "p5", type: "page", title: "Emma AI", subtitle: "AI voice campaigns", icon: <Bot size={16} />, url: "/user/ai" },
  { id: "p6", type: "page", title: "Calendar", subtitle: "Appointments & schedule", icon: <Calendar size={16} />, url: "/user/calendar" },
  { id: "p7", type: "page", title: "Team", subtitle: "Channels & direct messages", icon: <Users size={16} />, url: "/user/team" },
  { id: "p8", type: "page", title: "Settings", subtitle: "Profile & preferences", icon: <Settings size={16} />, url: "/user/settings" },
  { id: "p9", type: "page", title: "Lead Pool", subtitle: "Admin: unassigned leads", icon: <Hash size={16} />, url: "/admin/lead-pool" },
  { id: "p10", type: "page", title: "Team Management", subtitle: "Admin: manage agents", icon: <Users size={16} />, url: "/admin/team" },
  { id: "p11", type: "page", title: "Workflows", subtitle: "Admin: automation rules", icon: <Bot size={16} />, url: "/admin/workflows" },
  { id: "p12", type: "page", title: "Platform Overview", subtitle: "Super Admin dashboard", icon: <Target size={16} />, url: "/superadmin" },
];

const ACTIONS: SearchItem[] = [
  { id: "a1", type: "action", title: "Add New Lead", subtitle: "Create a new lead record", icon: <Target size={16} />, action: () => {} },
  { id: "a2", type: "action", title: "Start Dialer", subtitle: "Begin calling session", icon: <Phone size={16} />, action: () => {} },
  { id: "a3", type: "action", title: "Import CSV", subtitle: "Bulk import leads", icon: <FileText size={16} />, action: () => {} },
  { id: "a4", type: "action", title: "New Appointment", subtitle: "Schedule a meeting", icon: <Calendar size={16} />, action: () => {} },
  { id: "a5", type: "action", title: "New Campaign", subtitle: "Create Emma AI campaign", icon: <Bot size={16} />, action: () => {} },
  { id: "a6", type: "action", title: "New Channel", subtitle: "Create team channel", icon: <Hash size={16} />, action: () => {} },
  { id: "a7", type: "action", title: "Invite Team Member", subtitle: "Add a new agent", icon: <Users size={16} />, action: () => {} },
  { id: "a8", type: "action", title: "Export Report", subtitle: "Download performance report", icon: <FileText size={16} />, action: () => {} },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectLead?: (lead: typeof LEADS[0]) => void;
}

export function CommandPalette({ open, onClose, onSelectLead }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Build search index
  const leadItems: SearchItem[] = LEADS.map((l) => ({
    id: l.id,
    type: "lead",
    title: l.name,
    subtitle: `${l.phone} · ${l.type}`,
    icon: <Target size={16} />,
    action: () => { onSelectLead?.(l); onClose(); },
  }));

  const allItems = [...leadItems, ...PAGES, ...ACTIONS];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems;

  // Group by type
  const leads = filtered.filter((i) => i.type === "lead");
  const pages = filtered.filter((i) => i.type === "page");
  const actions = filtered.filter((i) => i.type === "action");

  const flatList = [...leads, ...pages, ...actions];

  React.useEffect(() => { setSelectedIndex(0); }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") {
        const item = flatList[selectedIndex];
        if (item) {
          if (item.url) { router.push(item.url); onClose(); }
          else if (item.action) { item.action(); onClose(); }
        }
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, flatList, selectedIndex, router, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[200]" onClick={onClose} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[201] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search size={18} className="text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, pages, or actions..."
              className="flex-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <kbd className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {leads.length > 0 && (
              <div>
                <p className="px-4 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Leads</p>
                {leads.map((item) => {
                  const globalIndex = flatList.indexOf(item);
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      selected={selectedIndex === globalIndex}
                      onClick={() => { item.action?.(); onClose(); }}
                    />
                  );
                })}
              </div>
            )}
            {pages.length > 0 && (
              <div>
                <p className="px-4 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Pages</p>
                {pages.map((item) => {
                  const globalIndex = flatList.indexOf(item);
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      selected={selectedIndex === globalIndex}
                      onClick={() => { if (item.url) { router.push(item.url); onClose(); } }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    />
                  );
                })}
              </div>
            )}
            {actions.length > 0 && (
              <div>
                <p className="px-4 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</p>
                {actions.map((item) => {
                  const globalIndex = flatList.indexOf(item);
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      selected={selectedIndex === globalIndex}
                      onClick={() => { item.action?.(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    />
                  );
                })}
              </div>
            )}
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-sm text-gray-400 text-center">No results for "{query}"</p>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            <span className="flex items-center gap-1"><ArrowUp size={10} /><ArrowDown size={10} /> navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft size={10} /> select</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ResultRow({ item, selected, onClick, onMouseEnter }: { item: SearchItem; selected: boolean; onClick: () => void; onMouseEnter?: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
        selected ? "bg-blue-50" : "hover:bg-gray-50"
      )}
    >
      <span className={cn("flex-shrink-0", selected ? "text-blue-600" : "text-gray-400")}>{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", selected ? "text-blue-700" : "text-gray-900")}>{item.title}</p>
        {item.subtitle && <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>}
      </div>
      {selected && <ChevronRight size={14} className="text-blue-400 flex-shrink-0" />}
    </button>
  );
}

// Global keyboard listener component (place once in layout)
export function CommandPaletteTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {children}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}