"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Ticket,
  Search,
  RefreshCw,
  Filter,
  UserCheck,
  Stethoscope,
  Wrench,
  PackageCheck,
  CheckCircle2,
  AlertOctagon,
  Ban,
  Clock,
  MoreVertical,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Laptop,
} from "lucide-react";
import { useRepairTickets } from "@/Hooks/useRepairTickets";
import { fetchTechnicians } from "@/services/requests.service";
import type {
  RepairTicket,
  RepairTicketStatus,
  RepairTicketPriority,
} from "@/types/tickets";
import type { TechnicianOption } from "@/types/requests";
import {
  TicketActionModal,
  type TicketActionType,
} from "./TicketActionModal";
import { TicketHistoryModal } from "./TicketHistoryModal";

const STATUS_TABS: { label: string; value: RepairTicketStatus | "ALL" }[] = [
  { label: "All Tickets", value: "ALL" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Diagnosing", value: "DIAGNOSING" },
  { label: "In Repair", value: "IN_REPAIR" },
  { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Unrepairable", value: "UNREPAIRABLE" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function TicketsClient() {
  const [selectedStatus, setSelectedStatus] = useState<RepairTicketStatus | "ALL">("ALL");
  const [selectedPriority, setSelectedPriority] = useState<RepairTicketPriority | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);

  // Action & History Modals state
  const [activeActionTicket, setActiveActionTicket] = useState<{
    ticket: RepairTicket;
    action: TicketActionType;
  } | null>(null);

  const [activeHistoryTicket, setActiveHistoryTicket] = useState<RepairTicket | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const {
    tickets,
    isLoading,
    isValidating,
    isError,
    mutate,
    assignTech,
    diagnose,
    repair,
    readyForPickup,
    complete,
    markUnrepair,
    cancel,
  } = useRepairTickets({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    priority: selectedPriority === "ALL" ? undefined : selectedPriority,
  });

  useEffect(() => {
    fetchTechnicians()
      .then(setTechnicians)
      .catch(() => {});
  }, []);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter(
      (t) =>
        t.ticketNumber?.toLowerCase().includes(q) ||
        t.request?.device?.model?.toLowerCase().includes(q) ||
        t.request?.device?.brand?.toLowerCase().includes(q) ||
        t.request?.device?.customer?.user?.name?.toLowerCase().includes(q) ||
        t.technician?.user?.name?.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const handleActionSubmit = async (data: {
    technicianId?: string;
    diagnosis?: string;
    repairNotes?: string;
    reason?: string;
    notes?: string;
  }) => {
    if (!activeActionTicket) return;
    const { ticket, action } = activeActionTicket;

    try {
      switch (action) {
        case "assign":
          if (data.technicianId) {
            await assignTech(ticket.id, data.technicianId);
            showToast(`Assigned technician to ${ticket.ticketNumber}`);
          }
          break;
        case "diagnose":
          await diagnose(ticket.id, data.notes);
          showToast(`Started diagnosis on ${ticket.ticketNumber}`);
          break;
        case "repair":
          if (data.diagnosis) {
            await repair(ticket.id, data.diagnosis, data.notes);
            showToast(`Moved ${ticket.ticketNumber} to In-Repair`);
          }
          break;
        case "ready-for-pickup":
          if (data.repairNotes) {
            await readyForPickup(ticket.id, data.repairNotes, data.notes);
            showToast(`Marked ${ticket.ticketNumber} ready for pickup`);
          }
          break;
        case "complete":
          await complete(ticket.id, data.notes);
          showToast(`Completed ticket ${ticket.ticketNumber}`);
          break;
        case "unrepairable":
          if (data.reason) {
            await markUnrepair(ticket.id, data.reason, data.notes);
            showToast(`Marked ${ticket.ticketNumber} as unrepairable`);
          }
          break;
        case "cancel":
          await cancel(ticket.id, data.notes);
          showToast(`Cancelled ticket ${ticket.ticketNumber}`);
          break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute action";
      showToast(msg, "error");
      throw err;
    }
  };

  const getStatusBadge = (status: RepairTicketStatus) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
      case "DIAGNOSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      case "IN_REPAIR":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-900";
      case "READY_FOR_PICKUP":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      case "UNREPAIRABLE":
        return "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900";
      case "CANCELLED":
        return "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700";
    }
  };

  const getPriorityBadge = (priority: RepairTicketPriority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      case "LOW":
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Repair Tickets Lifecycle Pipeline
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-mono font-semibold">
                Live Bench Sync
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage technical diagnosis, lab repairs, and pickup handovers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isValidating ? "animate-spin text-sky-600" : ""}`}
            />
            Sync Pipeline
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-3">
        {/* Status pipeline bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.value
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Priority Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, model, customer, tech..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-zinc-500 font-medium">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as RepairTicketPriority | "ALL")
              }
              className="h-9 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List / Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs flex flex-col">
        {isLoading && tickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
            <span className="text-xs font-semibold">Loading ticket lifecycle data...</span>
          </div>
        ) : isError ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-red-500">
            <AlertTriangle className="w-8 h-8" />
            <p className="text-xs font-semibold">Failed to fetch tickets from server.</p>
            <button
              onClick={() => mutate()}
              className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Laptop className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No Repair Tickets Found
            </span>
            <p className="text-xs text-zinc-500 max-w-sm text-center">
              No tickets matched the current status filter or search parameters. Accept incoming intake requests from the Requests view to populate tickets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Device &amp; Customer</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Status &amp; Priority</th>
                  <th className="py-3.5 px-4">Problem Summary</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {filteredTickets.map((ticket) => {
                  const customer = ticket.request?.device?.customer?.user;
                  const device = ticket.request?.device;
                  const tech = ticket.technician?.user;

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Ticket # */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Device & Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {device?.brand} {device?.model}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {customer?.name || "Client"} • {customer?.phone || "No phone"}
                          </span>
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-3.5 px-4">
                        {tech ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[10px]">
                              {tech.name[0]}
                            </div>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {tech.name}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setActiveActionTicket({ ticket, action: "assign" })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-mono text-[10px] font-bold hover:bg-amber-100 transition-colors"
                          >
                            <UserCheck className="w-3 h-3" />
                            Assign Tech
                          </button>
                        )}
                      </td>

                      {/* Status & Priority */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getStatusBadge(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getPriorityBadge(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </td>

                      {/* Problem Summary */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-zinc-600 dark:text-zinc-300">
                        {ticket.request?.problem || "Hardware service"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Next Stage Quick Buttons */}
                          {ticket.status === "ACCEPTED" && (
                            <button
                              onClick={() =>
                                setActiveActionTicket({ ticket, action: "diagnose" })
                              }
                              title="Start Diagnosis"
                              className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              Diagnose
                            </button>
                          )}

                          {ticket.status === "DIAGNOSING" && (
                            <button
                              onClick={() =>
                                setActiveActionTicket({ ticket, action: "repair" })
                              }
                              title="Start Repair"
                              className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              Repair
                            </button>
                          )}

                          {ticket.status === "IN_REPAIR" && (
                            <button
                              onClick={() =>
                                setActiveActionTicket({
                                  ticket,
                                  action: "ready-for-pickup",
                                })
                              }
                              title="Ready for Pickup"
                              className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              Ready
                            </button>
                          )}

                          {ticket.status === "READY_FOR_PICKUP" && (
                            <button
                              onClick={() =>
                                setActiveActionTicket({ ticket, action: "complete" })
                              }
                              title="Complete Ticket"
                              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Complete
                            </button>
                          )}

                          {/* Reassign action */}
                          <button
                            onClick={() =>
                              setActiveActionTicket({ ticket, action: "assign" })
                            }
                            title="Reassign Technician"
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Audit Timeline */}
                          <button
                            onClick={() => setActiveHistoryTicket(ticket)}
                            title="Audit Timeline"
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel if active */}
                          {ticket.status !== "COMPLETED" &&
                            ticket.status !== "CANCELLED" && (
                              <button
                                onClick={() =>
                                  setActiveActionTicket({ ticket, action: "cancel" })
                                }
                                title="Cancel Ticket"
                                className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Dialog Modal */}
      {activeActionTicket && (
        <TicketActionModal
          ticket={activeActionTicket.ticket}
          action={activeActionTicket.action}
          technicians={technicians}
          onClose={() => setActiveActionTicket(null)}
          onSubmit={handleActionSubmit}
        />
      )}

      {/* History Timeline Modal */}
      {activeHistoryTicket && (
        <TicketHistoryModal
          ticket={activeHistoryTicket}
          onClose={() => setActiveHistoryTicket(null)}
        />
      )}
    </div>
  );
}

