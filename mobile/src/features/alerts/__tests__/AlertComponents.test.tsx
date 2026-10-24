import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  AlertHeader,
  AlertFilterTabs,
  AlertCard,
  AlertSectionGroup,
  AllCaughtUp,
} from '../components';
import { AlertItem } from '../types';

describe('Alert Screen Components', () => {
  it('renders AlertHeader with unread counter and handles mark all read', async () => {
    const handleMarkAll = jest.fn();
    await render(
      <AlertHeader unreadCount={2} onMarkAllRead={handleMarkAll} />
    );

    expect(screen.getByText('Alerts & Updates')).toBeTruthy();
    expect(screen.getByText('2 New')).toBeTruthy();
    expect(
      screen.getByText('Laboratory dispatches & live benchwork updates')
    ).toBeTruthy();

    const markAllBtn = screen.getByText('Mark all read');
    fireEvent.press(markAllBtn);
    expect(handleMarkAll).toHaveBeenCalledTimes(1);
  });

  it('renders AlertFilterTabs with counts and responds to filter click', async () => {
    const handleSelectFilter = jest.fn();
    await render(
      <AlertFilterTabs
        activeFilter="all"
        counts={{ all: 5, repairs: 3, devices: 2 }}
        onSelectFilter={handleSelectFilter}
      />
    );

    expect(screen.getByText('All (5)')).toBeTruthy();
    expect(screen.getByText('Repairs (3)')).toBeTruthy();
    expect(screen.getByText('Device Alerts (2)')).toBeTruthy();

    fireEvent.press(screen.getByText('Repairs (3)'));
    expect(handleSelectFilter).toHaveBeenCalledWith('repairs');
  });

  it('renders unread AlertCard with technician and action button', async () => {
    const mockAlert: AlertItem = {
      id: 'alert-1',
      category: 'repairs',
      type: 'diagnostic',
      referenceId: 'SR-1001',
      tag: 'Diagnostics',
      timeAgo: '15m ago',
      title: 'Diagnostics in Progress: VRM voltage drop detected',
      description:
        'VRM voltage drop isolated on Lenovo ThinkPad T14 mother-rail.',
      isUnread: true,
      section: 'today',
      technician: 'Tech Tariq M.',
      action: {
        label: 'View Ticket',
        type: 'ticket',
        target: 'SR-1001',
      },
    };

    const handlePress = jest.fn();
    const handleAction = jest.fn();

    await render(
      <AlertCard
        alert={mockAlert}
        onPress={handlePress}
        onActionPress={handleAction}
      />
    );

    expect(screen.getByText('SR-1001')).toBeTruthy();
    expect(screen.getByText('Diagnostics')).toBeTruthy();
    expect(screen.getByText('15m ago')).toBeTruthy();
    expect(
      screen.getByText('Diagnostics in Progress: VRM voltage drop detected')
    ).toBeTruthy();
    expect(screen.getByText('Tech Tariq M.')).toBeTruthy();
    expect(screen.getByText('View Ticket')).toBeTruthy();

    fireEvent.press(screen.getByText('View Ticket'));
    expect(handleAction).toHaveBeenCalledWith(mockAlert);
  });

  it('renders AlertSectionGroup and AllCaughtUp', async () => {
    const mockAlerts: AlertItem[] = [
      {
        id: 'alert-2',
        category: 'repairs',
        type: 'status',
        referenceId: 'REQ-8840',
        tag: 'Approved',
        timeAgo: '2h ago',
        title: 'Repair Request Accepted: Custom Rig',
        description: 'Your intake form was reviewed and accepted.',
        isUnread: false,
        section: 'today',
      },
    ];

    await render(
      <>
        <AlertSectionGroup
          title="Today"
          badge="1 Active Update"
          alerts={mockAlerts}
          onAlertPress={jest.fn()}
        />
        <AllCaughtUp />
      </>
    );

    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('1 Active Update')).toBeTruthy();
    expect(screen.getByText('Repair Request Accepted: Custom Rig')).toBeTruthy();
    expect(screen.getByText('All Caught Up')).toBeTruthy();
    expect(
      screen.getByText('Live bench synchronization active')
    ).toBeTruthy();
  });
});
