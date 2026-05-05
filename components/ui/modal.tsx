"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm animate-in fade-in duration-200"
        style={{ backgroundColor: "hsl(222 47% 4% / 0.6)" }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={cn(
          "relative w-full mx-4 rounded-lg shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden",
          sizeClasses[size]
        )}
        style={{
          backgroundColor: "hsl(var(--surface-container))",
          border: "1px solid hsl(var(--border))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-0">
            {title && (
              <h2 className="text-lg font-display font-semibold" style={{ color: "hsl(var(--on-surface))" }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                {description}
              </p>
            )}
          </div>
        )}
        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
        {/* Footer */}
        {footer && (
          <div
            className="px-6 py-4 flex justify-end gap-3"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirmation Dialog variant
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: "hsl(var(--surface-container-high))",
              color: "hsl(var(--on-surface))",
            }}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-display font-medium text-white rounded-lg transition-colors disabled:opacity-50 bg-gradient-primary hover:brightness-110"
          >
            {loading ? "Loading..." : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: "hsl(var(--on-surface-variant))" }}>{message}</p>
    </Modal>
  );
}
