"use client";

import { useState, useMemo } from "react";
import { Loader2, AlertTriangle, RefreshCw, CheckCircle2, X } from "lucide-react";
import { useRepairRequests } from "@/Hooks/useRepairRequests";
import type {
  DetailedRepairRequest,
  RequestFilterTab,
  TicketPriority,
  RequestPhoto,
} from "@/types/requests";
import { RequestsHeader } from "./RequestsHeader";
import { PipelineLifecycleBanner } from "./PipelineLifecycleBanner";
import { RequestsFilterBar } from "./RequestsFilterBar";
import { RequestsTable } from "./RequestsTable";
import { RequestDetailCard } from "./RequestDetailCard";
import { RejectRequestModal } from "./RejectRequestModal";
import { PhotoPreviewModal } from "./PhotoPreviewModal";
import { PrintSlipModal } from "./PrintSlipModal";

export function RepairRequestsClient() {
  const [activeTab, setActiveTab] = useState<RequestFilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Modals state
  const [rejectModalRequest, setRejectModalRequest] = useState<DetailedRepairRequest | null>(
    null
  );
  const [previewPhoto, setPreviewPhoto] = useState<RequestPhoto | null>(null);
  const [printSlipRequest, setPrintSlipRequest] = useState<DetailedRepairRequest | null>(null);

  // User feedback toast
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const {
    requests,
    metrics,
    technicians,
    isLoading,
    isValidating,
    isError,
    mutate,
    convertToTicket,
    rejectRequest,
    quickAccept,
  } = useRepairRequests(activeTab, searchQuery);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  // Keep a selected request. If none selected, default to the first one available
  const selectedRequest = useMemo(() => {
    if (!requests || requests.length === 0) return null;
    if (!selectedRequestId) return requests[0];
    const found = requests.find((r) => r.id === selectedRequestId);
    return found || requests[0];
  }, [requests, selectedRequestId]);

  const handleSelectRequest = (req: DetailedRepairRequest) => {
    setSelectedRequestId(req.id);
  };

  const handleQuickAccept = async (requestId: string) => {
    try {
      const res = await quickAccept(requestId);
      showFeedback(`Accepted ${requestId} and generated Repair Ticket ${res.ticketId}`);
    } catch {
      showFeedback(`Failed to accept request ${requestId}`, "error");
    }
  };

  const handleQuickReject = (req: DetailedRepairRequest) => {
    setRejectModalRequest(req);
  };

  const handleFullConvert = async (
    requestId: string,
    techId: string,
    priority: TicketPriority
  ) => {
    try {
      const res = await convertToTicket({
        requestId,
        assignedTechnicianId: techId,
        priority,
      });
      showFeedback(res.message);
    } catch {
      showFeedback("Failed to convert request to ticket", "error");
    }
  };

  const handleConfirmRejection = async (requestId: string, reason: string) => {
    try {
      const res = await rejectRequest({
        requestId,
        reason,
        notifyCustomer: true,
      });
      showFeedback(res.message);
    } catch {
      showFeedback("Failed to reject request", "error");
    }
  };

  if (isLoading && !requests.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500 min-h-125">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <span className="text-sm font-medium">Connecting to Intake Requests Stream...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500 min-h-125">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Intake Stream Offline
        </span>
        <p className="text-xs text-zinc-500 mb-4 max-w-sm text-center">
          Unable to establish communication with the mobile app requests stream. Check telemetry network.
        </p>
        <button
          type="button"
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          role="status"
          className={`rounded-lg px-4 py-3 flex items-center justify-between text-xs font-medium border shadow-xs ${
            feedbackMessage.type === "success"
              ? "bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200"
              : "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label="Dismiss feedback"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <RequestsHeader
        avgResponseTime={metrics?.avgResponseTime}
        appVersion={metrics?.appVersion}
        isValidating={isValidating}
        onRefresh={() => mutate()}
      />

      {/* Standard Pipeline Lifecycle Banner */}
      <PipelineLifecycleBanner />

      {/* Filter Tabs & Search Bar */}
      <RequestsFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metrics={metrics}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Dual Column Layout: Left Table (7 cols) / Right Details (5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requests Queue Table */}
        <div className="xl:col-span-7 flex flex-col">
          <RequestsTable
            requests={requests}
            selectedRequestId={selectedRequest?.id || null}
            onSelectRequest={handleSelectRequest}
            onQuickAccept={handleQuickAccept}
            onQuickReject={handleQuickReject}
            totalCount={metrics?.totalCount ?? requests.length}
          />
        </div>

        {/* Right Column: Detailed Inspection & Triage Panel */}
        <div className="xl:col-span-5 flex flex-col">
          <RequestDetailCard
            request={selectedRequest}
            technicians={technicians}
            onConvert={handleFullConvert}
            onOpenReject={handleQuickReject}
            onOpenPhoto={setPreviewPhoto}
            onPrintSlip={(req) => setPrintSlipRequest(req)}
          />
        </div>
      </div>

      {/* Rejection Modal */}
      <RejectRequestModal
        request={rejectModalRequest}
        isOpen={!!rejectModalRequest}
        onClose={() => setRejectModalRequest(null)}
        onConfirm={handleConfirmRejection}
      />

      {/* Photo Preview Lightbox */}
      <PhotoPreviewModal
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
      />

      {/* Print Slip Modal */}
      <PrintSlipModal
        request={printSlipRequest}
        isOpen={!!printSlipRequest}
        onClose={() => setPrintSlipRequest(null)}
      />
    </div>
  );
}
