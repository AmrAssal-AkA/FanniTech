"use client";

import { X, FileText, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";

export function SchematicModal() {
  const isOpen = useTechnicianDashboardUIStore((state) => state.schematicModalOpen);
  const setOpen = useTechnicianDashboardUIStore((state) => state.setSchematicModalOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 dark:text-sky-300">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
                Boardview Schematic Inspector
              </h3>
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                NM-D351 Rev 1.0 · Lenovo ThinkPad T14 Gen 2
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schematic diagram mockup */}
        <div className="mt-4 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-xs leading-relaxed border border-zinc-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2 mb-3">
              <span>CIRCUIT BLOCK: 19V DC-IN FIRST STAGE PROTECTION</span>
              <span className="text-amber-400 font-bold">[HOTSPOT IDENTIFIED]</span>
            </div>
            <div className="space-y-1">
              <div>V_IN (Type-C PD 20V) ─────────┐</div>
              <div className="pl-28">│</div>
              <div>                         ▼</div>
              <div>                ┌─────────────────┐</div>
              <div>                │  PQ301 (AON6414A)│ ◄── DEAD SHORT (0.02 Ω)</div>
              <div>   GATE_DRV ────┤Pin 4: GATE      │     Thermal Dump: 78.4°C</div>
              <div>                │Pins 1-3: SOURCE ├────► +19V_MAIN_BUS</div>
              <div>                │Pins 5-8: DRAIN  │</div>
              <div>                └─────────────────┘</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-750 flex flex-col gap-1">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                Root Cause Analysis
              </span>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                Drain-to-source avalanche breakdown caused by high voltage transient pulse on dock connection. Gate oxide damaged.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-750 flex flex-col gap-1">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Prescribed Work Order
              </span>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                Desolder PQ301 using hot air at 360°C. Clean pads with wick. Solder replacement AON6414A from Bin #B-14.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            File: NM-D351_R10_SCHEMATIC.PDF (12.4 MB)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

