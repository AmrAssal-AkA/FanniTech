"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Loader2,
  Stethoscope,
  Wrench,
  PackageCheck,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Clock,
  Check,
  ArrowRight,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { useTicketDetails } from "@/Hooks/useTicketDetails";
import type { RepairTicket, RepairTicketStatus } from "@/types/tickets";
import type { UpdateTechnicianNotesPayload } from "@/types/technicianDashboard";
import { getPriorityBadge } from "./_components/getPriorityBadge";
import { getStatusBadge } from "./_components/getStatusBadge";
import { formatDateTime } from "./_components/formatters";

export type TechnicianModalMode =
  | "transition"
  | "notes"
  | "unrepairable"
  | "history";

interface TechnicianTicketManageModalProps {
  ticket: RepairTicket;
  initialMode?: TechnicianModalMode;
  onClose: () => void;
  onStartDiagnosis: (
    ticketId: string,
    notes?: string
  ) => Promise<RepairTicket>;
  onStartRepair: (
    ticketId: string,
    diagnosis: string,
    notes?: string
  ) => Promise<RepairTicket>;
  onMarkReadyForPickup: (
    ticketId: string,
    repairNotes: string,
    notes?: string
  ) => Promise<RepairTicket>;
  onCompleteTicket: (
    ticketId: string,
    notes?: string
  ) => Promise<RepairTicket>;
  onMarkUnrepairable: (
    ticketId: string,
    reason: string,
    notes?: string
  ) => Promise<RepairTicket>;
  onSaveNotes: (
    ticketId: string,
    payload: UpdateTechnicianNotesPayload
  ) => Promise<RepairTicket>;
  onSuccess?: (message: string) => void;
}

const LIFECYCLE_STAGES: { status: RepairTicketStatus; label: string }[] = [
  { status: "ACCEPTED", label: "Accepted" },
  { status: "DIAGNOSING", label: "Diagnosing" },
  { status: "IN_REPAIR", label: "In Repair" },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { status: "COMPLETED", label: "Completed" },
];

