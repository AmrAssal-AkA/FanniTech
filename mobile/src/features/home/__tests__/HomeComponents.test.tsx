import React from 'react';
import { render, screen } from '@testing-library/react-native';
import {
  LabStatusHeader,
  ActiveRepairCard,
  QuickActionButtons,
  RegisteredDevicesSection,
  RecentActivitySection,
  LaboratoryStandardsCard,
} from '../components';
import {
  ActiveRepairTicket,
  RegisteredDevice,
  RecentActivityItem,
} from '../types';

describe('Home Screen Components', () => {
  it('renders LabStatusHeader with user name and lab hours', async () => {
    await render(
      <LabStatusHeader
        userName="Sarah"
        isLabOnline={true}
        labHoursText="Open today until 7:00 PM"
      />
    );
    expect(screen.getByText('Welcome back, Sarah')).toBeTruthy();
    expect(screen.getByText('Lab Online')).toBeTruthy();
    expect(screen.getByText('Open today until 7:00 PM')).toBeTruthy();
  });

  it('renders ActiveRepairCard with ticket details and 5 stages', async () => {
    const mockTicket: ActiveRepairTicket = {
      id: 'ticket-1',
      ticketNumber: 'SR-1001',
      deviceModel: 'Lenovo ThinkPad T14',
      reportedIssue: 'Laptop randomly shuts down after 15 minutes of use.',
      status: 'DIAGNOSING',
      statusLabel: 'DIAGNOSING',
      priorityLabel: 'Priority Workstation',
      currentStage: 2,
      estimatedDiagnosisTime: 'Today, 4:30 PM',
      assignedTechnician: 'Lead Tech Tariq',
    };

    await render(<ActiveRepairCard ticket={mockTicket} />);
    expect(screen.getByText('#SR-1001')).toBeTruthy();
    expect(screen.getByText('Priority Workstation')).toBeTruthy();
    expect(screen.getByText('DIAGNOSING')).toBeTruthy();
    expect(screen.getByText('Lenovo ThinkPad T14')).toBeTruthy();
    expect(screen.getByText('Lead Tech Tariq')).toBeTruthy();
    expect(screen.getByText('View Ticket Details')).toBeTruthy();
  });

  it('renders ActiveRepairCard when repair is completed (stage 5)', async () => {
    const mockCompletedTicket: ActiveRepairTicket = {
      id: 'ticket-2',
      ticketNumber: 'SR-1002',
      deviceModel: 'MacBook Pro 16',
      reportedIssue: 'Battery replacement completed',
      status: 'COMPLETED',
      statusLabel: 'COMPLETED',
      priorityLabel: 'Normal Priority',
      currentStage: 5,
      estimatedDiagnosisTime: 'Completed',
      assignedTechnician: 'Tech Salim',
    };

    await render(<ActiveRepairCard ticket={mockCompletedTicket} />);
    expect(screen.getByText('#SR-1002')).toBeTruthy();
    expect(screen.getByText('COMPLETED')).toBeTruthy();
    expect(screen.getByText('MacBook Pro 16')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('renders QuickActionButtons', async () => {
    await render(<QuickActionButtons />);
    expect(screen.getByText('Submit Repair')).toBeTruthy();
    expect(screen.getByText('Add New Device')).toBeTruthy();
  });

  it('renders RegisteredDevicesSection with device items', async () => {
    const devices: RegisteredDevice[] = [
      {
        id: '1',
        name: 'ThinkPad T14',
        model: 'Lenovo ThinkPad',
        type: 'laptop_windows',
        status: 'IN_SERVICE',
        statusLabel: 'In Service',
        activeTicketNumber: 'SR-1001',
      },
    ];

    await render(<RegisteredDevicesSection devices={devices} />);
    expect(screen.getByText('My Registered Devices')).toBeTruthy();
    expect(screen.getByText('ThinkPad T14')).toBeTruthy();
    expect(screen.getByText('Ticket SR-1001')).toBeTruthy();
  });

  it('renders RegisteredDevicesSection empty state when no devices are registered', async () => {
    await render(<RegisteredDevicesSection devices={[]} onAddNewDevice={jest.fn()} />);
    expect(screen.getByText('No Registered Devices')).toBeTruthy();
    expect(screen.getByText('+ Register Device')).toBeTruthy();
  });

  it('renders RecentActivitySection with activity items', async () => {
    const activities: RecentActivityItem[] = [
      {
        id: '1',
        requestNumber: 'REQ-8821',
        deviceModel: 'Dell XPS 15',
        issueDescription: 'Fan noise & overheating',
        date: 'Oct 24, 2023',
        status: 'ACCEPTED',
        statusLabel: 'ACCEPTED',
      },
    ];

    await render(<RecentActivitySection activities={activities} />);
    expect(screen.getByText('Recent Requests & Activity')).toBeTruthy();
    expect(screen.getByText('#REQ-8821')).toBeTruthy();
    expect(screen.getByText('Dell XPS 15')).toBeTruthy();
  });

  it('renders RecentActivitySection empty state when no activities exist', async () => {
    await render(<RecentActivitySection activities={[]} />);
    expect(screen.getByText('No Recent Activity')).toBeTruthy();
  });

  it('renders LaboratoryStandardsCard', async () => {
    await render(<LaboratoryStandardsCard />);
    expect(screen.getByText('Laboratory Rigor Standards')).toBeTruthy();
  });
});
