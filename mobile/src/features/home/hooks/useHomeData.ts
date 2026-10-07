import { useState, useCallback } from 'react';
import {
  ActiveRepairTicket,
  RegisteredDevice,
  RecentActivityItem,
} from '../types';
import { useAuthSession } from '../../auth/session/AuthSession';

const INITIAL_ACTIVE_TICKET: ActiveRepairTicket = {
  id: 'ticket-1001',
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

const INITIAL_DEVICES: RegisteredDevice[] = [
  {
    id: 'dev-1',
    name: 'ThinkPad T14',
    model: 'Lenovo ThinkPad T14 Gen 2',
    type: 'laptop_windows',
    status: 'IN_SERVICE',
    statusLabel: 'In Service',
    activeTicketNumber: 'SR-1001',
  },
  {
    id: 'dev-2',
    name: 'MacBook Air M2',
    model: 'Apple MacBook Air M2 (2022)',
    type: 'laptop_mac',
    status: 'HEALTHY',
    statusLabel: 'Healthy',
  },
];

const INITIAL_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    requestNumber: 'REQ-8821',
    deviceModel: 'Dell XPS 15',
    issueDescription: 'Fan noise & overheating',
    date: 'Oct 24, 2023',
    status: 'ACCEPTED',
    statusLabel: 'ACCEPTED',
  },
  {
    id: 'act-2',
    requestNumber: 'REQ-8740',
    deviceModel: 'HP Pavilion 14',
    issueDescription: 'Screen flickering',
    date: 'Oct 22, 2023',
    status: 'PENDING',
    statusLabel: 'PENDING',
  },
];

export const useHomeData = () => {
  const { user } = useAuthSession();
  const userName = user?.name.trim().split(/\s+/)[0] || 'there';
  const [isLabOnline] = useState(true);
  const [labHoursText] = useState('Open today until 7:00 PM');
  const [activeTicket, setActiveTicket] = useState<ActiveRepairTicket | null>(
    INITIAL_ACTIVE_TICKET
  );
  const [devices, setDevices] = useState<RegisteredDevice[]>(INITIAL_DEVICES);
  const [activities, setActivities] =
    useState<RecentActivityItem[]>(INITIAL_ACTIVITIES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshHomeData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate network refresh or TanStack query refetch
      await new Promise((resolve) => setTimeout(resolve, 800));
      setActiveTicket({ ...INITIAL_ACTIVE_TICKET });
      setDevices([...INITIAL_DEVICES]);
      setActivities([...INITIAL_ACTIVITIES]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    userName,
    isLabOnline,
    labHoursText,
    activeTicket,
    devices,
    activities,
    isRefreshing,
    refreshHomeData,
  };
};
