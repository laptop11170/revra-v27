"use client";

import React, { useState } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-provider";
import {
  Bell,
  Target,
  Phone,
  MessageSquare,
  Calendar,
  CheckCheck,
  TrendingUp,
  UserPlus,
  AlertCircle,
  Bot,
  CreditCard,
} from "lucide-react";

type NotificationType = "lead_assigned" | "stage_changed" | "call_completed" | "appointment" | "campaign" | "billing" | "system" | "member_added";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "lead_assigned", title: "Lead Assigned", description: "Michael Torres was assigned to you by Marcus Chen", time: "2 min ago", read: false, link: "/user/pipeline" },
  { id: "n2", type: "stage_changed", title: "Stage Updated", description: "Linda Chen moved to Contract stage", time: "15 min ago", read: false, link: "/user/pipeline" },
  { id: "n3", type: "call_completed", title: "Call Completed", description: "Call with James Wilson ended — 12 min duration", time: "1 hr ago", read: false, link: "/user/calls" },
  { id: "n4", type: "appointment", title: "Appointment Tomorrow", description: "Call with Patricia Moore at 10:00 AM", time: "3 hr ago", read: false, link: "/user/calendar" },
  { id: "n5", type: "campaign", title: "Campaign Paused", description: "Medicare Follow-Up campaign paused — 23 leads remaining", time: "5 hr ago", read: true, link: "/user/ai" },
  { id: "n6", type: "system", title: "New Feature Available", description: "RevRa AI Chat is now available — try it from any page", time: "1 day ago", read: true, link: "/user/ai" },
  { id: "n7", type: "billing", title: "Subscription Renewed", description: "Your plan has been renewed for $250/month", time: "2 days ago", read: true, link: "/user/settings" },
  { id: "n8", type: "member_added", title: "Team Member Added", description: "Rachel Kim joined San Diego Health Agents", time: "3 days ago", read: true },
];

const typeIcons: Record<NotificationType, React.ReactNode> = {
  lead_assigned: <Target size={16} style={{ color: "hsl(var(--info))" }} />,
  stage_changed: <TrendingUp size={16} style={{ color: "hsl(var(--success))" }} />,
  call_completed: <Phone size={16} style={{ color: "hsl(var(--primary))" }} />,
  appointment: <Calendar size={16} style={{ color: "hsl(var(--warning))" }} />,
  campaign: <Bot size={16} style={{ color: "hsl(var(--primary))" }} />,
  billing: <CreditCard size={16} style={{ color: "hsl(var(--secondary))" }} />,
  system: <AlertCircle size={16} style={{ color: "hsl(var(--warning))" }} />,
  member_added: <UserPlus size={16} style={{ color: "hsl(var(--success))" }} />,
};

const typeBgColors: Record<NotificationType, string> = {
  lead_assigned: "bg-[hsl(var(--info)_/_0.1)]",
  stage_changed: "bg-[hsl(var(--success)_/_0.1)]",
  call_completed: "bg-[hsl(var(--primary)_/_0.1)]",
  appointment: "bg-[hsl(var(--warning)_/_0.1)]",
  campaign: "bg-[hsl(var(--primary)_/_0.1)]",
  billing: "bg-[hsl(var(--secondary)_/_0.1)]",
  system: "bg-[hsl(var(--warning)_/_0.1)]",
  member_added: "bg-[hsl(var(--success)_/_0.1)]",
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (link: string) => void;
}

export function NotificationPanel({ open, onClose, onNavigate }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({ type: "success", title: "All notifications marked as read" });
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
      size="sm"
    >
      <div className="p-4">
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck size={14} className="mr-1" />Mark all read
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                markRead(notification.id);
                if (notification.link) onNavigate?.(notification.link);
              }}
              className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                notification.read
                  ? isDark ? "hover:bg-[hsl(var(--surface-container-high))]" : "hover:bg-[hsl(var(--surface-container-low))]"
                  : "bg-[hsl(var(--primary)_/_0.05)] hover:bg-[hsl(var(--primary)_/_0.1)]"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBgColors[notification.type]}`}>
                {typeIcons[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: notification.read ? "hsl(var(--on-surface-variant))" : "hsl(var(--on-surface))" }}
                  >
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "hsl(var(--primary))" }} />
                  )}
                </div>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>{notification.description}</p>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideOver>
  );
}

// Bell icon button with unread badge — place in Shell header
export function NotificationBell({ onClick }: { onClick: () => void }) {
  const [notifications] = useState(INITIAL_NOTIFICATIONS);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg transition-colors"
      style={{
        color: "hsl(var(--muted-foreground))",
        background: "transparent",
      }}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[hsl(var(--danger))] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
