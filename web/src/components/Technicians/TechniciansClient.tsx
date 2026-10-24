"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, AlertCircle, X, Loader2, UserPlus, Cpu } from "lucide-react";

import type {
  TechnicianStatus,
  TechnicianSummaryMetrics,
  PendingIntakeItem,
} from "@/types/technicians";
import { adaptBackendTechnicianToProfile } from "@/types/technicians";
import { useTechnicians } from "@/Hooks/useTechnicians";

import { TechniciansHeader } from "./TechniciansHeader";
import { TechniciansMetrics } from "./TechniciansMetrics";
import { TechniciansFilterBar } from "./TechniciansFilterBar";
import { TechnicianFeaturedCard } from "./TechnicianFeaturedCard";
import { TechnicianSecondaryCard } from "./TechnicianSecondaryCard";
import { TechnicianCompactRow } from "./TechnicianCompactRow";
import { AddTechnicianModal, type AddTechnicianFormData } from "./AddTechnicianModal";
import { BayCalibrationModal } from "./BayCalibrationModal";
import { TechnicianDetailModal } from "./TechnicianDetailModal";
import { UnassignedIntakeQueue } from "./UnassignedIntakeQueue";

export function TechniciansClient() {
  // SWR API Hook for live technicians list
  const { rawTechnicians, isLoading, isError, mutate } = useTechnicians();

  // Adapt raw API technicians to UI profile representation
  const allProfiles = useMemo(() => {
    return rawTechnicians.map((raw, idx) =>
      adaptBackendTechnicianToProfile(raw, idx)
    );
  }, [rawTechnicians]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TechnicianStatus | "all">("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  // Interactive UI state & modals
  const [isBalancing, setIsBalancing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Partition all technicians into layout tiers: Featured (up to 2), Secondary (next 2), Compact (rest)
  const featuredTechs = useMemo(() => {
    return allProfiles.slice(0, 2);
  }, [allProfiles]);

  const secondaryTechs = useMemo(() => {
    return allProfiles.slice(2, 4);
  }, [allProfiles]);

  const compactTechs = useMemo(() => {
    return allProfiles.slice(4);
  }, [allProfiles]);

  // Compute live KPI summary metrics from API data
  const metrics = useMemo<TechnicianSummaryMetrics>(() => {
    const total = allProfiles.length;
    const activeCount = allProfiles.filter((t) => t.status === "active").length;
    const totalActiveTickets = allProfiles.reduce(
      (acc, t) => acc + t.benchQueueCount,
      0
    );
    const avgTickets =
      total > 0 ? parseFloat((totalActiveTickets / total).toFixed(1)) : 0;
    const occupiedBays = Math.min(activeCount, 8);
    const occupancyRate = total > 0 ? Math.round((occupiedBays / 8) * 100) : 0;

    return {
      activeOnShift: activeCount,
      totalSpecialists: total,
      occupancyRate,
      activeBays: occupiedBays,
      totalBays: 8,
      activeTicketsCount: totalActiveTickets,
      avgTicketsPerTech: avgTickets,
      urgentTicketsCount: allProfiles.filter((t) => t.activeTicket?.priority === "VIP URGENT").length,
      avgTurnaroundHours: 4.2,
      targetTurnaroundHours: 6.0,
      slaPassRate: 98.4,
    };
  }, [allProfiles]);

  // Collect distinct specializations for filter dropdown
  const specializations = useMemo(() => {
    const all = allProfiles.map((t) => t.specialization);
    return Array.from(new Set(all));
  }, [allProfiles]);

  // Filtering helpers
  const matchesFilter = (item: {
    name: string;
    arabicName?: string;
    techId: string;
    bayName: string;
    specialization: string;
    status: TechnicianStatus;
  }) => {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (
      specializationFilter !== "all" &&
      item.specialization !== specializationFilter
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        (item.arabicName && item.arabicName.includes(q)) ||
        item.techId.toLowerCase().includes(q) ||
        item.bayName.toLowerCase().includes(q) ||
        item.specialization.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  };

  const filteredFeatured = useMemo(
    () => featuredTechs.filter(matchesFilter),
    [featuredTechs, statusFilter, specializationFilter, searchQuery]
  );

  const filteredSecondary = useMemo(
    () => secondaryTechs.filter(matchesFilter),
    [secondaryTechs, statusFilter, specializationFilter, searchQuery]
  );

  const filteredCompact = useMemo(
    () => compactTechs.filter(matchesFilter),
    [compactTechs, statusFilter, specializationFilter, searchQuery]
  );

  // Auto-balance micro interaction
  const handleAutoBalance = () => {
    if (isBalancing) return;
    setIsBalancing(true);

    setTimeout(() => {
      setIsBalancing(false);
      showToast(
        "Workbench Auto-Balanced: intake tickets distributed across active bays.",
        "success"
      );
    }, 1200);
  };

  // Inspect or manage technician
  const handleInspectTechnician = (techIdOrUuid: string) => {
    // Find the profile to ensure we pass the UUID
    const target = allProfiles.find(
      (t) => t.id === techIdOrUuid || t.techId === techIdOrUuid
    );
    setSelectedTechnicianId(target ? target.id : techIdOrUuid);
  };

  // Add technician callback: revalidate cache immediately from backend
  const handleAddTechnician = async (formData: AddTechnicianFormData) => {
    await mutate();
    const techId =
      formData.createdTechnician?.technician?.employeeId || "New Technician";
    showToast(
      `Successfully onboarded technician ${formData.name} (${techId}).`,
      "success"
    );
  };

  // Available technicians list for transfer dropdown
  const availableTechniciansForTransfer = useMemo(() => {
    return allProfiles.map((t) => ({
      id: t.id,
      name: t.name,
      employeeId: t.techId,
    }));
  }, [allProfiles]);

  // Demo queue of unassigned intakes for the right pane
  const pendingIntakes = useMemo<PendingIntakeItem[]>(() => {
    return [];
  }, []);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xl text-xs font-medium animate-in slide-in-from-top-2 duration-200">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header and Lab Status Strip */}
      <TechniciansHeader
        onAddTechnician={() => setIsAddModalOpen(true)}
      />

      {/* KPI Matrix (4-Column Summary) */}
      <TechniciansMetrics metrics={metrics} />

      {/* Filter and Search Bar */}
      <TechniciansFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        specializationFilter={specializationFilter}
        onSpecializationFilterChange={setSpecializationFilter}
        specializations={specializations}
      />

      {/* Dual Pane Split Layout (Cards Directory + Live Bay Topology Map) */}
      <div className="px-6 pt-5 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8 Columns: Dynamic Technician Profile Cards */}
        <div className="xl:col-span-8 space-y-5">
          {/* Loading State */}
          {isLoading && allProfiles.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Loading technician roster from Lab OS...
              </p>
              <p className="text-xs text-zinc-400">
                Synchronizing active bench allocations and specialists telemetry.
              </p>
            </div>
          ) : isError && allProfiles.length === 0 ? (
            /* Error State */
            <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 space-y-3">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Failed to load technicians
              </p>
              <p className="text-xs text-red-500">
                {isError instanceof Error
                  ? isError.message
                  : "An unexpected error occurred while fetching technicians."}
              </p>
              <button
                type="button"
                onClick={() => mutate()}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : allProfiles.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No technicians onboarded yet
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Register your first bench specialist to allocate repair bays and begin dispatching tickets.
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard First Technician</span>
              </button>
            </div>
          ) : (
            <>
              {/* Featured Cards: Lead Tech & Specialists */}
              {filteredFeatured.map((tech) => (
                <TechnicianFeaturedCard
                  key={tech.id}
                  technician={tech}
                  onInspectTicket={() => handleInspectTechnician(tech.id)}
                  onReassign={() => handleInspectTechnician(tech.id)}
                  onTelemetryStream={() => handleInspectTechnician(tech.id)}
                />
              ))}

              {/* 2-Card Grid for Secondary Active Techs */}
              {filteredSecondary.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredSecondary.map((tech) => (
                    <TechnicianSecondaryCard
                      key={tech.id}
                      technician={tech}
                      onActionClick={() => handleInspectTechnician(tech.id)}
                    />
                  ))}
                </div>
              )}

              {/* Compact Additional Workbench Staff & Shift Rotation */}
              {filteredCompact.length > 0 && (
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                      Additional Workbench Staff &amp; Shift Rotation
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      Lab Roster Index
                    </span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {filteredCompact.map((tech) => (
                      <TechnicianCompactRow
                        key={tech.id}
                        technician={tech}
                        onClick={() => handleInspectTechnician(tech.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty Search State */}
              {filteredFeatured.length === 0 &&
                filteredSecondary.length === 0 &&
                filteredCompact.length === 0 && (
                  <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      No technicians match your search or filter
                    </p>
                    <p className="text-xs text-zinc-400">
                      Try clearing your search query or selecting &quot;All Specialists&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSpecializationFilter("all");
                      }}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Right 4 Columns: Workbench Intake & Lab Telemetry */}
        <div className="xl:col-span-4 space-y-5">
          {/* Quick Roster Status */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-600" />
                <span>Lab Operations Overview</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500">Active Shift Roster</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {metrics.activeOnShift} / {metrics.totalSpecialists} On Bench
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500">Occupancy Rate</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {metrics.occupancyRate}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500">Active Bench Tickets</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {metrics.activeTicketsCount} Units
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Target Turnaround</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.targetTurnaroundHours} Hours (SLA 98%)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-2 px-3 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard New Specialist</span>
            </button>
          </div>

          {/* Unassigned Intake Queue Component */}
          <UnassignedIntakeQueue
            intakes={pendingIntakes}
            onAssignRequest={() => showToast("Opening triage queue modal.", "success")}
            onAutoBalance={handleAutoBalance}
            isBalancing={isBalancing}
          />
        </div>
      </div>

      {/* Modals */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTechnician}
      />

      <BayCalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
      />

      {/* Technician Profile, Workload & Action Management Modal */}
      <TechnicianDetailModal
        technicianId={selectedTechnicianId}
        isOpen={Boolean(selectedTechnicianId)}
        onClose={() => setSelectedTechnicianId(null)}
        onMutated={() => mutate()}
        onShowToast={showToast}
        availableTechnicians={availableTechniciansForTransfer}
      />
    </div>
  );
}
