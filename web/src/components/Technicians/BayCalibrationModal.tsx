"use client";

import { X, Sliders, CheckCircle2, ShieldCheck } from "lucide-react";

interface BayCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BayCalibrationModal({ isOpen, onClose }: BayCalibrationModalProps) {
  if (!isOpen) return null;

  const calibrations = [
    { bay: "BAY #01 (Triage)", esd: "0.64 MΩ", ground: "Normal", scope: "Calibrated", lastCheck: "08:05 AST" },
    { bay: "BAY #02 (Display)", esd: "0.55 MΩ", ground: "Normal", scope: "Calibrated", lastCheck: "08:12 AST" },
    { bay: "BAY #03 (BGA)", esd: "0.58 MΩ", ground: "Normal", scope: "Calibrated", lastCheck: "08:10 AST" },
    { bay: "BAY #04 (SMD Lead)", esd: "0.61 MΩ", ground: "Optimal", scope: "Thermal Zeroed", lastCheck: "08:15 AST" },
    { bay: "BAY #05 (Peripherals)", esd: "0.62 MΩ", ground: "Normal", scope: "Calibrated", lastCheck: "08:14 AST" },
    { bay: "BAY #06 (Ultrasonic)", esd: "0.52 MΩ", ground: "Normal", scope: "Standby", lastCheck: "Yesterday" },
    { bay: "BAY #07 (Rig)", esd: "0.50 MΩ", ground: "Optimal", scope: "Auto-Cycling", lastCheck: "08:00 AST" },
    { bay: "BAY #08 (Open)", esd: "0.59 MΩ", ground: "Standby", scope: "Standby", lastCheck: "07:30 AST" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Bay Calibration Matrix
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ANSI/ESD S20.20 &amp; ISO Lab Bench Electrical Ground Isolation Status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono text-[11px] uppercase">
                <th className="pb-2 font-semibold">Station / Bay</th>
                <th className="pb-2 font-semibold">ESD Mat Resistance</th>
                <th className="pb-2 font-semibold">Ground Node</th>
                <th className="pb-2 font-semibold">Optics / Rig</th>
                <th className="pb-2 font-semibold">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {calibrations.map((cal, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {cal.bay}
                  </td>
                  <td className="py-2.5 font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    {cal.esd}
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {cal.ground}
                    </span>
                  </td>
                  <td className="py-2.5 text-zinc-600 dark:text-zinc-300">
                    {cal.scope}
                  </td>
                  <td className="py-2.5 font-mono text-zinc-400 text-[11px]">
                    {cal.lastCheck}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            All benches compliant with &lt;1.0 MΩ ESD safety standard
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}

