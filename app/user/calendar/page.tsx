"use client";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layouts/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getInitials } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-provider";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Phone,
  MapPin,
  Plus,
  ExternalLink,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import type { Appointment } from "@/lib/mock-data";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bgVar: string; colorVar: string }> = {
  Phone: { icon: <Phone size={14} />, bgVar: "primary", colorVar: "primary" },
  Video: { icon: <Video size={14} />, bgVar: "secondary", colorVar: "secondary" },
  "In-Person": { icon: <MapPin size={14} />, bgVar: "success", colorVar: "success" },
};

const STATUS_CONFIG: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "warning", label: "Pending" },
  completed: { variant: "default", label: "Completed" },
  no_show: { variant: "danger", label: "No Show" },
  cancelled: { variant: "danger", label: "Cancelled" },
};

// New appointment modal
function NewAppointmentModal({ open, onClose, onSave }: {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState({
    leadName: "",
    title: "",
    date: "",
    time: "",
    duration: "30",
    type: "Phone",
    meetingLink: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = () => {
    onSave?.({ ...form, duration: parseInt(form.duration) });
    onClose();
    setForm({ leadName: "", title: "", date: "", time: "", duration: "30", type: "Phone", meetingLink: "" });
  };

  const canSave = form.title.trim() && form.date && form.time && form.leadName.trim();

  return (
    <Modal open={open} onClose={onClose} size="md" title="New Appointment">
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Lead Name *</label>
          <Input value={form.leadName} onChange={(e) => update("leadName", e.target.value)} placeholder="Michael Torres" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Appointment Title *</label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Medicare Quote Review" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Date *</label>
            <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Time *</label>
            <Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Duration</label>
            <select value={form.duration} onChange={(e) => update("duration", e.target.value)}
              className="w-full h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Type</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)}
              className="w-full h-10 rounded-lg px-3 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--surface))", color: "hsl(var(--on-surface))" }}>
              <option>Phone</option>
              <option>Video</option>
              <option>In-Person</option>
            </select>
          </div>
        </div>
        {form.type === "Video" && (
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Meeting Link</label>
            <Input value={form.meetingLink} onChange={(e) => update("meetingLink", e.target.value)}
              placeholder="https://meet.google.com/..." />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 px-6 py-4" style={{ borderColor: "hsl(var(--border))", borderTop: "1px solid" }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!canSave}>Create Appointment</Button>
      </div>
    </Modal>
  );
}

// Appointment detail modal
function AppointmentDetailModal({ open, onClose, appointment }: {
  open: boolean;
  onClose: () => void;
  appointment: Appointment;
}) {
  const tc = TYPE_CONFIG[appointment.type] || TYPE_CONFIG.Phone;
  const sc = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

  return (
    <Modal open={open} onClose={onClose} size="md" title="Appointment Details">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{appointment.title}</h3>
          <Badge variant={sc.variant}>{sc.label}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Lead", appointment.leadName],
            ["Type", appointment.type],
            ["Date & Time", `${appointment.date} at ${appointment.time}`],
            ["Duration", `${appointment.duration} min`],
          ].map(([label, value]) => (
            <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
              <p className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
              <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{value}</p>
            </div>
          ))}
        </div>
        {appointment.meetingLink && (
          <div className="p-3 rounded-lg border" style={{ backgroundColor: "hsl(var(--primary)_/_0.06)", borderColor: "hsl(var(--primary)_/_0.2)" }}>
            <p className="text-xs mb-1" style={{ color: "hsl(var(--primary))" }}>Meeting Link</p>
            <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 hover:underline" style={{ color: "hsl(var(--primary))" }}>
              {appointment.meetingLink} <ExternalLink size={12} />
            </a>
          </div>
        )}
        <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
          <p className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Agent</p>
          <p className="text-sm font-medium" style={{ color: "hsl(var(--on-surface))" }}>{appointment.agentName}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end px-6 py-4" style={{ borderColor: "hsl(var(--border))", borderTop: "1px solid" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="outline">Reschedule</Button>
        <Button>{appointment.type === "Video" ? "Join" : "Start"} {appointment.type === "Video" ? <Video size={14} className="ml-2" /> : <Phone size={14} className="ml-2" />}</Button>
      </div>
    </Modal>
  );
}

export default function CalendarPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(new Date());
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [showApptDetail, setShowApptDetail] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { addToast } = useToast();

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      addToast({ type: "error", title: "Error", description: "Failed to load appointments" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchAppointments();
    setSyncing(false);
    addToast({ type: "success", title: "Calendar Synced", description: "Appointments refreshed" });
  };

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const getAppointmentsForDay = (day: number) => {
    const dayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter((apt) => apt.date === dayStr);
  };

  const prevMonth = () => setToday(new Date(year, month - 1, 1));
  const nextMonth = () => setToday(new Date(year, month + 1, 1));

  const handleNewAppointment = async (data: any) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: "",
          title: data.title,
          date: data.date,
          time: data.time,
          duration: data.duration,
          type: data.type,
          meetingLink: data.meetingLink || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      const newApt = await res.json();
      setAppointments((prev) => [...prev, newApt]);
      addToast({ type: "success", title: "Appointment Created", description: `${data.title} has been scheduled.` });
    } catch (err) {
      addToast({ type: "error", title: "Error", description: "Failed to create appointment" });
    }
  };

  const openDetail = (apt: Appointment) => {
    setSelectedAppt(apt);
    setShowApptDetail(true);
  };

  const upcomingApts = appointments.filter((a) => a.status !== "cancelled");

  return (
    <Shell role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--on-surface))" }}>Calendar</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              {upcomingApts.length} upcoming appointments
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSync} disabled={syncing}>
              <RefreshCw size={16} className={`mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Google Calendar"}
            </Button>
            <Button onClick={() => setShowNewAppt(true)}>
              <Plus size={16} className="mr-2" />New Appointment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="lg:col-span-3 flex items-center justify-center py-20">
              <RefreshCw size={32} className="animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
            </div>
          ) : (
            <>
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{MONTHS[month]} {year}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft size={16} /></Button>
                  <Button variant="outline" size="sm" onClick={() => setToday(new Date())}>Today</Button>
                  <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight size={16} /></Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map((d) => (
                  <div key={d} className="text-center text-xs font-medium py-2" style={{ color: "hsl(var(--muted-foreground))" }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, i) => {
                  const isToday = day === today.getDate();
                  const isPast = day !== null && day < today.getDate();
                  const aptsForDay = day ? getAppointmentsForDay(day) : [];
                  return (
                    <div
                      key={i}
                      className="p-2 rounded-xl min-h-[72px] border transition-colors"
                      style={{
                        borderColor: isToday ? "hsl(var(--primary))" : "hsl(var(--border)_/_0.5)",
                        backgroundColor: isToday ? "hsl(var(--primary)_/_0.06)" : isPast ? "hsl(var(--surface-container-low))" : "transparent",
                        opacity: isPast && !isToday ? 0.5 : 1,
                      }}
                    >
                      {day && (
                        <>
                          <span className="text-sm" style={isToday ? { fontWeight: "bold", color: "hsl(var(--primary))" } : { color: "hsl(var(--muted-foreground))" }}>
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {aptsForDay.slice(0, 2).map((apt, j) => {
                              const tc = TYPE_CONFIG[apt.type] || TYPE_CONFIG.Phone;
                              return (
                                <button
                                  key={apt.id}
                                  onClick={() => openDetail(apt)}
                                  className="w-full text-left text-[10px] rounded px-1 py-0.5 truncate transition-opacity hover:opacity-80"
                                  style={{ backgroundColor: `hsl(var(--${tc.bgVar})_/_0.12)`, color: `hsl(var(--${tc.colorVar}))` }}
                                >
                                  {apt.time} {apt.title}
                                </button>
                              );
                            })}
                            {aptsForDay.length > 2 && (
                              <span className="text-[10px] pl-1" style={{ color: "hsl(var(--muted-foreground))" }}>+{aptsForDay.length - 2} more</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" style={{ color: "hsl(var(--on-surface))" }}>Upcoming Appointments</h3>
              <div className="space-y-4">
                {upcomingApts.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "hsl(var(--muted-foreground))" }}>No upcoming appointments</p>
                ) : (
                  upcomingApts.map((apt) => {
                    const tc = TYPE_CONFIG[apt.type] || TYPE_CONFIG.Phone;
                    const sc = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={apt.id} className="p-4 rounded-xl" style={{ backgroundColor: "hsl(var(--surface-container-low))" }}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm" style={{ color: "hsl(var(--on-surface))" }}>{apt.title}</p>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                        <div className="space-y-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>{apt.date} · {apt.time} ({apt.duration} min)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: `hsl(var(--${tc.bgVar})_/_0.12)`, color: `hsl(var(--${tc.colorVar}))` }}>{tc.icon}</span>
                            <span>{apt.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: "linear-gradient(135deg, hsl(var(--info)), hsl(var(--primary)))" }}>
                              {apt.leadName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span>{apt.leadName}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openDetail(apt)}
                          >
                            {apt.type === "Video" ? <Video size={14} className="mr-1" /> : <Phone size={14} className="mr-1" />}
                            {apt.type === "Video" ? "Join" : "Call"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(apt)}>Details</Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>

      <NewAppointmentModal
        open={showNewAppt}
        onClose={() => setShowNewAppt(false)}
        onSave={handleNewAppointment}
      />

      {selectedAppt && (
        <AppointmentDetailModal
          open={showApptDetail}
          onClose={() => { setShowApptDetail(false); setSelectedAppt(null); }}
          appointment={selectedAppt}
        />
      )}
    </Shell>
  );
}