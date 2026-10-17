import { appClient } from "@/lib/appClient";
import type { ListTicketsResponse, RepairTicket } from "@/types/tickets";
import type { TechnicianDashboardData } from "@/types/technicianDashboard";

export const initialTechnicianDashboardData: TechnicianDashboardData = {
  technicianName: "Ahmed Zaki",
  technicianRole: "Lead Tech · Micro-Soldering & Board Diagnostics",
  bayNumber: "Bay #04",
  calibrationId: "CAL-ID: FT-HW-8892",
  shiftHours: "Shift 08:00 - 17:30 AST",
  networkIp: "192.168.1.14",
  networkStatus: "Active",
  benchStatus: "Calibrated & Ready",
  metrics: {
    activeQueueCount: 3,
    criticalUrgentCount: 1,
    underDiagnosisCount: 1,
    readyForQACount: 1,
    completedTodayCount: 4,
    passRatePercentage: 100,
    aheadOfTargetCount: 1,
    avgDiagnosticMinutes: 34,
    slaTargetMinutes: 45,
  },
  activeMatTicket: {
    ticketNumber: "TCK-2042",
    deviceTitle: "Lenovo ThinkPad T14 Gen 2",
    processorSpec: "Intel Core i7-1185G7 · 16GB RAM · Iris Xe",
    clientAccount: "ACCT-8891",
    clientName: "Hassan Nader",
    clientContact: "+966 50 491 8820",
    clientBranch: "Al-Khobar Branch",
    intakeDefect:
      'Complete no power state. Unit shut off suddenly after docking station thunder surge. Indicator LED dark, does not respond to Type-C 65W PD charger.',
    serialNumber: "PF-2X9L91",
    intakeSlaDue: "5:00 PM Today",
    motherboardModel: "NM-D351 Rev 1.0",
    rails: [
      {
        label: "V_IN Main Rail",
        value: "0.02 Ω (GND)",
        status: "Dead Short",
        isError: true,
      },
      {
        label: "3.3V / 5V ALW",
        value: "14.8 kΩ",
        status: "Normal Hi-Z",
      },
      {
        label: "VCC_CORE",
        value: "3.4 Ω",
        status: "Within Spec",
      },
    ],
    thermal: {
      componentName: "PQ301 (AON6414A)",
      temperature: "78.4°C @ 1.2V 1.8A",
      injectionSpec: "Bench Injection Hotspot",
      partReady: true,
      partNumber: "MOSFET P/N Ready",
    },
    currentStep: 2,
    stages: [
      {
        stepNumber: 1,
        title: "Intake & Visual Audit",
        subtitle: "08:45 AM Passed",
        status: "completed",
      },
      {
        stepNumber: 2,
        title: "Micro-Soldering Diagnosis",
        subtitle: "In Progress (Bay #04)",
        status: "active",
      },
      {
        stepNumber: 3,
        title: "Component Replacement",
        subtitle: "Pending PQ301 swap",
        status: "pending",
      },
      {
        stepNumber: 4,
        title: "Burn-in Stress & QC Pass",
        subtitle: "60-min stability test",
        status: "pending",
      },
    ],
    elapsedSeconds: 45 * 60 + 18,
    isPaused: false,
  },
  assignedTickets: [
    {
      id: "tck-2042",
      ticketNumber: "TCK-2042",
      requestId: "req-8891",
      technicianId: "tech-01",
      priority: "HIGH",
      status: "DIAGNOSING",
      diagnosis: "Dead motherboard / Short on primary 19V rail PQ301. Dock power surge.",
      repairNotes: "Motherboard: NM-D351 Rev 1.0. Est 1.5 hrs labor. Part in Bay Storage (x4).",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      request: {
        id: "req-8891",
        problem: "Complete no power state after power surge",
        description: "Dead motherboard / Short on primary 19V rail PQ301. Dock power surge.",
        status: "IN_PROGRESS",
        createdAt: new Date().toISOString(),
        device: {
          id: "dev-2042",
          deviceType: "Laptop",
          brand: "Lenovo",
          model: "ThinkPad T14 Gen 2 (Intel i7-1185G7)",
          serialNumber: "PF-2X9L91",
          customer: {
            user: {
              id: "cust-01",
              name: "Hassan Nader",
              email: "hassan.nader@example.com",
              phone: "+966 50 491 8820",
            },
            notes: "VIP Corporate · Al-Khobar Main Branch",
          },
        },
        images: [],
      },
      technician: {
        id: "tech-01",
        employeeId: "FT-TECH-04",
        user: {
          id: "u-01",
          name: "Ahmed Zaki",
          email: "ahmed.zaki@fannitech.com",
          phone: "+966 50 123 4567",
        },
      },
    },
    {
      id: "tck-2038",
      ticketNumber: "TCK-2038",
      requestId: "req-8892",
      technicianId: "tech-01",
      priority: "HIGH",
      status: "IN_REPAIR",
      diagnosis: "GPU Thermal throttling under load (94°C) + VRM thermal pad breakdown & fan bearing vibration.",
      repairNotes: "Honeywell PTM7950 applied. Delta Dual Fan Assm issued. Vapor Chamber torqued.",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      request: {
        id: "req-8892",
        problem: "Thermal throttling and fan noise",
        description: "GPU Thermal throttling under load (94°C) + VRM thermal pad breakdown & fan bearing vibration.",
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        device: {
          id: "dev-2038",
          deviceType: "Laptop",
          brand: "ASUS",
          model: "ROG Zephyrus G14 (Ryzen 9 5900HS · RTX 3060)",
          serialNumber: "GA401QM-9912",
          customer: {
            user: {
              id: "cust-02",
              name: "Zaid Al-Ghamdi",
              email: "zaid.ghamdi@example.com",
              phone: "+966 54 819 0041",
            },
            notes: "Job: Thermal Repaste + K5 Pro Putty",
          },
        },
        images: [],
      },
      technician: {
        id: "tech-01",
        user: {
          id: "u-01",
          name: "Ahmed Zaki",
          email: "ahmed.zaki@fannitech.com",
          phone: "+966 50 123 4567",
        },
      },
    },
    {
      id: "tck-2045",
      ticketNumber: "TCK-2045",
      requestId: "req-8893",
      technicianId: "tech-01",
      priority: "MEDIUM",
      status: "ACCEPTED",
      diagnosis: "Liquid splash (sweet coffee) on bottom keyboard deck. Spacebar and trackpad clicking sticky. Unit boots.",
      repairNotes: "Board Model: 820-02098-A. Corrosion Risk: Moderate. Ultrasonic Bath: Scheduled Tank #02.",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      request: {
        id: "req-8893",
        problem: "Coffee liquid splash on keyboard",
        description: "Liquid splash (sweet coffee) on bottom keyboard deck. Spacebar and trackpad clicking sticky. Unit boots.",
        status: "PENDING",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        device: {
          id: "dev-2045",
          deviceType: "Laptop",
          brand: "Apple",
          model: 'MacBook Pro 14" (2021) M1 Pro Space Gray',
          serialNumber: "C02G901ZMD6R",
          customer: {
            user: {
              id: "cust-03",
              name: "Mona Al-Saleh",
              email: "mona.saleh@example.com",
              phone: "+966 56 112 3998",
            },
            notes: "Requires battery isolation prior to board teardown",
          },
        },
        images: [],
      },
      technician: {
        id: "tech-01",
        user: {
          id: "u-01",
          name: "Ahmed Zaki",
          email: "ahmed.zaki@fannitech.com",
          phone: "+966 50 123 4567",
        },
      },
    },
  ],
  rigDevices: [
    {
      name: "Hakko FX-951",
      spec: "Tip: T12-BC2 · Standby",
      value: "380°C",
      statusLabel: "ONLINE",
      isOnline: true,
    },
    {
      name: "Rigol DS1054Z",
      spec: "USB CH1: Active 100MHz",
      value: "Connected",
      statusLabel: "LINKED",
      isOnline: true,
    },
    {
      name: "FLIR ETS320 Bench",
      spec: "320x240 Sensor IR",
      value: "78.4°C Peak",
      statusLabel: "LIVE STREAM",
      isOnline: true,
    },
  ],
  recentActivities: [
    {
      id: "act-1",
      time: "11:50",
      type: "primary",
      headline: "Component replacement logged",
      ticketNumber: "TCK-2042",
      detail: "Reserved PQ301 (AON6414A) from Bin #B-14",
    },
    {
      id: "act-2",
      time: "10:45",
      type: "tertiary",
      headline: "Thermal re-paste finished",
      ticketNumber: "TCK-2038",
      detail: "Applied PTM7950 phase-change material",
    },
    {
      id: "act-3",
      time: "09:15",
      type: "neutral",
      headline: "Ticket TCK-2042 assigned by Dispatch",
      ticketNumber: "TCK-2042",
      detail: "Tariq Al-Mansoor assigned priority ticket to Bay #04",
    },
    {
      id: "act-4",
      time: "08:10",
      type: "success",
      headline: "Morning Bench Calibration Verified",
      detail: "Grounding ESD mat: < 1.0 MΩ (Passed)",
    },
  ],
  scratchpadNote:
    "Lenovo T14 VIN short confirmed on PQ301. Need to test driver gate before powering full 65W rail. Zephyrus G14 is ready for 30-min FurMark stress test.",
};

