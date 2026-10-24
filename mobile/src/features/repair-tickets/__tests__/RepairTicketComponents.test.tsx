import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react-native';
import {
  TicketHeader,
  TicketMetaHeader,
  DiagnosticHeroCard,
  DeviceSummaryCard,
  RepairTimelineStepper,
  BenchDiagnosticFeedCard,
  TechnicianAuditLogCard,
  TicketActionButtons,
  ToastNotificationPill,
} from '../components';
import { RepairTicketDetail } from '../types';

const mockTicketDetail: RepairTicketDetail = {
  id: 'ticket-1001',
  ticketNumber: 'SR-1001',
  requestNumber: 'REQ-8804',
  requestId: 'req-8804',
  status: 'DIAGNOSING',
  priority: 'HIGH',
  statusDescription:
    'Our certified hardware technician is currently running diagnostics on the power delivery and motherboard components.',
  currentStage: 2,
  totalStages: 5,
  device: {
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    deviceType: 'WORKSTATION',
    serialNumber: 'PF-2X99L1',
    categoryLabel: 'WORKSTATION',
    specs: ['Core i7-1165G7', '16GB DDR4', '512GB NVMe'],
  },
  problem: 'Laptop randomly shuts down after 15 minutes of use.',
  description:
    '“The laptop stopped working reliably after charging with a third-party adapter. Turns off under load.”',
  diagnosis:
    'Diagnostic power rails check showed voltage drop on primary VRM circuit. Testing heatsink thermal paste and power controller MOSFETs.',
  repairNotes: null,
  diagnosticFeed: {
    imageUrl: 'https://example.com/bench.jpg',
    caption: 'Thermal signature scan: VRM area 84°C',
    badge: 'CH-02',
  },
  auditLogs: [
    {
      id: 'log-1',
      author: 'Tech Tariq',
      role: 'Master L3 Tech',
      initial: 'T',
      timestamp: '11:45 AM',
      content:
        'Diagnostic power rails check showed voltage drop on primary VRM circuit. Testing heatsink thermal paste and power controller MOSFETs.',
      isMaster: true,
    },
    {
      id: 'log-2',
      author: 'Front Desk',
      role: 'Intake',
      initial: 'F',
      timestamp: '09:30 AM',
      content:
        'Device received at reception desk, physical inspection completed without external cosmetic damage. Serial verified.',
      isMaster: false,
    },
  ],
  timeline: [
    {
      key: 'ACCEPTED',
      stepNumber: 1,
      title: '1. ACCEPTED',
      timestamp: '09:15 AM',
      description: 'Repair request approved and device checked in at center.',
      status: 'completed',
    },
    {
      key: 'DIAGNOSING',
      stepNumber: 2,
      title: '2. DIAGNOSING',
      timestamp: '11:30 AM',
      description: 'Hardware stress testing and thermals inspection in progress.',
      stationNote: 'Bench Station #4 • Diagnostics Matrix Active',
      status: 'active',
    },
    {
      key: 'IN_REPAIR',
      stepNumber: 3,
      title: '3. IN_REPAIR',
      timestamp: 'Pending',
      description: 'Component repair or part replacement.',
      status: 'pending',
    },
    {
      key: 'READY_FOR_PICKUP',
      stepNumber: 4,
      title: '4. READY_FOR_PICKUP',
      timestamp: 'Upcoming',
      description: 'Customer notification sent for collection.',
      status: 'pending',
    },
    {
      key: 'COMPLETED',
      stepNumber: 5,
      title: '5. COMPLETED',
      timestamp: 'Upcoming',
      description: 'Device handed over and verified.',
      status: 'pending',
    },
  ],
  technician: {
    name: 'Tech Tariq',
    roleTitle: 'Master L3 Tech',
    phone: '+966 50 123 4567',
  },
  hubInfo: {
    name: 'FanniTech Central Hub',
    address: 'Al-Olaya St, Riyadh',
    operatingHours: '9:00 AM – 9:00 PM (Sat - Thu)',
    distanceText: '1.8 km from your registered office',
    phone: '+966 11 456 7890',
  },
  createdAt: '2026-10-25T06:15:00.000Z',
  updatedAt: '2026-10-25T08:45:00.000Z',
};

