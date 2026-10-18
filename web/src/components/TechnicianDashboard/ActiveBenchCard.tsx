"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Timer,
  ExternalLink,
  Check,
  FileText,
  ImageIcon,
  Wrench,
  Stethoscope,
  PackageCheck,
  CheckCircle2,
  SlidersHorizontal,
  AlertOctagon,
  Clock,
} from "lucide-react";
import type { RepairTicket, RepairTicketStatus } from "@/types/tickets";
import type { TechnicianModalMode } from "./TechnicianTicketManageModal";
import { getPriorityBadge } from "./_components/getPriorityBadge";
import { getStatusBadge } from "./_components/getStatusBadge";
import {
  formatDateTime,
  formatDuration,
  getInitials,
} from "./_components/formatters";

interface ActiveBenchCardProps {
  ticket: RepairTicket;
  onOpenWorkspace?: () => void;
  onManageTicket?: (ticket: RepairTicket, mode?: TechnicianModalMode) => void;
}

const LIFECYCLE_STAGES: { status: RepairTicketStatus; title: string }[] = [
  { status: "ACCEPTED", title: "Accepted & Assigned" },
  { status: "DIAGNOSING", title: "Bench Diagnosis" },
  { status: "IN_REPAIR", title: "Active Repair" },
  { status: "READY_FOR_PICKUP", title: "Ready for Pickup" },
];

