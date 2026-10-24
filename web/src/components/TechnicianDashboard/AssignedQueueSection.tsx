"use client";

import { useState } from "react";
import axios from "axios";
import {
  ClipboardList,
  FileText,
  Play,
  CheckCheck,
  AlertCircle,
  Loader2,
  History,
  Wrench,
  CheckCircle2,
  SlidersHorizontal,
  Cpu,
  AlertOctagon,
} from "lucide-react";

import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";
import type { RepairTicket } from "@/types/tickets";
import type { UpdateTechnicianNotesPayload } from "@/types/technicianDashboard";
import type { TechnicianModalMode } from "./TechnicianTicketManageModal";
import { getStatusBadge } from "./_components/getStatusBadge";
import { getPriorityBadge } from "./_components/getPriorityBadge";
import getTurnaroundTarget from "./_components/getTurnaroundTarget";
import { formatDateTime } from "./_components/formatters";

interface AssignedQueueSectionProps {
  tickets: RepairTicket[];
  activeBenchTicketId?: string | null;
  onSelectTicket?: (ticket: RepairTicket) => void;
  onManageTicket?: (ticket: RepairTicket, mode?: TechnicianModalMode) => void;
  onSaveNotes?: (
    ticketId: string,
    payload: UpdateTechnicianNotesPayload
  ) => Promise<RepairTicket>;
}

