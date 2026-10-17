"use client";

import { useState } from "react";
import {
  ClipboardList,
  ChevronRight,
  CheckCircle2,
  Share2,
  FileText,
  Play,
  CheckCheck,
  AlertCircle,
} from "lucide-react";

import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";
{/** A component to display the assigned queue of repair tickets for a technician */}
import type { RepairTicket } from "@/types/tickets";
import { getStatusBadge } from "./_components/getStatusBadge";
import { getPriorityBadge } from "./_components/getPriorityBadge";
import getTurnaroundTarget from "./_components/getTurnaroundTarget";

interface AssignedQueueSectionProps {
  tickets: RepairTicket[];
  onSelectTicket?: (ticket: RepairTicket) => void;
  onOpenNotes?: (ticket: RepairTicket) => void;
}

export function AssignedQueueSection({
  tickets,
  onSelectTicket,
  onOpenNotes,
}: AssignedQueueSectionProps) {
  const statusFilter = useTechnicianDashboardUIStore(
    (state) => state.statusFilter,
  );
  const setStatusFilter = useTechnicianDashboardUIStore(
    (state) => state.setStatusFilter,
  );
  const searchQuery = useTechnicianDashboardUIStore(
    (state) => state.searchQuery,
  );

  const [activeNotesTicket, setActiveNotesTicket] = useState<string | null>(
    null,
  );

  // Filter tabs counts
  const allCount = tickets.length;
  const diagnosingCount = tickets.filter(
    (t) => t.status === "DIAGNOSING" || t.status === "ACCEPTED",
  ).length;
  const inRepairCount = tickets.filter((t) => t.status === "IN_REPAIR").length;
  const readyQACount = tickets.filter(
    (t) => t.status === "READY_FOR_PICKUP" || t.status === "COMPLETED",
  ).length;

  // Filter items
  const filteredTickets = tickets.filter((ticket) => {
    // Tab filter
    if (statusFilter === "DIAGNOSING") {
      if (ticket.status !== "DIAGNOSING" && ticket.status !== "ACCEPTED")
        return false;
    } else if (statusFilter === "IN_REPAIR") {
      if (ticket.status !== "IN_REPAIR") return false;
    } else if (statusFilter === "READY_FOR_PICKUP") {
      if (ticket.status !== "READY_FOR_PICKUP" && ticket.status !== "COMPLETED")
        return false;
    }

    // Search query filter
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
            Ready for QC ({readyQACount})
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
              Try switching tabs or clearing your universal search bar.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => {
            const isLeftColor =
              ticket.status === "DIAGNOSING"
                ? "border-l-sky-600"
                : ticket.status === "IN_REPAIR"
                  ? "border-l-blue-600"
                  : "border-l-zinc-400";

            const deviceTitle = `${ticket.request?.device?.brand || ""} ${
              ticket.request?.device?.model || ""
            }`.trim();
            const customer = ticket.request?.device?.customer?.user;
            const customerNotes = ticket.request?.device?.customer?.notes;
            const faultText =
              ticket.diagnosis ||
              ticket.request?.description ||
              ticket.request?.problem;

            return (
              <div
                key={ticket.id || index}
                className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 border-l-4 ${isLeftColor} shadow-xs hover:shadow-sm transition-all relative overflow-hidden`}
              >
                <div className="flex flex-col gap-4">
                  {/* Row 1: Badges, SLA, Ticket ID */}
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
                        Turnaround Target:
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
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                        <span>
                          Client:{" "}
                          <strong className="text-zinc-800 dark:text-zinc-200">
                            {customer?.name || "Client"}
                          </strong>
                        </span>
                        {customer?.phone && (
                          <span>Contact: {customer.phone}</span>
                        )}
                        {customerNotes && <span>Info: {customerNotes}</span>}
                      </div>
                    </div>

                    {/* Right column: Specs box */}
                    <div className="md:col-span-4 flex flex-col justify-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-750 text-xs">
                      {ticket.ticketNumber === "TCK-2042" ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Motherboard:
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              NM-D351 Rev 1.0
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Est. Work:
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              1.5 hrs labor
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Part Status:
                            </span>
                            <span className="font-semibold text-sky-700 dark:text-sky-400">
                              In Bay Storage (x4)
                            </span>
                          </div>
                        </>
                      ) : ticket.ticketNumber === "TCK-2038" ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Compound:
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              Honeywell PTM7950
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Parts Issued:
                            </span>
                            <span className="font-semibold text-sky-700 dark:text-sky-400">
                              Delta Dual Fan Assm.
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Assembly:
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              Vapor Chamber Torqued
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Board Model:
                            </span>
                            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              820-02098-A
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Corrosion Risk:
                            </span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              Moderate (24h exposure)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 dark:text-zinc-400">
                              Ultrasonic Bath:
                            </span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              Scheduled Tank #02
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      {ticket.status === "DIAGNOSING" ? (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          <span>
                            Thermal camera calibrated · Schematics cached
                          </span>
                        </>
                      ) : ticket.status === "IN_REPAIR" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            Phase 1 Done: New thermal paste &amp; pads installed
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            Requires battery isolation prior to board teardown
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveNotesTicket(
                            activeNotesTicket === ticket.id ? null : ticket.id,
                          );
                          onOpenNotes?.(ticket);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-semibold transition-colors flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Quick Notes</span>
                      </button>

                      {ticket.status === "DIAGNOSING" ? (
                        <button
                          type="button"
                          onClick={() => onSelectTicket?.(ticket)}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <span>Resume Diagnosis</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : ticket.status === "IN_REPAIR" ? (
                        <button
                          type="button"
                          onClick={() => onSelectTicket?.(ticket)}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 font-semibold transition-colors flex items-center gap-1.5 border border-sky-300 dark:border-sky-800"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Log Completion to QA</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectTicket?.(ticket)}
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
                    <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Technician Work Notes for {ticket.ticketNumber}:
                      </span>
                      <textarea
                        defaultValue={ticket.repairNotes || ""}
                        rows={2}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-600"
                        placeholder="Log component measurements, findings, or bay shelf details..."
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveNotesTicket(null)}
                          className="px-3 py-1 rounded-md text-xs font-semibold bg-sky-700 text-white hover:bg-sky-800"
                        >
                          Save Notes
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
