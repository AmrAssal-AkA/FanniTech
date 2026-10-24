"use client";

import { useState } from "react";
import { AlertTriangle, X, Send } from "lucide-react";
import type { DetailedRepairRequest } from "@/types/requests";

interface RejectRequestModalProps {
  request: DetailedRepairRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string, reason: string) => Promise<void>;
}

const DEFAULT_REASONS = [
  "Hardware / Service out of scope for this branch",
  "Parts obsolete or currently unavailable worldwide",
  "Customer cancelled over mobile phone inquiry",
  "Device beyond economical repair (BER)",
];

export function RejectRequestModal({
  request,
  isOpen,
  onClose,
  onConfirm,
}: RejectRequestModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(DEFAULT_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const reasonToUse =
        selectedReason === "other"
          ? customReason.trim() || "Declined based on lab triage criteria"
          : selectedReason;
      await onConfirm(request.id, reasonToUse);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 id="reject-modal-title" className="text-base font-bold">
              Reject Request ({request.id})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative message */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The customer (
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">
            {request.customer.name}
          </span>
          ) will receive an instant push notification via the FanniTech mobile app explaining why the request was declined:
        </p>

        {/* Reason options */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="space-y-2">
            {DEFAULT_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="reject_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                  {reason}
                </span>
              </label>
            ))}

            {/* Custom reason option */}
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer transition-colors">
              <input
                type="radio"
                name="reject_reason"
                value="other"
                checked={selectedReason === "other"}
                onChange={() => setSelectedReason("other")}
                className="text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                Custom reason...
              </span>
            </label>

            {selectedReason === "other" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify rejection details to be displayed to the customer in the mobile app..."
                rows={3}
                className="w-full mt-1 p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Rejecting..." : "Confirm Rejection"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
