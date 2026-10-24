"use client";

import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Trash2,
  ArrowRightLeft,
  Edit3,
  Check,
  AlertCircle,
  Loader2,
  Wrench,
  Clock,
  Layers,
  Calendar,
} from "lucide-react";
import { useTechnicianDetails } from "@/Hooks/useTechnicianDetails";
import { TechniciansService } from "@/services/technicians.service";

interface TechnicianDetailModalProps {
  technicianId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMutated?: () => void;
  onShowToast?: (message: string, type?: "success" | "error") => void;
  availableTechnicians?: Array<{ id: string; name: string; employeeId?: string }>;
}

export function TechnicianDetailModal({
  technicianId,
  isOpen,
  onClose,
  onMutated,
  onShowToast,
  availableTechnicians = [],
}: TechnicianDetailModalProps) {
  const { technician, isLoading, isError, mutate } = useTechnicianDetails(
    isOpen ? technicianId : null
  );

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password Reset State
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Transfer Tickets State
  const [isTransferring, setIsTransferring] = useState(false);
  const [targetTechId, setTargetTechId] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Deletion State
  const [isDeleting, setIsDeleting] = useState(false);

  // Inline error/message
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen || !technicianId) return null;

  const handleStartEdit = () => {
    if (!technician) return;
    setEditName(technician.user?.name || "");
    setEditEmail(technician.user?.email || "");
    setEditPhone(technician.user?.phone || "");
    setIsEditing(true);
    setActionError(null);
  };

  const handleSaveEdit = async () => {
    if (!technicianId) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await TechniciansService.updateTechnician(technicianId, {
        name: editName.trim() || undefined,
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || null,
      });
      await mutate();
      onMutated?.();
      setIsEditing(false);
      onShowToast?.("Technician profile updated successfully.", "success");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!technicianId) return;
    if (newPassword.length < 6) {
      setActionError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmittingPassword(true);
    setActionError(null);
    try {
      const msg = await TechniciansService.resetTechnicianPassword(technicianId, {
        password: newPassword,
      });
      setIsResettingPassword(false);
      setNewPassword("");
      onShowToast?.(msg || "Password reset successfully.", "success");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleTransferTickets = async () => {
    if (!technicianId || !targetTechId) return;
    setIsSubmittingTransfer(true);
    setActionError(null);
    try {
      const res = await TechniciansService.transferTechnicianTickets(technicianId, {
        targetTechnicianId: targetTechId,
      });
      await mutate();
      onMutated?.();
      setIsTransferring(false);
      setTargetTechId("");
      onShowToast?.(
        res.message || `Transferred ${res.transferredCount} ticket(s) successfully.`,
        "success"
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to transfer tickets.");
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleDeleteTechnician = async () => {
    if (!technicianId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this technician account? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      const msg = await TechniciansService.deleteTechnician(technicianId);
      onShowToast?.(msg || "Technician deleted successfully.", "success");
      onMutated?.();
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete technician.");
    } finally {
      setIsDeleting(false);
    }
  };

  const otherTechnicians = availableTechnicians.filter((t) => t.id !== technicianId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header Strip */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center text-sm border border-sky-200 dark:border-sky-800">
              {technician?.user?.name
                ? technician.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "TC"}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                <span>{technician?.user?.name || "Technician Profile"}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-normal">
                  {technician?.employeeId || "TECH"}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hardware Specialist Management &amp; Bench Diagnostics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Action Feedback Banner */}
          {actionError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Loading technician profile &amp; active tickets...
              </p>
            </div>
          ) : isError || !technician ? (
            <div className="py-12 text-center space-y-3 text-red-500">
              <AlertCircle className="w-6 h-6 mx-auto" />
              <p className="text-sm font-semibold">Failed to load technician details.</p>
            </div>
          ) : (
            <>
              {/* Profile Overview Card / Edit Form */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Account Profile</span>
                  </span>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Info</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-zinc-400 font-medium">Full Name</span>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{technician.user?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 font-medium">Email Address</span>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{technician.user?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 font-medium">Phone Number</span>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {technician.user?.phone || "No phone registered"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Workload Statistics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800 text-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Total Assigned
                  </span>
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 block font-mono">
                    {technician.stats?.totalTickets ?? technician.repairTickets?.length ?? 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900 text-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                    Active Workload
                  </span>
                  <span className="text-xl font-bold text-sky-700 dark:text-sky-300 mt-1 block font-mono">
                    {technician.stats?.activeTicketsCount ?? 0}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 text-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Repairs Completed
                  </span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block font-mono">
                    {technician.stats?.completedTicketsCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Administrative Controls Strip (Reset Password, Transfer, Delete) */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  <span>Admin Operations &amp; Credentials</span>
                </span>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Reset Password Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingPassword(!isResettingPassword);
                      setIsTransferring(false);
                      setActionError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Reset Password</span>
                  </button>

                  {/* Transfer Workload Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransferring(!isTransferring);
                      setIsResettingPassword(false);
                      setActionError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-sky-500" />
                    <span>Transfer Active Tickets</span>
                  </button>

                  {/* Delete Technician Button */}
                  <button
                    type="button"
                    onClick={handleDeleteTechnician}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 cursor-pointer ml-auto disabled:opacity-60"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Delete Specialist</span>
                  </button>
                </div>

                {/* Password Reset Sub-panel */}
                {isResettingPassword && (
                  <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Enter new password (min. 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 flex-1 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isSubmittingPassword || newPassword.length < 6}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingPassword && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Set Password</span>
                    </button>
                  </div>
                )}

                {/* Transfer Workload Sub-panel */}
                {isTransferring && (
                  <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2">
                    <select
                      value={targetTechId}
                      onChange={(e) => setTargetTechId(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 flex-1 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="">Select target technician...</option>
                      {otherTechnicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.employeeId || "Tech"})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleTransferTickets}
                      disabled={isSubmittingTransfer || !targetTechId}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingTransfer && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Transfer Workload</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Assigned Repair Tickets List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Assigned Bench Queue ({technician.repairTickets?.length || 0})</span>
                </span>

                {!technician.repairTickets || technician.repairTickets.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-zinc-50/60 dark:bg-zinc-950/30 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                    No active or historical repair tickets assigned to this specialist.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                    {technician.repairTickets.map((ticket) => {
                      const isComplete = ticket.status === "COMPLETED";
                      const deviceTitle = ticket.request?.device
                        ? `${ticket.request.device.brand} ${ticket.request.device.model}`
                        : "Device Unit";

                      return (
                        <div key={ticket.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                                {ticket.ticketNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                  ticket.priority === "HIGH"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                              >
                                {ticket.priority}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                                  isComplete
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                                }`}
                              >
                                {ticket.status}
                              </span>
                            </div>

                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {deviceTitle}
                            </p>

                            {ticket.request?.problem && (
                              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate flex items-center gap-1">
                                <Wrench className="w-3 h-3 shrink-0" />
                                <span>{ticket.request.problem}</span>
                              </p>
                            )}
                          </div>

                          <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

