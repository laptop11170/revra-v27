"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import { Lead } from "@/lib/mock-data";
import { getInitials } from "@/lib/constants";
import { Phone, MessageSquare, Star, MoreHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LeadFormData } from "@/components/features/communications/AddLeadModal";

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStageChange?: (leadId: string, newStage: string) => void;
}

// Sortable lead card
function SortableLeadCard({ lead, onSelect }: { lead: Lead; onSelect: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const scoreColor = lead.score >= 80 ? "hsl(var(--success))" : lead.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--danger))";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-xl p-3 mb-2 cursor-pointer transition-all group",
        isDragging ? "shadow-xl ring-2 opacity-80 rotate-1 z-50" : "hover:shadow-md",
        "bg-[hsl(var(--surface-bright))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 font-display">
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold truncate" style={{ color: "hsl(var(--on-surface))" }}>{lead.name}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{lead.phonePrimary}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star size={10} style={{ color: scoreColor, fill: scoreColor }} />
          <span className="text-xs font-bold font-display" style={{ color: scoreColor }}>{lead.score}</span>
        </div>
      </div>

      <div className="mb-2">
        <Badge variant="info" className="text-[10px]">{lead.coverageType}</Badge>
      </div>

      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium font-display",
            lead.daysInStage > 5 ? "bg-[hsl(var(--danger)_/_0.15)] text-[hsl(var(--danger))]" : "bg-[hsl(var(--surface-container-high))] text-[hsl(var(--on-surface-variant))]"
          )}>
            {lead.daysInStage}d
          </span>
          {lead.exclusive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium font-display bg-[hsl(var(--warning)_/_0.15)] text-[hsl(var(--warning))]">Excl.</span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded transition-colors" style={{ color: "hsl(var(--muted-foreground))" }} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            <Phone size={12} />
          </button>
          <button className="p-1 rounded transition-colors" style={{ color: "hsl(var(--muted-foreground))" }} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            <MessageSquare size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Static lead card (for drag overlay)
function LeadCardStatic({ lead }: { lead: Lead }) {
  const scoreColor = lead.score >= 80 ? "hsl(var(--success))" : lead.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--danger))";
  return (
    <div className="rounded-xl p-3 mb-2 shadow-xl rotate-2 bg-[hsl(var(--surface-bright))] border border-[hsl(var(--primary))]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 font-display">
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold truncate" style={{ color: "hsl(var(--on-surface))" }}>{lead.name}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{lead.phonePrimary}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star size={10} style={{ color: scoreColor, fill: scoreColor }} />
          <span className="text-xs font-bold font-display" style={{ color: scoreColor }}>{lead.score}</span>
        </div>
      </div>
      <div className="mb-2">
        <Badge variant="info" className="text-[10px]">{lead.coverageType}</Badge>
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium font-display",
            lead.daysInStage > 5 ? "bg-[hsl(var(--danger)_/_0.15)] text-[hsl(var(--danger))]" : "bg-[hsl(var(--surface-container-high))] text-[hsl(var(--on-surface-variant))]"
          )}>
            {lead.daysInStage}d
          </span>
        </div>
      </div>
    </div>
  );
}

// Column
function StageColumn({ stage, leads, onSelectLead }: {
  stage: typeof PIPELINE_STAGES[0];
  leads: Lead[];
  onSelectLead: (l: Lead) => void;
}) {
  return (
    <div className="flex-shrink-0 w-60">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-lg"
        style={{
          backgroundColor: "hsl(var(--surface-container))",
          border: "1px solid hsl(var(--border))",
          borderBottom: "none",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-display font-semibold" style={{ color: "hsl(var(--on-surface))" }}>{stage.name}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full font-display bg-gradient-primary text-white"
        >
          {leads.length}
        </span>
      </div>

      {/* Droppable area */}
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div
          className="min-h-[200px] p-2 rounded-b-lg"
          style={{
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--surface-container-low))",
          }}
          data-stage={stage.name}
        >
          {leads.map((lead) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              onSelect={() => onSelectLead(lead)}
            />
          ))}
          {leads.length === 0 && (
            <div className="h-20 flex items-center justify-center text-xs font-display" style={{ color: "hsl(var(--muted-foreground))" }}>
              No leads — drag here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ leads, onSelectLead, onStageChange }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    if (!event.over) return;

    const leadId = event.active.id as string;
    const overData = event.over.data.current;

    // Determine destination stage — the over element's stage
    let destStage: string | null = null;

    // Check if dropped on a column
    const overElement = document.querySelector(`[data-stage]`);
    if (overElement) {
      destStage = overElement.getAttribute("data-stage");
    }

    if (destStage && onStageChange) {
      onStageChange(leadId, destStage);
    }
  };

  if (!mounted) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.slice(0, 5).map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-60">
            <div className="bg-gray-100 rounded-t-lg h-10 mb-2 animate-pulse" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 px-1" style={{ scrollbarWidth: "thin" }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.name);
          return (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={stageLeads}
              onSelectLead={onSelectLead}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? <LeadCardStatic lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  );
}