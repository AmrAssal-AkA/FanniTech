
export type CustomerFilterCategory = "all" | "corp" | "active";

export interface BackendCustomerListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  devicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponseData {
  items: BackendCustomerListItem[];
  pagination: CustomerPagination;
}

export interface GetCustomersApiResponse {
  success: boolean;
  data?: CustomerListResponseData;
  message?: string;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerDevice {
  id: string;
  model: string;
  serialNumber: string;
  specs?: string;
  type: string;
  status: "In Lab" | "With Client" | "Intake Queue" | "Ready Pickup";
  bay?: string;
  activeTicket?: string;
  lastServiced?: string;
}

export interface CustomerRepairHistoryItem {
  id: string;
  ticketNumber: string;
  status: "Diagnosing" | "Repairing" | "In-Repair" | "Ready Pickup" | "Resolved" | "Intake";
  date: string;
  problem: string;
  technician: string;
  bayOrQueue?: string;
  totalCost?: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  memberSince: string;
  notes: string;
  activeTicket?: string;
  activeTicketBay?: string;
  assignedTechnician?: string;
  totalRepairs: number;
  devices: CustomerDevice[];
  repairHistory: CustomerRepairHistoryItem[];
  devicesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummaryMetrics {
  totalAccounts: number;
  newThisMonth: number;
  activeLabUnits: number;
  benchesCount: number;
  awaitingPartsCount: number;
  activeOwnersCount: number;
  catalogedHardware: number;
  hardwarePerClientAvg: number;
  serialTiedPercent: number;
  repeatClientRatio: number;
  repeatClientsCount: number;
}
