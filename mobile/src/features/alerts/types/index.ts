export type AlertCategory = 'all' | 'repairs' | 'devices';

export type AlertType = 'diagnostic' | 'intake' | 'security' | 'thermal' | 'status';

export interface AlertAction {
  label: string;
  type: 'ticket' | 'info';
  target?: string;
  infoDetails?: string;
}

export interface AlertItem {
  id: string;
  category: 'repairs' | 'devices';
  type: AlertType;
  referenceId: string; // e.g. "SR-1001", "REQ-8840", "ThinkPad T14", "Auth Audit"
  tag: string; // e.g. "Diagnostics", "Approved", "Intake", "Report", "Security"
  timeAgo: string; // e.g. "15m ago", "2h ago", "Oct 25, 09:15 AM", "Oct 24", "Oct 22"
  title: string;
  description: string;
  isUnread: boolean;
  section: 'today' | 'earlier';
  technician?: string;
  location?: string;
  action?: AlertAction;
}

export interface AlertFilterOption {
  id: AlertCategory;
  label: string;
}
