"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type LeadData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  org: string;
  role: string;
  score: number;
  stage: string;
  hot: "hot" | "warm" | null;
  source: string;
  assignedTo: string;
  lastActivity: string;
  createdAt: string;
  tags: string[];
};

type LeadProfileContextType = {
  openLead: (lead: LeadData) => void;
  closeLead: () => void;
  activeLead: LeadData | null;
};

const LeadProfileContext = createContext<LeadProfileContextType | null>(null);

export function LeadProfileProvider({ children }: { children: ReactNode }) {
  const [activeLead, setActiveLead] = useState<LeadData | null>(null);

  const openLead = useCallback((lead: LeadData) => {
    setActiveLead(lead);
  }, []);

  const closeLead = useCallback(() => {
    setActiveLead(null);
  }, []);

  return (
    <LeadProfileContext.Provider value={{ openLead, closeLead, activeLead }}>
      {children}
    </LeadProfileContext.Provider>
  );
}

export function useLeadProfile() {
  const ctx = useContext(LeadProfileContext);
  if (!ctx) throw new Error("useLeadProfile must be used within LeadProfileProvider");
  return ctx;
}