describe('Repair Ticket Components', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders TicketHeader with title and back action', async () => {
    const onBack = jest.fn();
    await render(<TicketHeader onBack={onBack} title="Repair Detail" />);

    expect(screen.getByText('Repair Detail')).toBeTruthy();
    const backBtn = screen.getByLabelText('Go back');
    fireEvent.press(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders TicketMetaHeader with ticket number and live tracking badge', async () => {
    const onCopy = jest.fn();
    await render(
      <TicketMetaHeader
        ticketNumber="SR-1001"
        requestNumber="REQ-8804"
        isLiveConnected={true}
        onCopyTicket={onCopy}
      />
    );

    expect(screen.getByText('Ref: REQ-8804')).toBeTruthy();
    expect(screen.getByText('LIVE TRACKING')).toBeTruthy();
    expect(screen.getByText('Ticket #SR-1001')).toBeTruthy();

    const copyBtn = screen.getByLabelText('Copy ticket number');
    fireEvent.press(copyBtn);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('renders TicketMetaHeader with CONNECTING badge when offline or connecting', async () => {
    await render(
      <TicketMetaHeader
        ticketNumber="SR-1001"
        isLiveConnected={false}
        onCopyTicket={jest.fn()}
      />
    );

    expect(screen.getByText('CONNECTING')).toBeTruthy();
  });

  it('renders DiagnosticHeroCard with status, diagnosis description, and dynamic stage progress', async () => {
    await render(
      <DiagnosticHeroCard
        status={mockTicketDetail.status}
        statusDescription={mockTicketDetail.statusDescription}
      />
    );

    expect(screen.getByText('CURRENT STATUS: DIAGNOSING')).toBeTruthy();
    expect(
      screen.getByText(mockTicketDetail.statusDescription)
    ).toBeTruthy();
    expect(screen.getByText('Stage 2 of 5 • Hardware Diagnostics')).toBeTruthy();
    expect(screen.getByText('40%')).toBeTruthy();
  });

  it('renders DiagnosticHeroCard with COMPLETED status and 100% progress', async () => {
    await render(
      <DiagnosticHeroCard
        status="COMPLETED"
        statusDescription="All repair operations completed successfully. Device handed over."
      />
    );

    expect(screen.getByText('CURRENT STATUS: COMPLETED')).toBeTruthy();
    expect(screen.getByText('All 5 Stages Completed • 100%')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('renders DeviceSummaryCard with device model, issue, and specs', async () => {
    await render(
      <DeviceSummaryCard
        device={mockTicketDetail.device}
        problem={mockTicketDetail.problem}
        description={mockTicketDetail.description}
      />
    );

    expect(screen.getByText('Lenovo ThinkPad T14')).toBeTruthy();
    expect(screen.getByText('WORKSTATION')).toBeTruthy();
    expect(screen.getByText(/Laptop randomly shuts down/)).toBeTruthy();
    expect(screen.getByText('Core i7-1165G7')).toBeTruthy();
    expect(screen.getByText('16GB DDR4')).toBeTruthy();
    expect(screen.getByText('512GB NVMe')).toBeTruthy();
  });

  it('renders RepairTimelineStepper with 5 stages and active diagnosing stage', async () => {
    await render(
      <RepairTimelineStepper
        timeline={mockTicketDetail.timeline}
        currentStage={2}
        totalStages={5}
      />
    );

    expect(screen.getByText('Repair Timeline')).toBeTruthy();
    expect(screen.getByText('Step 2 of 5')).toBeTruthy();
    expect(screen.getByText('1. ACCEPTED')).toBeTruthy();
    expect(screen.getByText('2. DIAGNOSING')).toBeTruthy();
    expect(screen.getByText('3. IN_REPAIR')).toBeTruthy();
    expect(screen.getByText('4. READY_FOR_PICKUP')).toBeTruthy();
    expect(screen.getByText('5. COMPLETED')).toBeTruthy();
    expect(
      screen.getByText('Bench Station #4 • Diagnostics Matrix Active')
    ).toBeTruthy();
  });

  it('renders BenchDiagnosticFeedCard with caption and channel badge', async () => {
    await render(
      <BenchDiagnosticFeedCard feed={mockTicketDetail.diagnosticFeed} />
    );

    expect(screen.getByText('Bench Diagnostic Feed')).toBeTruthy();
    expect(screen.getByText('Captured by Tech')).toBeTruthy();
    expect(
      screen.getByText('Thermal signature scan: VRM area 84°C')
    ).toBeTruthy();
    expect(screen.getByText('CH-02')).toBeTruthy();
  });

  it('renders TechnicianAuditLogCard with log entries', async () => {
    await render(<TechnicianAuditLogCard logs={mockTicketDetail.auditLogs} />);

    expect(screen.getByText('Technician Audit Log')).toBeTruthy();
    expect(screen.getByText('Tech Tariq')).toBeTruthy();
    expect(screen.getByText('Master L3 Tech')).toBeTruthy();
    expect(screen.getByText('Front Desk')).toBeTruthy();
    expect(screen.getByText('Intake')).toBeTruthy();
  });

  it('renders TicketActionButtons and handles call press', async () => {
    const onCall = jest.fn();
    const onMessage = jest.fn();
    await render(<TicketActionButtons onCall={onCall} onMessage={onMessage} />);

    const callBtn = screen.getByLabelText('Call service hub');
    fireEvent.press(callBtn);
    expect(onCall).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText('FanniTech Surgical Hardware Care Guarantee')
    ).toBeTruthy();
  });

  it('renders ToastNotificationPill when visible', async () => {
    await render(
      <ToastNotificationPill
        visible={true}
        message="Ticket ID copied to clipboard"
      />
    );

    expect(screen.getByText('Ticket ID copied to clipboard')).toBeTruthy();
  });

  it('returns null for ToastNotificationPill when not visible', async () => {
    await render(
      <ToastNotificationPill
        visible={false}
        message="Hidden message"
      />
    );

    expect(screen.queryByText('Hidden message')).toBeNull();
  });
});
