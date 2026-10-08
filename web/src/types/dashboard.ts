export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CONVERTED";

export type TicketStatus =
  | "PENDING_ASSIGNMENT"
  | "DIAGNOSING"
  | "IN_REPAIR"
  | "WAITING_FOR_PARTS"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface RepairRequestItem {
  id: string; // e.g. "REQ-1048"
  customerName: string;
  deviceModel: string;
  hardwareProblem: string;
  problemCategory?: "power" | "liquid" | "thermal" | "battery" | "screen" | "other";
  status: RequestStatus;
  createdAt: string;
}

export interface ActiveTicketItem {
  id: string; // e.g. "TCK-2038"
  deviceModel: string;
  customerName?: string;
  priority: TicketPriority;
  slaDue: string; 
  assignedTechName: string;
  assignedTechRole: string;
  status: TicketStatus;
  currentStageNote: string;
}

export interface TechnicianWorkloadItem {
  id: string;
  name: string;
  initials: string;
  role: string;
  activeTicketsCount: number;
  currentTicketId: string;
  currentTaskName: string;
  status: "BUSY" | "AVAILABLE" | "AWAY";
}

export interface ActivityFeedItem {
  id: string;
  referenceId: string; // e.g. "TCK-2038" or "REQ-1047 → TCK-2042"
  timestamp: string; // e.g. "11:45 AM"
  actionText: string;
  actorName?: string;
  detailNote?: string;
  highlightType: "primary" | "tertiary" | "secondary" | "error";
  badgeInfo?: string;
}

export interface DashboardMetrics {
  pendingRequestsCount: number;
  activeTicketsCount: number;
  inDiagnosisCount: number;
  inRepairCount: number;
  readyForPickupCount: number;
  completedTodayCount: number;
  labBenchCapacity: {
    assigned: number;
    total: number;
    percentage: number;
  };
  slaRate: string;
}

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  pendingRequests: RepairRequestItem[];
  activeTickets: ActiveTicketItem[];
  technicians: TechnicianWorkloadItem[];
  recentActivities: ActivityFeedItem[];
}