export function AssignedQueueSection({
  tickets,
  activeBenchTicketId,
  onSelectTicket,
  onManageTicket,
  onSaveNotes,
}: AssignedQueueSectionProps) {
  const statusFilter = useTechnicianDashboardUIStore(
    (state) => state.statusFilter
  );
  const setStatusFilter = useTechnicianDashboardUIStore(
    (state) => state.setStatusFilter
  );
  const searchQuery = useTechnicianDashboardUIStore(
    (state) => state.searchQuery
  );

  const [activeNotesTicket, setActiveNotesTicket] = useState<string | null>(
    null
  );
  const [diagnosisDraft, setDiagnosisDraft] = useState("");
  const [repairNotesDraft, setRepairNotesDraft] = useState("");
  const [logNoteDraft, setLogNoteDraft] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const openNotesEditor = (ticket: RepairTicket) => {
    if (activeNotesTicket === ticket.id) {
      setActiveNotesTicket(null);
      setNotesError(null);
      return;
    }
    setActiveNotesTicket(ticket.id);
    setDiagnosisDraft(ticket.diagnosis || "");
    setRepairNotesDraft(ticket.repairNotes || "");
    setLogNoteDraft("");
    setNotesError(null);
  };

  const handleSaveNotes = async (ticketId: string) => {
    if (!onSaveNotes) {
      setActiveNotesTicket(null);
      return;
    }
    setIsSavingNotes(true);
    setNotesError(null);
    try {
      await onSaveNotes(ticketId, {
        diagnosis: diagnosisDraft,
        repairNotes: repairNotesDraft,
        notes: logNoteDraft.trim() || undefined,
      });
      setActiveNotesTicket(null);
      setLogNoteDraft("");
    } catch (err: unknown) {
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        "Failed to save notes.";
      setNotesError(typeof msg === "string" ? msg : "Failed to save notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Filter tabs counts
  const allCount = tickets.length;
  const diagnosingCount = tickets.filter(
    (t) => t.status === "DIAGNOSING" || t.status === "ACCEPTED"
  ).length;
  const inRepairCount = tickets.filter((t) => t.status === "IN_REPAIR").length;
  const readyPickupCount = tickets.filter(
    (t) => t.status === "READY_FOR_PICKUP"
  ).length;

  // Filter items
  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === "DIAGNOSING") {
      if (ticket.status !== "DIAGNOSING" && ticket.status !== "ACCEPTED")
        return false;
    } else if (statusFilter === "IN_REPAIR") {
      if (ticket.status !== "IN_REPAIR") return false;
    } else if (statusFilter === "READY_FOR_PICKUP") {
      if (ticket.status !== "READY_FOR_PICKUP") return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const tNum = ticket.ticketNumber?.toLowerCase() || "";
    const brand = ticket.request?.device?.brand?.toLowerCase() || "";
    const model = ticket.request?.device?.model?.toLowerCase() || "";
    const cust =
      ticket.request?.device?.customer?.user?.name?.toLowerCase() || "";
    const desc = ticket.request?.description?.toLowerCase() || "";
    const prob = ticket.request?.problem?.toLowerCase() || "";
    const serial = ticket.request?.device?.serialNumber?.toLowerCase() || "";

    return (
      tNum.includes(q) ||
      brand.includes(q) ||
      model.includes(q) ||
      cust.includes(q) ||
      desc.includes(q) ||
      prob.includes(q) ||
      serial.includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            My Assigned Queue
          </h2>
          <span className="bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
            {allCount} Active
          </span>
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("DIAGNOSING")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "DIAGNOSING"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            In Diagnosis ({diagnosingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("IN_REPAIR")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "IN_REPAIR"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            In Repair ({inRepairCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("READY_FOR_PICKUP")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "READY_FOR_PICKUP"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Ready for Pickup ({readyPickupCount})
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex flex-col gap-4">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-500">
            <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No tickets found in this view
            </span>
            <p className="text-xs text-zinc-400 mt-1">
              {tickets.length === 0
                ? "You currently have no repair tickets assigned to your bench."
                : "Try switching tabs or clearing your search filter."}
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => {
            const isLeftColor =
              ticket.status === "DIAGNOSING"
                ? "border-l-sky-600"
                : ticket.status === "IN_REPAIR"
                  ? "border-l-blue-600"
                  : ticket.status === "READY_FOR_PICKUP"
                    ? "border-l-emerald-600"
                    : "border-l-zinc-400";

            const device = ticket.request?.device;
            const deviceTitle =
              `${device?.brand || ""} ${device?.model || ""}`.trim() ||
              "Unknown Device";
            const customer = device?.customer?.user;
            const customerNotes = device?.customer?.notes;
            const faultText =
              ticket.diagnosis ||
              ticket.request?.description ||
              ticket.request?.problem ||
              "No problem description provided";

            const history = ticket.statusHistory || [];
            const latestNoteEntry = [...history]
              .reverse()
              .find((h) => h.notes && h.notes.trim().length > 0);
            const photosCount = ticket.request?.images?.length || 0;

            return (
              <div
                key={ticket.id || index}
                className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 border-l-4 ${isLeftColor} shadow-xs hover:shadow-sm transition-all relative overflow-hidden`}
              >
                <div className="flex flex-col gap-4">
                  {/* Row 1: Badges, Last Update, Ticket ID */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/70 px-2.5 py-0.5 rounded-md">
                        {ticket.ticketNumber || ticket.id}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        Last update:
                      </span>
                      {getTurnaroundTarget(ticket)}
                    </div>
                  </div>

                  {/* Row 2: Device Specs & Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 flex flex-col gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
                        {deviceTitle}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          Fault:
                        </strong>{" "}
                        {faultText}
                      </p>
                      {ticket.repairNotes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          <strong className="text-zinc-800 dark:text-zinc-200">
                            Repair Notes:
                          </strong>{" "}
                          {ticket.repairNotes}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                        <span>
                          Client:{" "}
                          <strong className="text-zinc-800 dark:text-zinc-200">
                            {customer?.name || "Customer"}
                          </strong>
                        </span>
                        {customer?.phone && (
                          <span>Contact: {customer.phone}</span>
                        )}
                        {customerNotes && <span>Info: {customerNotes}</span>}
                      </div>
                    </div>

                    {/* Right column: Real Device Metadata box */}
                    <div className="md:col-span-4 flex flex-col justify-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-750 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Device Type:
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {device?.deviceType || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Serial No.:
                        </span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {device?.serialNumber || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Intake Photos:
                        </span>
                        <span className="font-semibold text-sky-700 dark:text-sky-400">
                          {photosCount} {photosCount === 1 ? "photo" : "photos"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onManageTicket?.(ticket, "history")}
                      className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-sky-700 dark:hover:text-sky-400 transition-colors text-left"
                      title="View full status history"
                    >
                      <History className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="underline-offset-2 hover:underline">
                        {latestNoteEntry?.notes
                          ? latestNoteEntry.notes
                          : `Opened ${formatDateTime(ticket.createdAt)}`}
                      </span>
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onSelectTicket && activeBenchTicketId !== ticket.id && (
                        <button
                          type="button"
                          onClick={() => onSelectTicket(ticket)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700"
                          title="Pin this ticket to Active Bench Focus"
                        >
                          <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Focus Bench</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openNotesEditor(ticket)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-semibold transition-colors flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Quick Notes</span>
                      </button>

                      {onManageTicket && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTicket?.(ticket);
                            onManageTicket(ticket, "notes");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-semibold transition-colors flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700"
                          title="Open Ticket Management Modal"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Manage</span>
                        </button>
                      )}

                      {onManageTicket &&
                        (ticket.status === "ACCEPTED" ||
                          ticket.status === "DIAGNOSING" ||
                          ticket.status === "IN_REPAIR") && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTicket?.(ticket);
                              onManageTicket(ticket, "unrepairable");
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                            title="Mark as Unrepairable"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                        )}

                      {ticket.status === "DIAGNOSING" ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTicket?.(ticket);
                            onManageTicket?.(ticket, "transition");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Start Hardware Repair</span>
                        </button>
                      ) : ticket.status === "IN_REPAIR" ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTicket?.(ticket);
                            onManageTicket?.(ticket, "transition");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Ready for Pickup</span>
                        </button>
                      ) : ticket.status === "READY_FOR_PICKUP" ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTicket?.(ticket);
                            onManageTicket?.(ticket, "transition");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Handover</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTicket?.(ticket);
                            onManageTicket?.(ticket, "transition");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Begin Bench Diagnostic</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline quick notes editor if opened */}
                  {activeNotesTicket === ticket.id && (
                    <div className="mt-2 p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col gap-3">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Update Technician Notes for {ticket.ticketNumber}
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Diagnosis Findings
                          </label>
                          <textarea
                            value={diagnosisDraft}
                            onChange={(e) => setDiagnosisDraft(e.target.value)}
                            rows={2}
                            className="w-full p-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-600"
                            placeholder="Enter diagnosis findings..."
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Repair Notes
                          </label>
                          <textarea
                            value={repairNotesDraft}
                            onChange={(e) => setRepairNotesDraft(e.target.value)}
                            rows={2}
                            className="w-full p-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-600"
                            placeholder="Enter repair actions or parts used..."
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Activity Log Note (optional, appends to status history)
                        </label>
                        <input
                          type="text"
                          value={logNoteDraft}
                          onChange={(e) => setLogNoteDraft(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-600"
                          placeholder="Optional note for the bench activity stream..."
                        />
                      </div>

                      {notesError && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {notesError}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isSavingNotes}
                          onClick={() => {
                            setActiveNotesTicket(null);
                            setNotesError(null);
                          }}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSavingNotes}
                          onClick={() => handleSaveNotes(ticket.id)}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {isSavingNotes && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          <span>Save Notes</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