export function ActiveBenchCard({
  ticket,
  onOpenWorkspace,
  onManageTicket,
}: ActiveBenchCardProps) {
  const history = ticket.statusHistory || [];
  const lastStageEntry =
    history.length > 0 ? history[history.length - 1] : null;
  const stageStartIso =
    lastStageEntry?.changedAt || ticket.updatedAt || ticket.createdAt;

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const startMs = new Date(stageStartIso).getTime();
    if (Number.isNaN(startMs)) return 0;
    return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  });

  useEffect(() => {
    const startMs = new Date(stageStartIso).getTime();
    if (Number.isNaN(startMs)) return;

    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    };
    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [stageStartIso]);

  const device = ticket.request?.device;
  const deviceTitle =
    `${device?.brand || ""} ${device?.model || ""}`.trim() || "Unknown Device";
  const customerUser = device?.customer?.user;
  const customerNotes = device?.customer?.notes;
  const images = ticket.request?.images || [];

  const currentStageIndex = LIFECYCLE_STAGES.findIndex(
    (s) => s.status === ticket.status
  );

  const canMarkUnrepairable =
    ticket.status === "ACCEPTED" ||
    ticket.status === "DIAGNOSING" ||
    ticket.status === "IN_REPAIR";

  const getNextActionButton = () => {
    switch (ticket.status) {
      case "ACCEPTED":
        return {
          label: "Begin Diagnosis",
          icon: Stethoscope,
          className: "bg-sky-700 hover:bg-sky-800 text-white",
        };
      case "DIAGNOSING":
        return {
          label: "Start Hardware Repair",
          icon: Wrench,
          className: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "IN_REPAIR":
        return {
          label: "Mark Ready for Pickup",
          icon: PackageCheck,
          className: "bg-indigo-600 hover:bg-indigo-700 text-white",
        };
      case "READY_FOR_PICKUP":
        return {
          label: "Complete Ticket",
          icon: CheckCircle2,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      default:
        return null;
    }
  };

  const nextAction = getNextActionButton();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      {/* Top Accent Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-sky-600 via-sky-500 to-blue-600" />

      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {/* Card Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0 shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Active Bench Focus
                </span>
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket)}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
                {ticket.ticketNumber} · {deviceTitle}
                {device?.deviceType ? ` (${device.deviceType})` : ""}
              </h2>
            </div>
          </div>

          {/* Stage Elapsed Timer & Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex flex-col items-end mr-1">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Time in Current Stage
              </span>
              <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Timer className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-pulse" />
                <span>{formatDuration(elapsedSeconds)}</span>
              </div>
            </div>

            {onManageTicket && (
              <>
                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => onManageTicket(ticket, "notes")}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200/80 dark:border-zinc-700 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Adjust &amp; Notes</span>
                </button>

                {nextAction && (
                  <button
                    type="button"
                    onClick={() => onManageTicket(ticket, "transition")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${nextAction.className}`}
                  >
                    <nextAction.icon className="w-3.5 h-3.5" />
                    <span>{nextAction.label}</span>
                  </button>
                )}
              </>
            )}

            {onOpenWorkspace && (
              <button
                type="button"
                onClick={onOpenWorkspace}
                title="Jump to Queue Card"
                className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3-Column Sub-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Column 1: Client Profile & Intake Defect */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-750">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Client Profile
                </span>
                <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold bg-sky-100 dark:bg-sky-950/70 px-2 py-0.5 rounded">
                  {ticket.ticketNumber}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                  {getInitials(customerUser?.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {customerUser?.name || "Customer"}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {[customerUser?.phone, customerUser?.email]
                      .filter(Boolean)
                      .join(" · ") || "No contact info"}
                  </span>
                </div>
              </div>

              {customerNotes && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                  Note: {customerNotes}
                </p>
              )}

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  Reported Intake Problem
                </span>
                <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {ticket.request?.problem || "No problem summary provided"}
                  </p>
                  {ticket.request?.description && (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {ticket.request.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>S/N: {device?.serialNumber || "Not provided"}</span>
              <span className="font-sans font-medium">
                Opened: {formatDateTime(ticket.createdAt)}
              </span>
            </div>
          </div>

          {/* Column 2: Diagnosis & Repair Notes + Request Photos */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-750">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-[11px] uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-bold">
                    Diagnosis &amp; Repair Notes
                  </span>
                </div>
                {ticket.technician?.employeeId && (
                  <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/70 px-2 py-0.5 rounded font-semibold">
                    {ticket.technician.employeeId}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-sky-600" />
                    Diagnosis Findings
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {ticket.diagnosis || "No diagnosis recorded yet."}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-blue-600" />
                    Repair Notes
                  </span>
                  <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {ticket.repairNotes || "No repair notes recorded yet."}
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Intake Photos ({images.length})
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="h-14 w-14 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-100 dark:bg-zinc-800"
                        title={img.fileName}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.fileName}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Last updated: {formatDateTime(ticket.updatedAt)}</span>
              <span>{images.length} attachment(s)</span>
            </div>
          </div>

          {/* Column 3: Repair Stage Lifecycle Stepper */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-750">
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Repair Stage Lifecycle
              </span>

              <div className="flex flex-col gap-3 mt-1">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isDone =
                    currentStageIndex > idx || ticket.status === "COMPLETED";
                  const isCurrent = currentStageIndex === idx;
                  const matchingHistory = [...history]
                    .reverse()
                    .find((h) => h.status === stage.status);

                  const subtitle = matchingHistory
                    ? formatDateTime(matchingHistory.changedAt)
                    : isCurrent
                      ? "Current stage"
                      : isDone
                        ? "Completed"
                        : "Pending";

                  return (
                    <div
                      key={stage.status}
                      className={`flex items-center gap-2.5 transition-opacity ${
                        isCurrent
                          ? "opacity-100"
                          : isDone
                            ? "opacity-90"
                            : "opacity-50"
                      }`}
                    >
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isDone
                            ? "bg-sky-700 text-white"
                            : isCurrent
                              ? "bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-950"
                              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? "text-sky-700 dark:text-sky-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {stage.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap text-[11px] text-zinc-500 dark:text-zinc-400">
              {onManageTicket ? (
                <button
                  type="button"
                  onClick={() => onManageTicket(ticket, "history")}
                  className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  <Clock className="w-3 h-3" />
                  <span>{history.length} event(s) · History</span>
                </button>
              ) : (
                <span>{history.length} status event(s) logged</span>
              )}

              {onManageTicket && canMarkUnrepairable && (
                <button
                  type="button"
                  onClick={() => onManageTicket(ticket, "unrepairable")}
                  className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  <AlertOctagon className="w-3 h-3" />
                  <span>Unrepairable</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
