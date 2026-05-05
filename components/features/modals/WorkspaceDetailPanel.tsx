"use client";

import { useState } from "react";
import { SlideOver } from "@/components/ui/slide-over";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/modal";
import {
  Globe, Users, TrendingUp, CreditCard, Calendar, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle, Pause, Trash2, CheckCircle2,
} from "lucide-react";
import type { Workspace } from "@/lib/mock-data";

interface WorkspaceDetailPanelProps {
  open: boolean;
  onClose: () => void;
  workspace: Workspace | null;
}

export function WorkspaceDetailPanel({ open, onClose, workspace }: WorkspaceDetailPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [actionDone, setActionDone] = useState("");

  const handleAction = async (action: string) => {
    await new Promise((r) => setTimeout(r, 800));
    setActionDone(action);
    setTimeout(() => { setActionDone(""); setConfirmDelete(false); setConfirmSuspend(false); }, 1500);
  };

  if (!workspace) return null;

  const statusColors = {
    active: "bg-green-100 text-green-700",
    trial: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700",
    past_due: "bg-orange-100 text-orange-700",
  };
  const planColors: Record<string, string> = {
    Enterprise: "bg-purple-100 text-purple-700",
    Scale: "bg-blue-100 text-blue-700",
    Growth: "bg-green-100 text-green-700",
    Starter: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <SlideOver open={open} onClose={onClose} title={workspace.name} description="Workspace details" size="md">
        <div className="p-6 space-y-6">
          {/* Status row */}
          <div className="flex items-center gap-3">
            <Badge className={statusColors[workspace.status as keyof typeof statusColors]}>
              {workspace.status.replace("_", " ")}
            </Badge>
            <Badge className={planColors[workspace.plan]}>{workspace.plan}</Badge>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users size={14} />
                <span className="text-xs">Users</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{workspace.users}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingUp size={14} />
                <span className="text-xs">MRR</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${workspace.mrr}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <CreditCard size={14} />
                <span className="text-xs">Leads</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{workspace.leads}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={14} />
                <span className="text-xs">Joined</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{workspace.joinedDate}</p>
            </div>
          </div>

          {/* Owner info */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Owner</h4>
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {workspace.owner.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-gray-900">{workspace.owner}</p>
                <p className="text-xs text-gray-400">{workspace.ownerEmail}</p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.open("https://billing.stripe.com/p/login/test", "_blank")}>
                <CreditCard size={14} className="mr-2" />Open Stripe Portal
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setConfirmSuspend(true)}>
                <Pause size={14} className="mr-2" />Suspend Workspace
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
                <ArrowUpCircle size={14} className="mr-2" />Upgrade Plan
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={14} className="mr-2" />Delete Workspace
              </Button>
            </div>
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
        open={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        onConfirm={() => handleAction("Workspace suspended")}
        title="Suspend Workspace"
        message={`Are you sure you want to suspend ${workspace.name}? Users will lose access until reactivated.`}
        confirmLabel="Suspend"
        variant="danger"
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => handleAction("Workspace deleted")}
        title="Delete Workspace"
        message={`This will permanently delete ${workspace.name} and all associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}