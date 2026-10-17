"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  Stethoscope,
  Wrench,
  CheckCircle2,
  PackageCheck,
  AlertOctagon,
  Ban,
  UserCheck,
} from "lucide-react";
import type { RepairTicket } from "@/types/tickets";
import type { TechnicianOption } from "@/types/requests";

export type TicketActionType =
  | "assign"
  | "diagnose"
  | "repair"
  | "ready-for-pickup"
  | "complete"
  | "unrepairable"
  | "cancel";

interface TicketActionModalProps {
  ticket: RepairTicket;
  action: TicketActionType;
  technicians: TechnicianOption[];
  onClose: () => void;
  onSubmit: (data: {
    technicianId?: string;
    diagnosis?: string;
    repairNotes?: string;
    reason?: string;
    notes?: string;
  }) => Promise<void>;
}

export function TicketActionModal({
  ticket,
  action,
  technicians,
  onClose,
  onSubmit,
}: TicketActionModalProps) {
  const [selectedTech, setSelectedTech] = useState<string>(
    ticket.technicianId || (technicians[0]?.id ?? "")
  );
  const [diagnosis, setDiagnosis] = useState("");
  const [repairNotes, setRepairNotes] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getActionConfig = () => {
    switch (action) {
      case "assign":
        return {
          title: "Assign Technician",
          description: `Assign ticket ${ticket.ticketNumber} to a technician.`,
          icon: UserCheck,
          btnText: "Confirm Assignment",
          btnColor: "bg-sky-600 hover:bg-sky-700 text-white",
        };
      case "diagnose":
        return {
          title: "Start Diagnosis",
          description: `Move ticket ${ticket.ticketNumber} into active diagnosis.`,
          icon: Stethoscope,
          btnText: "Begin Diagnosis",
          btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "repair":
        return {
          title: "Start Hardware Repair",
          description: `Record diagnosis results and move ${ticket.ticketNumber} to in-repair.`,
          icon: Wrench,
          btnText: "Start Repair",
          btnColor: "bg-amber-600 hover:bg-amber-700 text-white",
        };
      case "ready-for-pickup":
        return {
          title: "Mark Ready For Pickup",
          description: `Confirm repair completed for ${ticket.ticketNumber} and notify customer.`,
          icon: PackageCheck,
          btnText: "Ready For Pickup",
          btnColor: "bg-indigo-600 hover:bg-indigo-700 text-white",
        };
      case "complete":
        return {
          title: "Complete Ticket",
          description: `Handover device to customer and close ticket ${ticket.ticketNumber}.`,
          icon: CheckCircle2,
          btnText: "Complete & Close",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case "unrepairable":
        return {
          title: "Mark as Unrepairable",
          description: `Record why device ${ticket.ticketNumber} cannot be restored.`,
          icon: AlertOctagon,
          btnText: "Mark Unrepairable",
          btnColor: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "cancel":
        return {
          title: "Cancel Ticket",
          description: `Cancel repair ticket ${ticket.ticketNumber}.`,
          icon: Ban,
          btnText: "Cancel Ticket",
          btnColor: "bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-700",
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (action === "assign" && !selectedTech) {
      setErrorMessage("Please select a technician");
      return;
    }
    if (action === "repair" && (!diagnosis.trim() || diagnosis.trim().length < 5)) {
      setErrorMessage("Diagnosis findings are required (min 5 characters)");
      return;
    }
    if (
      action === "ready-for-pickup" &&
      (!repairNotes.trim() || repairNotes.trim().length < 5)
    ) {
      setErrorMessage("Repair notes are required (min 5 characters)");
      return;
    }
    if (
      action === "unrepairable" &&
      (!reason.trim() || reason.trim().length < 5)
    ) {
      setErrorMessage("Reason for unrepairability is required (min 5 characters)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        technicianId: action === "assign" ? selectedTech : undefined,
        diagnosis: action === "repair" ? diagnosis.trim() : undefined,
        repairNotes: action === "ready-for-pickup" ? repairNotes.trim() : undefined,
        reason: action === "unrepairable" ? reason.trim() : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute action";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {config.title}
              </h3>
              <p className="text-xs text-zinc-500">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Action-specific fields */}
          {action === "assign" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Select Technician
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.employeeId ? ` (${t.employeeId})` : ""}
                    {t.activeTicketsCount !== undefined
                      ? ` • ${t.activeTicketsCount} active`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === "repair" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Diagnosis Findings <span className="text-red-500">*</span>
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                placeholder="Describe fault found e.g. Corroded power IC or blown MOSFET..."
                className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {action === "ready-for-pickup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Repair Summary &amp; Replaced Parts <span className="text-red-500">*</span>
              </label>
              <textarea
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Replaced display panel & applied new thermal paste. 24h stress test passed."
                className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {action === "unrepairable" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Reason for Unrepairability <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. PCB multilayer trace separation beyond repair scope..."
                className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Optional internal notes for all actions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Audit Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal tracking notes for status log..."
              className="w-full h-10 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="mt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 h-10 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 h-10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${config.btnColor}`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {config.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

