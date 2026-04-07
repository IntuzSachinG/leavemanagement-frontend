"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-10 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-[28px] border border-white/70 p-6 shadow-glass">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-950">{title}</h3>
            {description ? (
              <p className="text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-full p-0"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
