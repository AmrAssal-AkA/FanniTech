export type TechnicianStatus = "active" | "break" | "off_duty";

export interface ActiveTicketInfo {
  ticketNumber: string;
  priority: "VIP URGENT" | "URGENT" | "IN PROGRESS" | "NORMAL";
  deviceModel: string;
  defectDescription: string;
  elapsedTime: string;
  estimatedRemainingTime?: string;
  stageNote?: string;
}

export interface TechnicianSummaryMetrics {
  activeOnShift: number;
  totalSpecialists: number;
  occupancyRate: number;
  activeBays: number;
  totalBays: number;
  activeTicketsCount: number;
  avgTicketsPerTech: number;
  urgentTicketsCount: number;
  avgTurnaroundHours: number;
  targetTurnaroundHours: number;
  slaPassRate: number;
}

export interface TechnicianProfile {
  id: string;
  techId: string;
  name: string;
  arabicName: string;
  role: "Lead Tech" | "Specialist" | "Junior Tech" | "Senior Supervisor";
  bayNumber: string;
  bayName: string;
  avatarUrl?: string;
  status: TechnicianStatus;
  statusLabel: string;
  shift: string;
  specialization: string;
  subSpecialization?: string;
  activeTicket?: ActiveTicketInfo;
  benchQueueCount: number;
  queueDetails?: string;
  todayCompletedCount: number;
  todayTargetOrAvg?: string;
  qaPassRate: string;
  qaPassNote?: string;
  esdMatReading: string;
  esdCalibratedTime: string;
  pausedBenchReason?: string;
  returnTime?: string;
  certifications?: string[];
}

export interface BayTopologyItem {
  bayId: string;
  bayNumber: string;
  label: string;
  assignedTechnician?: string;
  specialtyOrUnit: string;
  status: "active" | "break" | "standby" | "calibration" | "free";
  statusColor?: string;
  isMain?: boolean;
  isCritical?: boolean;
}

export interface PendingIntakeItem {
  id: string;
  requestCode: string;
  categoryTag: string;
  deviceTitle: string;
  defectDetails: string;
  intakeTimeAgo: string;
  recommendedTechnician: string;
  recommendedBay: string;
}

export interface LabSafetyComplianceMetric {
  id: string;
  title: string;
  statusText: string;
  isPassed: boolean;
  highlight?: boolean;
}

export interface CreateTechnicianAccountPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "TECHNICIAN";
}

export interface BackendCreatedTechnician {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  technician: {
    id: string;
    employeeId: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CreateTechnicianApiResponse {
  success: boolean;
  message?: string;
  data?: BackendCreatedTechnician;
}

export interface BackendTechnicianItem {
  id: string;
  employeeId?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
  technician?: {
    id: string;
    employeeId: string;
    createdAt?: string;
    updatedAt?: string;
  };
  repairTickets?: Array<{
    id: string;
    status: string;
  }>;
}

export interface GetListTechniciansApiResponse {
  success: boolean;
  message?: string;
  technicians?: BackendTechnicianItem[];
  data?: BackendTechnicianItem[];
  total?: number;
}

export interface DetailedTechnicianTicket {
  id: string;
  ticketNumber: string;
  priority: string;
  status: string;
  diagnosis?: string | null;
  repairNotes?: string | null;
  createdAt: string;
  completedAt?: string | null;
  request?: {
    id: string;
    problem: string;
    description: string;
    device?: {
      id: string;
      deviceType: string;
      brand: string;
      model: string;
      serialNumber?: string | null;
      customer?: {
        userId: string;
        user?: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
        };
      };
    };
  };
}

export interface DetailedTechnicianData {
  id: string;
  employeeId: string;
  createdAt?: string;
  updatedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    createdAt?: string;
    updatedAt?: string;
  };
  repairTickets: DetailedTechnicianTicket[];
  stats: {
    totalTickets: number;
    activeTicketsCount: number;
    completedTicketsCount: number;
  };
}

export interface DetailedTechnicianApiResponse {
  success: boolean;
  message?: string;
  data?: DetailedTechnicianData;
  technician?: DetailedTechnicianData;
}

export interface UpdateTechnicianPayload {
  name?: string;
  email?: string;
  phone?: string | null;
}

export interface UpdateTechnicianApiResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };
}

