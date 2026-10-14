"use client";

import { Printer, X, CheckCircle2 } from "lucide-react";
import type { DetailedRepairRequest } from "@/types/requests";

interface PrintSlipModalProps {
  request: DetailedRepairRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintSlipModal({ request, isOpen, onClose }: PrintSlipModalProps) {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-slip-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full bg-white dark:bg-zinc-900 print:dark:bg-white text-zinc-900 print:text-black rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (hidden on print) */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 print:hidden">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
            <Printer className="w-4 h-4" />
            <h3 id="print-slip-title" className="text-sm font-bold">
              Intake Routing Slip Preview
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable Slip */}
        <div className="border border-zinc-300 print:border-black rounded-lg p-5 font-mono text-xs flex flex-col gap-4 bg-zinc-50/50 print:bg-white dark:bg-zinc-950/40 print:dark:bg-white">
          {/* Slip Header */}
          <div className="flex items-center justify-between border-b pb-3 border-zinc-200 print:border-black">
            <div>
              <div className="text-base font-bold tracking-tight">FanniTech LAB OS</div>
              <div className="text-[10px] text-zinc-500 print:text-zinc-700">
                Official Intake Service Slip • Branch #01
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-sky-700 print:text-black">
                {request.id}
              </div>
              <div className="text-[10px] text-zinc-500 print:text-zinc-700">
                {request.submittedAt}
              </div>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="text-center py-1 bg-white print:bg-white dark:bg-black/20 rounded border border-zinc-200 print:border-black">
            <div className="tracking-[0.4em] text-lg font-bold">|| | |||| | ||| |||| |</div>
            <div className="text-[9px] text-zinc-500 font-mono">*{request.id}*</div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-zinc-400 print:text-zinc-600 block uppercase text-[9px]">
                Customer
              </span>
              <span className="font-bold">{request.customer.name}</span>
              <div className="text-zinc-600">{request.customer.phone}</div>
              <div className="text-zinc-500 text-[10px]">{request.customer.id}</div>
            </div>
            <div>
              <span className="text-zinc-400 print:text-zinc-600 block uppercase text-[9px]">
                Device / Hardware
              </span>
              <span className="font-bold">{request.hardware.model}</span>
              <div className="text-zinc-600">S/N: {request.hardware.serialNumber}</div>
              <div className="text-zinc-500 text-[10px]">
                {request.hardware.includedAccessories?.join(", ") || "Standard"}
              </div>
            </div>
          </div>

          {/* Reported Defect */}
          <div className="border-t pt-2 border-zinc-200 print:border-black">
            <span className="text-zinc-400 print:text-zinc-600 block uppercase text-[9px]">
              Customer Reported Issue ({request.problemCategory})
            </span>
            <div className="font-bold mt-0.5">{request.problemTitle}</div>
            <div className="text-zinc-600 text-[10px] mt-1 italic">
              &quot;{request.problemDescription}&quot;
            </div>
          </div>

          {/* Routing signature line */}
          <div className="border-t pt-3 border-zinc-200 print:border-black flex justify-between items-end text-[10px]">
            <div>
              <span>Status: </span>
              <span className="font-bold">{request.status}</span>
            </div>
            <div className="border-b border-dotted border-black w-32 text-center pb-0.5 text-zinc-400 print:text-black">
              Tech Initials / Bench #
            </div>
          </div>
        </div>

        {/* Print Buttons (hidden on print) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
