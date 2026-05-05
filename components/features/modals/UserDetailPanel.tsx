"use client";

import { useState } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/modal";
import { Users, Target, Phone, TrendingUp, CheckCircle2, UserX, Eye } from "lucide-react";

interface UserDetailPanelProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    workspace: string;
    leads: number;
    status: string;
    lastActive: string;
  } | null;
}

export function UserDetailPanel({ open, onClose, user }: UserDetailPanelProps) {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [actionDone, setActionDone] = useState("");
  const [role, setRole] = useState(user?.role || "");

  const handleAction = async (action: string) => {
    await new Promise((r) => setTimeout(r, 800));
    setActionDone(action);
    setTimeout(() => { setActionDone(""); setConfirmDeactivate(false); }, 1500);
  };

  if (!user) return null;

  const roleColors: Record<string, string> = {
    "Super Admin": "bg-purple-100 text-purple-700",
    Admin: "bg-blue-100 text-blue-700",
    Agent: "bg-green-100 text-green-700",
    Viewer: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <SlideOver open={open} onClose={onClose} title={user.name} description={user.email} size="md">
        <div className="p-6 space-y-6">
          {/* Avatar + status */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-lg text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-700"}>{user.role}</Badge>
            <Badge variant={user.status === "active" ? "success" : user.status === "inactive" ? "default" : "danger"}>
              {user.status}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{user.leads}</p>
              <p className="text-xs text-gray-400 mt-0.5">Leads</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-sm font-semibold text-gray-700">-</p>
              <p className="text-xs text-gray-400 mt-0.5">Conversion</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mt-1">{user.lastActive}</p>
              <p className="text-xs text-gray-400">Last Active</p>
            </div>
          </div>

          {/* Role change */}
          <div>
            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Change Role</Label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2"
            >
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </Select>
          </div>

          {/* Workspace */}
          <div>
            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Workspace</Label>
            <p className="text-sm font-medium text-gray-700">{user.workspace}</p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Eye size={14} className="mr-2" />View in Workspace
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users size={14} className="mr-2" />View Assigned Leads
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setConfirmDeactivate(true)}>
              <UserX size={14} className="mr-2" />Deactivate User
            </Button>
          </div>

          {actionDone && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 size={16} className="text-green-600" />
              <p className="text-sm text-green-700">{actionDone}</p>
            </div>
          )}
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDeactivate}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={() => handleAction("User deactivated")}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${user.name}? They will lose access immediately.`}
        confirmLabel="Deactivate"
        variant="danger"
      />
    </>
  );
}