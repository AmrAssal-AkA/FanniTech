"use client";

import { useState } from "react";
import {
  Wrench,
  Stethoscope,
  PackageCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  RefreshCw,
  Search,
  AlertTriangle,
  Loader2,
  Laptop,
} from "lucide-react";
import { useRepairTickets } from "@/Hooks/useRepairTickets";
import type {
  RepairTicket,
  RepairTicketStatus,
} from "@/types/tickets";
import {
  TicketActionModal,
  type TicketActionType,
} from "@/components/RepairTickets/TicketActionModal";
import { TicketHistoryModal } from "@/components/RepairTickets/TicketHistoryModal";

export function TechnicianBenchClient() {
  const [selectedStatus, setSelectedStatus] = useState<RepairTicketStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeActionTicket, setActiveActionTicket] = useState<{
    ticket: RepairTicket;
    action: TicketActionType;
  } | null>(null);

  const [activeHistoryTicket, setActiveHistoryTicket] = useState<RepairTicket | null>(null);

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
    diagnose,
    repair,
    readyForPickup,
    complete,
    markUnrepair,
  } = useRepairTickets({
    assignedToMe: true,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
  });

  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.request?.device?.model?.toLowerCase().includes(q) ||
      t.request?.device?.brand?.toLowerCase().includes(q) ||
      t.request?.device?.customer?.user?.name?.toLowerCase().includes(q)
    );
  });

  const handleActionSubmit = async (data: {
    diagnosis?: string;
    repairNotes?: string;
    reason?: string;
    notes?: string;
  }) => {
    if (!activeActionTicket) return;
    const { ticket, action } = activeActionTicket;

    try {
      switch (action) {
        case "diagnose":
          await diagnose(ticket.id, data.notes);
          showToast(`Diagnosis started on ${ticket.ticketNumber}`);
          break;
        case "repair":
          if (data.diagnosis) {
            await repair(ticket.id, data.diagnosis, data.notes);
            showToast(`Repair started on ${ticket.ticketNumber}`);
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
        default:
          break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      showToast(msg, "error");
      throw err;
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Technician Workbench
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono font-semibold">
                Assigned Jobs
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your active queue of repair tickets assigned to your bench.
            </p>
          </div>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isValidating}
          className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isValidating ? "animate-spin text-amber-600" : ""}`}
          />
          Sync Bench
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my bench tickets..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as RepairTicketStatus | "ALL")
            }
            className="h-9 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ALL">All Bench Tickets</option>
            <option value="ACCEPTED">Accepted (Not Started)</option>
            <option value="DIAGNOSING">In Diagnosis</option>
            <option value="IN_REPAIR">In Hardware Repair</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Grid of bench ticket cards */}
      {isLoading && tickets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
          <span className="text-xs font-semibold">Loading bench tickets...</span>
        </div>
      ) : isError ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-red-500">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-xs font-semibold">Failed to fetch workbench tickets.</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl">
          <Laptop className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No Active Bench Tickets
          </span>
          <p className="text-xs text-zinc-500 max-w-sm text-center">
            You currently have no repair tickets assigned to your bench matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const device = ticket.request?.device;
            const customer = device?.customer?.user;

            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {device?.brand} {device?.model}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">Problem: </span>
                      {ticket.request?.problem}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Customer: {customer?.name} • S/N: {device?.serialNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveHistoryTicket(ticket)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    History
                  </button>

                  <div className="flex items-center gap-1.5">
                    {ticket.status === "ACCEPTED" && (
                      <button
                        onClick={() =>
                          setActiveActionTicket({ ticket, action: "diagnose" })
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
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
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Start Repair
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
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        Ready for Pickup
                      </button>
                    )}

                    {ticket.status === "READY_FOR_PICKUP" && (
                      <button
                        onClick={() =>
                          setActiveActionTicket({ ticket, action: "complete" })
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </button>
                    )}

                    {ticket.status !== "COMPLETED" &&
                      ticket.status !== "CANCELLED" &&
                      ticket.status !== "UNREPAIRABLE" && (
                        <button
                          onClick={() =>
                            setActiveActionTicket({
                              ticket,
                              action: "unrepairable",
                            })
                          }
                          title="Mark Unrepairable"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog Modal */}
      {activeActionTicket && (
        <TicketActionModal
          ticket={activeActionTicket.ticket}
          action={activeActionTicket.action}
          technicians={[]}
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