export interface ResetTechnicianPasswordPayload {
  password: string;
}

export interface ResetTechnicianPasswordApiResponse {
  success: boolean;
  message: string;
}

export interface DeleteTechnicianApiResponse {
  success: boolean;
  message: string;
}

export interface TransferTechnicianTicketsPayload {
  targetTechnicianId: string;
}

export interface TransferTechnicianTicketsApiResponse {
  success: boolean;
  message: string;
  transferredCount?: number;
}

const SPECIALIZATIONS_ROSTER = [
  "SMD / Micro-Soldering",
  "Retina Panel & Fluid",
  "BGA Reballing Specialist",
  "Firmware / SPI ROM & Triage",
  "Peripherals, Keyboards & Battery Modules",
];

const ROLES_ROSTER: Array<TechnicianProfile["role"]> = [
  "Lead Tech",
  "Specialist",
  "Specialist",
  "Specialist",
  "Junior Tech",
];

export function adaptBackendTechnicianToProfile(
  raw: BackendTechnicianItem,
  index: number
): TechnicianProfile {
  const id = raw.technician?.id ?? raw.id;
  const techId =
    raw.technician?.employeeId ??
    raw.employeeId ??
    `TECH-${String(index + 1).padStart(3, "0")}`;
  const name = raw.user?.name ?? raw.name ?? "Technician";
  const arabicName = raw.user?.name ?? raw.name ?? "فني معتمد";
  const role = ROLES_ROSTER[index % ROLES_ROSTER.length];
  const bayNum = (index % 8) + 1;
  const bayNumStr = String(bayNum).padStart(2, "0");
  const bayName = `Bay #${bayNumStr}`;
  const specialization =
    SPECIALIZATIONS_ROSTER[index % SPECIALIZATIONS_ROSTER.length];

  const closedStatuses = new Set(["COMPLETED", "UNREPAIRABLE", "CANCELLED"]);
  const tickets = Array.isArray(raw.repairTickets) ? raw.repairTickets : [];
  const activeTickets = tickets.filter(
    (t) => !closedStatuses.has((t.status || "").toUpperCase())
  );
  const completedTickets = tickets.filter(
    (t) => (t.status || "").toUpperCase() === "COMPLETED"
  );

  let activeTicket: ActiveTicketInfo | undefined;
  if (activeTickets.length > 0) {
    const first = activeTickets[0] as {
      id: string;
      ticketNumber?: string;
      priority?: string;
      status?: string;
      deviceModel?: string;
      defectDescription?: string;
      request?: {
        problem?: string;
        device?: {
          brand?: string;
          model?: string;
        };
      };
    };

    const rawPriority = (first.priority || "NORMAL").toUpperCase();
    const priority: ActiveTicketInfo["priority"] =
      rawPriority === "HIGH" || rawPriority === "CRITICAL"
        ? "VIP URGENT"
        : rawPriority === "MEDIUM"
        ? "IN PROGRESS"
        : "NORMAL";

    const deviceModel =
      first.deviceModel ||
      (first.request?.device?.brand && first.request?.device?.model
        ? `${first.request.device.brand} ${first.request.device.model}`
        : first.request?.device?.model || "Component Unit");

    const defectDescription =
      first.defectDescription || first.request?.problem || "Bench Diagnostic in Progress";

    activeTicket = {
      ticketNumber: first.ticketNumber || `TK-${first.id.slice(0, 6).toUpperCase()}`,
      priority,
      deviceModel,
      defectDescription,
      elapsedTime: "Active",
      estimatedRemainingTime: "ETA ~2h",
      stageNote: first.status || "IN_REPAIR",
    };
  }

  const isActive = activeTickets.length > 0;
  const status: TechnicianStatus = isActive ? "active" : "off_duty";
  const statusLabel = isActive ? "ACTIVE ON BENCH" : "STANDBY / FREE";

  return {
    id,
    techId,
    name,
    arabicName,
    role,
    bayNumber: bayNumStr,
    bayName,
    status,
    statusLabel,
    shift: "Alpha (08:00 - 17:00)",
    specialization,
    activeTicket,
    benchQueueCount: activeTickets.length,
    todayCompletedCount: completedTickets.length,
    qaPassRate: "98.5%",
    esdMatReading: "0.58 MΩ",
    esdCalibratedTime: "08:15 AST",
  };
}

