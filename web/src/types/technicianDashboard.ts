import type { RepairTicket, RepairTicketPriority, RepairTicketStatus } from "@/types/tickets";

export interface WorkbenchMetrics {
  activeQueueCount: number;
  criticalUrgentCount: number;
  underDiagnosisCount: number;
  readyForQACount: number;
  completedTodayCount: number;
  passRatePercentage: number;
  aheadOfTargetCount: number;
  avgDiagnosticMinutes: number;
  slaTargetMinutes: number;
}

export interface TelemetryRail {
  label: string;
  value: string;
  status: "Dead Short" | "Normal Hi-Z" | "Within Spec" | "Warning" | "Normal";
  isError?: boolean;
}

export interface ThermalHotspot {
  componentName: string;
  temperature: string;
  injectionSpec: string;
  partReady: boolean;
  partNumber: string;
}

export interface RepairStageStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  status: "completed" | "active" | "pending";
}

export interface ActiveMatTicket {
  ticketNumber: string;
  deviceTitle: string;
  processorSpec: string;
  clientAccount: string;
  clientName: string;
  clientContact: string;
  clientBranch: string;
  intakeDefect: string;
  serialNumber: string;
  intakeSlaDue: string;
  motherboardModel: string;
  rails: TelemetryRail[];
  thermal: ThermalHotspot;
  currentStep: number;
  stages: RepairStageStep[];
  elapsedSeconds: number;
  isPaused: boolean;
}

export interface RigDevice {
  name: string;
  spec: string;
  value: string;
  statusLabel: string;
  isOnline: boolean;
}

export interface BenchActivityItem {
  id: string;
  time: string;
  type: "primary" | "tertiary" | "neutral" | "success";
  headline: string;
  ticketNumber?: string;
  detail: string;
}

export interface TechnicianDashboardData {
  technicianName: string;
  technicianRole: string;
  bayNumber: string;
  calibrationId: string;
  shiftHours: string;
  networkIp: string;
  networkStatus: "Active" | "Offline";
  benchStatus: "Calibrated & Ready" | "Bench Hold" | "Maintenance";
  metrics: WorkbenchMetrics;
  activeMatTicket: ActiveMatTicket;
  assignedTickets: RepairTicket[];
  rigDevices: RigDevice[];
  recentActivities: BenchActivityItem[];
  scratchpadNote: string;
}

