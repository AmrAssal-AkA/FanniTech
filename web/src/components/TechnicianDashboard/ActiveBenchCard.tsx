"use client";

import { useEffect } from "react";
import {
  Cpu,
  Timer,
  Pause,
  Play,
  RotateCw,
  ExternalLink,
  Flame,
  Zap,
  Check,
  FileText,
} from "lucide-react";
import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";
import type { ActiveMatTicket } from "@/types/technicianDashboard";

interface ActiveBenchCardProps {
  ticket: ActiveMatTicket;
  onOpenWorkspace?: () => void;
  onSetInRepair?: () => void;
}

export function ActiveBenchCard({
  ticket,
  onOpenWorkspace,
  onSetInRepair,
}: ActiveBenchCardProps) {
  const isTimerRunning = useTechnicianDashboardUIStore((state) => state.isTimerRunning);
  const timerSeconds = useTechnicianDashboardUIStore((state) => state.timerSeconds);
  const toggleTimer = useTechnicianDashboardUIStore((state) => state.toggleTimer);
  const incrementTimer = useTechnicianDashboardUIStore((state) => state.incrementTimer);
  const activeStep = useTechnicianDashboardUIStore((state) => state.activeStep);
  const advanceStep = useTechnicianDashboardUIStore((state) => state.advanceStep);
  const setSchematicModalOpen = useTechnicianDashboardUIStore(
    (state) => state.setSchematicModalOpen
  );

  // Live timer tick
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      incrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, incrementTimer]);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const steps = [
    {
      num: 1,
      title: "Intake & Visual Audit",
      sub: "08:45 AM Passed",
    },
    {
      num: 2,
      title: "Micro-Soldering Diagnosis",
      sub: "In Progress (Bay #04)",
    },
    {
      num: 3,
      title: "Component Replacement",
      sub: "Pending PQ301 swap",
    },
    {
      num: 4,
      title: "Burn-in Stress & QC Pass",
      sub: "60-min stability test",
    },
  ];

  const getNextStepLabel = () => {
    switch (activeStep) {
      case 1:
        return "Advance to Step 2 (Diagnosis)";
      case 2:
        return "Advance to Step 3 (Component Swap)";
      case 3:
        return "Advance to Step 4 (QC Pass)";
      default:
        return "Reset Stage Lifecycle";
    }
  };

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
                  Physical Station
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                  BAY #04 ANTISTATIC MAT
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 text-xs font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                  CRITICAL VIP
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
                {ticket.ticketNumber} · {ticket.deviceTitle} ({ticket.processorSpec})
              </h2>
            </div>
          </div>

          {/* Diagnostic Timer & Header Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Diagnostic Elapsed
              </span>
              <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Timer
                  className={`w-4 h-4 text-sky-600 dark:text-sky-400 ${
                    isTimerRunning ? "animate-pulse" : ""
                  }`}
                />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTimer}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-200/80 dark:border-zinc-700"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onSetInRepair}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-200/80 dark:border-zinc-700"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Set In-Repair</span>
              </button>

              <button
                type="button"
                onClick={onOpenWorkspace}
                className="px-3.5 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>Open Ticket Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
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
                  {ticket.clientAccount}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                  HN
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {ticket.clientName} (VIP Corporate)
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {ticket.clientContact} · {ticket.clientBranch}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  Reported Intake Defect
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                  &ldquo;{ticket.intakeDefect}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>S/N: {ticket.serialNumber}</span>
              <span className="font-sans font-medium text-amber-700 dark:text-amber-400">
                Intake SLA: {ticket.intakeSlaDue}
              </span>
            </div>
          </div>

          {/* Column 2: Hardware Telemetry & Micro-Soldering Findings */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-750">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="text-[11px] uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-bold">
                    Active Multimeter &amp; Rail Telemetry
                  </span>
                </div>
                <span className="font-mono text-[11px] text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/70 px-2 py-0.5 rounded font-bold">
                  19V DC-IN SHORT DETECTED
                </span>
              </div>

              {/* 3 Rails Grid */}
              <div className="grid grid-cols-3 gap-2">
                {ticket.rails.map((rail) => (
                  <div
                    key={rail.label}
                    className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex flex-col"
                  >
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold truncate">
                      {rail.label}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold mt-0.5 ${
                        rail.isError
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {rail.value}
                    </span>
                    <span
                      className={`text-[10px] font-semibold mt-0.5 ${
                        rail.isError
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {rail.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* FLIR Thermal Snapshot Preview */}
              <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      FLIR Thermal Hotspot: {ticket.thermal.componentName}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      High thermal dump: {ticket.thermal.temperature} ({ticket.thermal.injectionSpec})
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-1 rounded font-semibold shrink-0">
                  {ticket.thermal.partNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                FLIR ETS320 Connected via USB-Bench
              </span>
              <button
                type="button"
                onClick={() => setSchematicModalOpen(true)}
                className="text-sky-700 dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Schematic Boardview PDF</span>
              </button>
            </div>
          </div>

          {/* Column 3: Repair Stage Lifecycle Stepper */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-750">
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Repair Stage Lifecycle
              </span>

              <div className="flex flex-col gap-2.5 mt-1">
                {steps.map((st) => {
                  const isDone = st.num < activeStep;
                  const isCurrent = st.num === activeStep;

                  return (
                    <div
                      key={st.num}
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
                        {isDone ? <Check className="w-3.5 h-3.5" /> : st.num}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent
                              ? "text-sky-700 dark:text-sky-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {st.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {st.sub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={advanceStep}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-zinc-200/90 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{getNextStepLabel()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