export const fetchTechnicianDashboardData = async (): Promise<TechnicianDashboardData> => {
  try {
    const res = await appClient.get<ListTicketsResponse>("/api/tickets", {
      params: { assignedToMe: true, limit: 20 },
    });

    const liveTickets = res.data?.items;
    if (liveTickets && liveTickets.length > 0) {
      const diagnosingCount = liveTickets.filter((t) => t.status === "DIAGNOSING").length;
      const inRepairCount = liveTickets.filter((t) => t.status === "IN_REPAIR").length;
      const readyQACount = liveTickets.filter((t) => t.status === "READY_FOR_PICKUP").length;
      const completedCount = liveTickets.filter((t) => t.status === "COMPLETED").length;
      const criticalCount = liveTickets.filter((t) => t.priority === "HIGH").length;

      return {
        ...initialTechnicianDashboardData,
        assignedTickets: liveTickets,
        metrics: {
          ...initialTechnicianDashboardData.metrics,
          activeQueueCount: liveTickets.length,
          criticalUrgentCount: criticalCount || initialTechnicianDashboardData.metrics.criticalUrgentCount,
          underDiagnosisCount: diagnosingCount || initialTechnicianDashboardData.metrics.underDiagnosisCount,
          readyForQACount: readyQACount || initialTechnicianDashboardData.metrics.readyForQACount,
          completedTodayCount: completedCount || initialTechnicianDashboardData.metrics.completedTodayCount,
        },
      };
    }

    return initialTechnicianDashboardData;
  } catch {
    // Graceful fallback to initial workbench telemetry
    return initialTechnicianDashboardData;
  }
};

