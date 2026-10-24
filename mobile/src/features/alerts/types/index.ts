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
  referenceId: string; 
  tag: string;
  timeAgo: string;
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