export function TechnicianTicketManageModal({
  ticket,
  initialMode = "transition",
  onClose,
  onStartDiagnosis,
  onStartRepair,
  onMarkReadyForPickup,
  onCompleteTicket,
  onMarkUnrepairable,
  onSaveNotes,
  onSuccess,
}: TechnicianTicketManageModalProps) {
  const canMarkUnrepairable =
    ticket.status === "ACCEPTED" ||
    ticket.status === "DIAGNOSING" ||
    ticket.status === "IN_REPAIR";

  const canTransition =
    ticket.status === "ACCEPTED" ||
    ticket.status === "DIAGNOSING" ||
    ticket.status === "IN_REPAIR" ||
    ticket.status === "READY_FOR_PICKUP";

  const [activeMode, setActiveMode] = useState<TechnicianModalMode>(() => {
    if (initialMode === "unrepairable" && !canMarkUnrepairable) {
      return "notes";
    }
    if (initialMode === "transition" && !canTransition) {
      return "history";
    }
    return initialMode;
  });

  // Form states
  const [diagnosis, setDiagnosis] = useState(ticket.diagnosis || "");
  const [repairNotes, setRepairNotes] = useState(ticket.repairNotes || "");
  const [unrepairableReason, setUnrepairableReason] = useState("");
  const [auditNotes, setAuditNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { history, isHistoryLoading, mutateHistory } = useTicketDetails(
    activeMode === "history" ? ticket.id : null
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSubmitting]);

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (axios.isAxiosError(err)) {
      const apiMsg = err.response?.data?.message;
      if (Array.isArray(apiMsg)) return apiMsg.join(", ");
      if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const getTransitionMeta = () => {
    switch (ticket.status) {
      case "ACCEPTED":
        return {
          nextStatusLabel: "Bench Diagnosis",
          title: "Start Bench Diagnosis",
          description:
            "Claim and move this unit onto your diagnostic bench to inspect hardware faults.",
          icon: Stethoscope,
          buttonLabel: "Begin Diagnosis",
          buttonClass: "bg-sky-700 hover:bg-sky-800 text-white",
        };
      case "DIAGNOSING":
        return {
          nextStatusLabel: "Active Repair",
          title: "Record Findings & Start Repair",
          description:
            "Save your diagnostic findings and transition this ticket into active hardware repair.",
          icon: Wrench,
          buttonLabel: "Start Hardware Repair",
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "IN_REPAIR":
        return {
          nextStatusLabel: "Ready for Pickup",
          title: "Mark Ready for Pickup",
          description:
            "Document completed repair actions and replaced parts to notify the customer for pickup.",
          icon: PackageCheck,
          buttonLabel: "Mark Ready for Pickup",
          buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
        };
      case "READY_FOR_PICKUP":
        return {
          nextStatusLabel: "Completed",
          title: "Complete & Close Ticket",
          description:
            "Confirm final device handover and close this repair ticket.",
          icon: CheckCircle2,
          buttonLabel: "Complete & Close Ticket",
          buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      default:
        return null;
    }
  };

  const transitionMeta = getTransitionMeta();
  const currentStageIdx = LIFECYCLE_STAGES.findIndex(
    (s) => s.status === ticket.status
  );

  const device = ticket.request?.device;
  const deviceTitle =
    `${device?.brand || ""} ${device?.model || ""}`.trim() || "Unknown Device";
  const customerUser = device?.customer?.user;

  const handleTransitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (ticket.status === "DIAGNOSING") {
      if (!diagnosis.trim() || diagnosis.trim().length < 5) {
        setErrorMessage(
          "Diagnosis findings are required (minimum 5 characters)."
        );
        return;
      }
    }

    if (ticket.status === "IN_REPAIR") {
      if (!repairNotes.trim() || repairNotes.trim().length < 5) {
        setErrorMessage(
          "Repair summary and replaced parts are required (minimum 5 characters)."
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const cleanNotes = auditNotes.trim() || undefined;
      if (ticket.status === "ACCEPTED") {
        await onStartDiagnosis(ticket.id, cleanNotes);
        onSuccess?.(`Started diagnosis on ${ticket.ticketNumber}`);
      } else if (ticket.status === "DIAGNOSING") {
        await onStartRepair(ticket.id, diagnosis.trim(), cleanNotes);
        onSuccess?.(`Moved ${ticket.ticketNumber} to Active Repair`);
      } else if (ticket.status === "IN_REPAIR") {
        await onMarkReadyForPickup(ticket.id, repairNotes.trim(), cleanNotes);
        onSuccess?.(`Marked ${ticket.ticketNumber} Ready for Pickup`);
      } else if (ticket.status === "READY_FOR_PICKUP") {
        await onCompleteTicket(ticket.id, cleanNotes);
        onSuccess?.(`Completed ticket ${ticket.ticketNumber}`);
      }
      await mutateHistory();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to update ticket stage.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSaveNotes(ticket.id, {
        diagnosis: diagnosis.trim(),
        repairNotes: repairNotes.trim(),
        notes: auditNotes.trim() || undefined,
      });
      await mutateHistory();
      onSuccess?.(`Saved technician notes for ${ticket.ticketNumber}`);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to save technician notes.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnrepairableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!unrepairableReason.trim() || unrepairableReason.trim().length < 5) {
      setErrorMessage(
        "Please provide a technical reason for unrepairability (minimum 5 characters)."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onMarkUnrepairable(
        ticket.id,
        unrepairableReason.trim(),
        auditNotes.trim() || undefined
      );
      await mutateHistory();
      onSuccess?.(`Marked ${ticket.ticketNumber} as Unrepairable`);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        extractErrorMessage(err, "Failed to mark ticket as unrepairable.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHistoryBadgeClass = (status: RepairTicketStatus) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
      case "DIAGNOSING":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300";
      case "IN_REPAIR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300";
      case "READY_FOR_PICKUP":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300";
      case "UNREPAIRABLE":
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tech-ticket-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-sky-600 via-sky-500 to-blue-600" />

        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded">
                  {ticket.ticketNumber}
                </span>
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket)}
              </div>
              <h2
                id="tech-ticket-modal-title"
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1"
              >
                {deviceTitle}
                {device?.deviceType ? ` (${device.deviceType})` : ""}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Client: {customerUser?.name || "Customer"}
                {device?.serialNumber ? ` · S/N: ${device.serialNumber}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lifecycle Progress Bar */}
        <div className="px-5 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-5 gap-1.5">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isDone =
                currentStageIdx > idx || ticket.status === "COMPLETED";
              const isCurrent = currentStageIdx === idx;
              return (
                <div key={stage.status} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isDone
                          ? "bg-sky-700 text-white"
                          : isCurrent
                            ? "bg-sky-600 text-white ring-2 ring-sky-200 dark:ring-sky-900"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                      }`}
                    >
                      {isDone ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold truncate ${
                        isCurrent
                          ? "text-sky-700 dark:text-sky-400"
                          : isDone
                            ? "text-zinc-800 dark:text-zinc-200"
                            : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  <div
                    className={`h-1 rounded-full ${
                      isDone
                        ? "bg-sky-600"
                        : isCurrent
                          ? "bg-sky-400"
                          : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto bg-white dark:bg-zinc-900">
          {canTransition && (
            <button
              type="button"
              onClick={() => {
                setActiveMode("transition");
                setErrorMessage(null);
              }}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeMode === "transition"
                  ? "border-sky-600 text-sky-700 dark:text-sky-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Stage Transition</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveMode("notes");
              setErrorMessage(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeMode === "notes"
                ? "border-sky-600 text-sky-700 dark:text-sky-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Adjust Bench Notes</span>
          </button>

          {canMarkUnrepairable && (
            <button
              type="button"
              onClick={() => {
                setActiveMode("unrepairable");
                setErrorMessage(null);
              }}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeMode === "unrepairable"
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Mark Unrepairable</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveMode("history");
              setErrorMessage(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeMode === "history"
                ? "border-sky-600 text-sky-700 dark:text-sky-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Reported Intake Fault Summary */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Reported Intake Problem
            </span>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {ticket.request?.problem || "No problem summary provided"}
            </p>
            {ticket.request?.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {ticket.request.description}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Stage Transition */}
          {activeMode === "transition" && transitionMeta && (
            <form
              onSubmit={handleTransitionSubmit}
              className="flex flex-col gap-4"
            >
              <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/70 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                  <transitionMeta.icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {transitionMeta.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                      Next: {transitionMeta.nextStatusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {transitionMeta.description}
                  </p>
                </div>
              </div>

              {ticket.status === "DIAGNOSING" && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="transition-diagnosis-input"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Diagnosis Findings <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="transition-diagnosis-input"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={3}
                    placeholder="Describe root hardware cause found during bench inspection (min 5 characters)..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              {ticket.status === "IN_REPAIR" && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="transition-repair-notes-input"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Repair Summary &amp; Replaced Parts{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="transition-repair-notes-input"
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    rows={3}
                    placeholder="Document repair procedure, replaced components, and QA verification results (min 5 characters)..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="transition-audit-note-input"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Transition Audit Note (Optional)
                </label>
                <input
                  id="transition-audit-note-input"
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Optional log note for the bench activity stream..."
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100 dark:border-zinc-800">
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
                  className={`px-5 h-10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs ${transitionMeta.buttonClass}`}
                >
                  {isSubmitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{transitionMeta.buttonLabel}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Adjust Bench Notes */}
          {activeMode === "notes" && (
            <form
              onSubmit={handleSaveNotesSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="notes-diagnosis-input"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Diagnosis Findings
                  </label>
                  <textarea
                    id="notes-diagnosis-input"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={4}
                    placeholder="Record or update diagnostic findings..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="notes-repair-input"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Repair Notes &amp; Parts
                  </label>
                  <textarea
                    id="notes-repair-input"
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    rows={4}
                    placeholder="Record or update repair actions and parts used..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="notes-audit-input"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Activity Log Entry (Optional)
                </label>
                <input
                  id="notes-audit-input"
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Optional note to append to the ticket status history..."
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100 dark:border-zinc-800">
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
                  className="px-5 h-10 rounded-xl text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-2 transition-colors shadow-xs"
                >
                  {isSubmitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Save Bench Notes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Mark Unrepairable */}
          {activeMode === "unrepairable" && canMarkUnrepairable && (
            <form
              onSubmit={handleUnrepairableSubmit}
              className="flex flex-col gap-4"
            >
              <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-red-900 dark:text-red-200">
                    Declare Device Unrepairable
                  </span>
                  <p className="text-xs text-red-700 dark:text-red-300/90 mt-0.5">
                    This action closes the repair workflow and notifies the
                    customer with the reason why the unit cannot be restored.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="unrepairable-reason-input"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Technical Reason for Unrepairability{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="unrepairable-reason-input"
                  value={unrepairableReason}
                  onChange={(e) => setUnrepairableReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Severe multi-layer PCB trace delamination and discontinued ASIC component (min 5 characters)..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="unrepairable-audit-input"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Internal Audit Note (Optional)
                </label>
                <input
                  id="unrepairable-audit-input"
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Optional internal note for status history..."
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100 dark:border-zinc-800">
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
                  className="px-5 h-10 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 transition-colors shadow-xs"
                >
                  {isSubmitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Confirm Unrepairable</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Audit History */}
          {activeMode === "history" && (
            <div className="flex flex-col gap-4">
              {isHistoryLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                  <span className="text-xs">Loading ticket audit timeline...</span>
                </div>
              ) : history.length === 0 &&
                (!ticket.statusHistory || ticket.statusHistory.length === 0) ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <Clock className="w-6 h-6 text-zinc-300" />
                  <span className="text-xs">
                    No status transitions recorded yet.
                  </span>
                </div>
              ) : (
                <div className="relative pl-6 flex flex-col gap-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                  {(history.length > 0
                    ? history
                    : ticket.statusHistory || []
                  ).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="relative flex flex-col gap-1"
                    >
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white dark:bg-zinc-900 border-2 border-sky-600" />
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded font-mono text-[10px] font-bold ${getHistoryBadgeClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {formatDateTime(item.changedAt)}
                        </span>
                      </div>
                      {item.notes ? (
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 mt-1">
                          {item.notes}
                        </p>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">
                          Stage transition recorded
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-9 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

