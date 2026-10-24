export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type RequestFilterTab = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type TicketPriority = "NORMAL" | "HIGH" | "CRITICAL";

export interface CustomerInfo {
  id: string;
  name: string; 
  phone: string;
  email: string;
  isVip?: boolean;
  repairHistoryCount: number;
}

export interface DeviceHardwareSpecs {
  model: string; 
  subModel?: string; 
  serialNumber: string; 
  deviceType: string; 
  color?: string; 
  includedAccessories?: string[]; 
}

export interface RequestPhoto {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface DetailedRepairRequest {
  id: string;
  customer: CustomerInfo;
  hardware: DeviceHardwareSpecs;
  problemCategory: "No Power" | "Liquid Damage" | "Thermal" | "Battery" | "Screen" | "Firmware / BIOS" | "Other";
  problemTitle: string; 
  problemDescription: string;
  attachedPhotos: RequestPhoto[];
  submittedAt: string;
  submittedDateISO: string;
  status: RequestStatus;
  rejectionReason?: string;
  convertedTicketId?: string;
  assignedTechnicianId?: string;
  priority?: TicketPriority;
}

export interface RequestsSummaryMetrics {
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  avgResponseTime: string; // e.g. "14 mins"
  appVersion: string; // e.g. "Live Sync (App v2.4.1)"
}

export interface TriageConversionPayload {
  requestId: string;
  assignedTechnicianId: string;
  priority: TicketPriority;
}

export interface RejectRequestPayload {
  requestId: string;
  reason: string;
  notifyCustomer?: boolean;
}

export interface TechnicianOption {
  id: string;
  name: string;
  employeeId?: string;
  role?: string;
  specialty?: string;
  email?: string;
  phone?: string | null;
  activeTicketsCount?: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendTechnicianResponse {
  id: string;
  employeeId?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
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
    createdAt: string;
    updatedAt: string;
  };
  repairTickets?: Array<{
    id: string;
    status: string;
  }>;
}

const CLOSED_TICKET_STATUSES = new Set([
  "COMPLETED",
  "UNREPAIRABLE",
  "CANCELLED",
]);

export function adaptBackendTechnicianToOption(
  raw: BackendTechnicianResponse,
): TechnicianOption {
  const id = raw.technician?.id ?? raw.id;
  const name = raw.user?.name ?? raw.name ?? "Technician";
  const email = raw.user?.email ?? raw.email;
  const phone = raw.user?.phone ?? raw.phone ?? null;
  const role = raw.user?.role ?? raw.role ?? "TECHNICIAN";
  const employeeId = raw.employeeId ?? raw.technician?.employeeId;
  const createdAt = raw.createdAt ?? raw.technician?.createdAt;
  const updatedAt = raw.updatedAt ?? raw.technician?.updatedAt;

  const activeTicketsCount = Array.isArray(raw.repairTickets)
    ? raw.repairTickets.filter(
        (t) => !CLOSED_TICKET_STATUSES.has((t.status || "").toUpperCase()),
      ).length
    : 0;

  return {
    id,
    name,
    employeeId,
    role,
    specialty: employeeId ? `Hardware Specialist (${employeeId})` : "Hardware Specialist",
    email,
    phone,
    activeTicketsCount,
    isAvailable: activeTicketsCount < 5,
    createdAt,
    updatedAt,
  };
}

export interface BackendRepairRequestImage {
  id: string;
  url: string;
  publicId?: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface BackendRepairRequest {
  id: string;
  deviceId: string;
  problem: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  images: BackendRepairRequestImage[];
  device: {
    id: string;
    deviceType: string;
    brand: string;
    model: string;
    serialNumber: string | null;
    customer: {
      user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
      };
      notes?: string | null;
    };
  };
  repairTicket?: {
    id: string;
    ticketNumber: string;
    status: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    technicianId: string | null;
  } | null;
}

export function adaptBackendRequestToDetailed(
  raw: BackendRepairRequest,
): DetailedRepairRequest {
  const catMap: Record<string, DetailedRepairRequest["problemCategory"]> = {
    power: "No Power",
    liquid: "Liquid Damage",
    thermal: "Thermal",
    battery: "Battery",
    screen: "Screen",
    bios: "Firmware / BIOS",
  };

  const probLower = (raw.problem || "").toLowerCase();
  let category: DetailedRepairRequest["problemCategory"] = "Other";
  for (const [key, val] of Object.entries(catMap)) {
    if (probLower.includes(key)) {
      category = val;
      break;
    }
  }

  const priorityMap: Record<string, TicketPriority> = {
    LOW: "NORMAL",
    MEDIUM: "NORMAL",
    HIGH: "HIGH",
  };

  const formattedDate = new Date(raw.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: raw.id,
    customer: {
      id: raw.device.customer.user.id,
      name: raw.device.customer.user.name,
      email: raw.device.customer.user.email,
      phone: raw.device.customer.user.phone || "+966 -- --- ----",
      repairHistoryCount: 0,
    },
    hardware: {
      model: `${raw.device.brand} ${raw.device.model}`.trim(),
      subModel: raw.device.model,
      serialNumber: raw.device.serialNumber || "N/A",
      deviceType: raw.device.deviceType,
      color: "Standard",
      includedAccessories: ["Device Main Unit"],
    },
    problemCategory: category,
    problemTitle: raw.problem,
    problemDescription: raw.description,
    attachedPhotos: (raw.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.fileName || "Device Photo",
      caption: img.fileName,
    })),
    submittedAt: formattedDate,
    submittedDateISO: raw.createdAt,
    status: raw.status,
    convertedTicketId: raw.repairTicket?.ticketNumber || undefined,
    assignedTechnicianId: raw.repairTicket?.technicianId || undefined,
    priority: raw.repairTicket?.priority
      ? priorityMap[raw.repairTicket.priority] || "NORMAL"
      : undefined,
  };
}

