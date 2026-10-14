"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Printer,
  Maximize2,
  User,
  Phone,
  Mail,
  Laptop,
  AlertTriangle,
  ImageIcon,
  Wrench,
  XCircle,
  Eye,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type {
  DetailedRepairRequest,
  TechnicianOption,
  TicketPriority,
  RequestPhoto,
} from "@/types/requests";

interface RequestDetailCardProps {
  request: DetailedRepairRequest | null;
  technicians: TechnicianOption[];
  onConvert: (
    requestId: string,
    techId: string,
    priority: TicketPriority,
  ) => Promise<void>;
  onOpenReject: (request: DetailedRepairRequest) => void;
  onOpenPhoto: (photo: RequestPhoto) => void;
  onPrintSlip: (request: DetailedRepairRequest) => void;
}

export function RequestDetailCard({
  request,
  technicians,
  onConvert,
  onOpenReject,
  onOpenPhoto,
  onPrintSlip,
}: RequestDetailCardProps) {
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [selectedPriority, setSelectedPriority] =
    useState<TicketPriority>("HIGH");
  const [isConverting, setIsConverting] = useState(false);

  if (!request) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center text-zinc-500 shadow-xs min-h-105">
        <Laptop className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" />
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          No Repair Request Selected
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">
          Select an incoming intake item from the queue table on the left to
          inspect customer details, diagnostics, and conversion actions.
        </p>
      </div>
    );
  }

  const handleConvertSubmit = async () => {
    setIsConverting(true);
    try {
      await onConvert(request.id, selectedTech, selectedPriority);
    } finally {
      setIsConverting(false);
    }
  };

  const isPending = request.status === "PENDING";
  const isAccepted = request.status === "ACCEPTED";
  const isRejected = request.status === "REJECTED";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs p-5 flex flex-col gap-5">
      {/* Detail Header */}
      <div className="flex items-start justify-between bg-zinc-50 dark:bg-zinc-850 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {request.id}
            </span>
            {request.status === "PENDING" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                PENDING REVIEW
              </span>
            )}
            {request.status === "ACCEPTED" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                ACCEPTED &amp; CONVERTED
              </span>
            )}
            {request.status === "REJECTED" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-mono font-bold">
                <XCircle className="w-3 h-3 text-red-600" />
                REJECTED
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Submission: {request.submittedAt} (Customer Mobile App)
          </span>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPrintSlip(request)}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            title="Print Request Slip"
            aria-label="Print Request Slip"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPrintSlip(request)}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            title="Open Slip Preview"
            aria-label="Open Slip Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Cards: Customer Profile & Hardware Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer Profile */}
        <div className="bg-zinc-50/70 dark:bg-zinc-850/60 p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 mb-0.5">
            <User className="w-4 h-4" />
            <span className="font-mono text-[11px] uppercase font-bold tracking-wider">
              Customer Profile
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {request.customer.name}
              </span>
              {request.customer.isVip && (
                <span className="px-1.5 py-0.2 bg-amber-200/80 dark:bg-amber-950 text-amber-900 dark:text-amber-200 text-[10px] rounded font-bold">
                  VIP
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              ID: {request.customer.id}
            </span>
          </div>

          <div className="flex flex-col gap-1 pt-1 text-zinc-600 dark:text-zinc-400 text-xs">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{request.customer.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{request.customer.email}</span>
            </div>
          </div>

          <div className="mt-1 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Lab History:</span>
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              {request.customer.repairHistoryCount > 0
                ? `${request.customer.repairHistoryCount} Previous Repairs`
                : "First-time Customer"}
            </span>
          </div>
        </div>

        {/* Hardware Specs */}
        <div className="bg-zinc-50/70 dark:bg-zinc-850/60 p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 mb-0.5">
            <Laptop className="w-4 h-4" />
            <span className="font-mono text-[11px] uppercase font-bold tracking-wider">
              Hardware Specs
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {request.hardware.model}
            </span>
            <span className="text-xs text-zinc-500">
              {request.hardware.subModel || "Standard Configuration"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 pt-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Serial / Asset Tag:
            </span>
            <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/80 dark:border-zinc-800 w-fit">
              {request.hardware.serialNumber}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {request.hardware.deviceType && (
              <span className="px-2 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] rounded">
                {request.hardware.deviceType}
              </span>
            )}
            {request.hardware.color && (
              <span className="px-2 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] rounded">
                {request.hardware.color}
              </span>
            )}
            {request.hardware.includedAccessories?.map((acc) => (
              <span
                key={acc}
                className="px-2 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] rounded"
              >
                {acc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reported Problem Card */}
      <div className="bg-zinc-50/70 dark:bg-zinc-850/60 p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Reported Problem
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full">
            {request.problemCategory}
          </span>
        </div>

        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
          &quot;{request.problemTitle}&quot;
        </p>

        <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
            Customer Description (Mobile Submission):
          </span>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
            &quot;{request.problemDescription}&quot;
          </p>
        </div>

        {/* Attached Photos */}
        {request.attachedPhotos && request.attachedPhotos.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
              <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>Attached Photos ({request.attachedPhotos.length}):</span>
            </div>

            <div className="flex items-center gap-3">
              {request.attachedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onOpenPhoto(photo)}
                  className="w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative group cursor-pointer border border-zinc-300 dark:border-zinc-700 shadow-2xs"
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Triage & Ticket Conversion Section */}
      {isPending && (
        <div className="bg-sky-50/50 dark:bg-sky-950/20 p-4 rounded-lg border border-sky-100 dark:border-sky-900/50 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Triage &amp; Ticket Conversion
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Technician assignment */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="tech-select"
                className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Assign Technician (Optional)
              </label>
              <select
                id="tech-select"
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-600 shadow-2xs"
              >
                <option value="">-- Unassigned (Assign later) --</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} {tech.activeTicketsCount !== undefined ? `(${tech.activeTicketsCount} active)` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Repair Priority */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="priority-select"
                className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Repair Priority
              </label>
              <select
                id="priority-select"
                value={selectedPriority}
                onChange={(e) =>
                  setSelectedPriority(e.target.value as TicketPriority)
                }
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-600 shadow-2xs"
              >
                <option value="NORMAL">Normal (48h Turnaround)</option>
                <option value="HIGH">High (24h Turnaround)</option>
                <option value="CRITICAL">Critical / Emergency Express</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={isConverting}
              onClick={handleConvertSubmit}
              className="w-full sm:flex-1 h-10 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>
                {isConverting ? "Converting..." : "Convert to Repair Ticket"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onOpenReject(request)}
              className="w-full sm:w-auto h-10 px-4 bg-white dark:bg-zinc-850 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Request</span>
            </button>
          </div>
        </div>
      )}

      {/* If already accepted */}
      {isAccepted && (
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Ticket Created: {request.convertedTicketId}
              </span>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Priority: {request.priority || "NORMAL"} • Technician:{" "}
                {technicians.find((t) => t.id === request.assignedTechnicianId)
                  ?.name ||
                  request.assignedTechnicianId ||
                  "Unassigned"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* If already rejected */}
      {isRejected && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-lg p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs">
            <XCircle className="w-4 h-4" />
            <span>Request Rejected</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Reason: {request.rejectionReason || "Out of scope"}
          </p>
        </div>
      )}
    </div>
  );
}
