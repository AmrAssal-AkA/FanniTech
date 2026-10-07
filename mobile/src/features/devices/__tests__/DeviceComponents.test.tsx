import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  DeviceCard,
  DeviceDetailsSheet,
  DevicesEmptyState,
  DevicesHeader,
  RegisterDeviceButton,
} from '../components';
import { CustomerDevice } from '../types';

const activeDevice: CustomerDevice = {
  id: 'dev-1',
  name: 'Lenovo ThinkPad T14',
  brand: 'Lenovo',
  model: 'ThinkPad T14',
  category: 'Laptop',
  serialNumber: 'PF-2X99L1',
  addedDate: 'March 14, 2023',
  locationLabel: 'Bench Rig 04',
  repairState: 'ACTIVE_REPAIR',
  repairStatusLabel: '1 Active Repair (#SR-1001)',
  serviceRecordLabel: '2 Completed, 1 Active',
  activeTicketNumber: 'SR-1001',
};

const healthyDevice: CustomerDevice = {
  id: 'dev-2',
  name: 'Apple MacBook Air M2',
  brand: 'Apple',
  model: 'MacBook Air M2',
  category: 'Laptop',
  serialNumber: 'C02G4591MD6R',
  addedDate: 'January 10, 2024',
  locationLabel: 'Ready',
  repairState: 'NO_REPAIRS',
  repairStatusLabel: 'No Active Repairs',
  serviceRecordLabel: '0 Total',
};

describe('Device Screen Components', () => {
  it('renders DevicesHeader with registered count', async () => {
    await render(<DevicesHeader registeredCount={3} />);

    expect(screen.getByText('My Devices')).toBeTruthy();
    expect(screen.getByText('3 Registered')).toBeTruthy();
  });

  it('renders RegisterDeviceButton and handles press', async () => {
    const handlePress = jest.fn();
    await render(<RegisterDeviceButton onPress={handlePress} />);

    fireEvent.press(screen.getByText('Register New Device'));
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('renders an active-repair DeviceCard and handles actions', async () => {
    const handleDetails = jest.fn();
    const handlePrimary = jest.fn();
    const handleMenu = jest.fn();

    await render(
      <DeviceCard
        device={activeDevice}
        onViewDetails={handleDetails}
        onPrimaryAction={handlePrimary}
        onOpenMenu={handleMenu}
      />
    );

    expect(screen.getByText('Lenovo ThinkPad T14')).toBeTruthy();
    expect(screen.getByText('Lenovo')).toBeTruthy();
    expect(screen.getByText('PF-2X99L1')).toBeTruthy();
    expect(screen.getByText('Bench Rig 04')).toBeTruthy();
    expect(screen.getByText('1 Active Repair (#SR-1001)')).toBeTruthy();
    expect(screen.getByText('Track Repair')).toBeTruthy();

    fireEvent.press(screen.getByText('View Details'));
    expect(handleDetails).toHaveBeenCalledWith(activeDevice);

    fireEvent.press(screen.getByText('Track Repair'));
    expect(handlePrimary).toHaveBeenCalledWith(activeDevice);
  });

  it('renders a healthy DeviceCard with request repair action', async () => {
    await render(
      <DeviceCard
        device={healthyDevice}
        onViewDetails={jest.fn()}
        onPrimaryAction={jest.fn()}
        onOpenMenu={jest.fn()}
      />
    );

    expect(screen.getByText('Apple MacBook Air M2')).toBeTruthy();
    expect(screen.getByText('No Active Repairs')).toBeTruthy();
    expect(screen.getByText('Request Repair')).toBeTruthy();
  });

  it('renders DeviceDetailsSheet and empty state', async () => {
    const handleEdit = jest.fn();
    const handleRemove = jest.fn();

    await render(
      <>
        <DeviceDetailsSheet
          device={activeDevice}
          onClose={jest.fn()}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
        <DevicesEmptyState />
      </>
    );

    expect(screen.getByText('Laptop System')).toBeTruthy();
    expect(screen.getByText('ThinkPad T14')).toBeTruthy();
    expect(screen.getByText('Service Record')).toBeTruthy();
    expect(screen.getByText('2 Completed, 1 Active')).toBeTruthy();
    expect(screen.getByText('No devices registered')).toBeTruthy();

    fireEvent.press(screen.getByText('Edit Details'));
    expect(handleEdit).toHaveBeenCalledWith(activeDevice);
  });
});
