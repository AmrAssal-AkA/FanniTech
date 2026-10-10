import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import {
  DeviceCard,
  DeviceDetailsSheet,
  DevicesEmptyState,
  DevicesHeader,
  RegisterDeviceButton,
} from '../components';
import { DeviceWithRepairState } from '../types';

const activeDevice: DeviceWithRepairState = {
  id: 'dev-1',
  customerId: 'customer-1',
  deviceType: 'Laptop',
  brand: 'Lenovo',
  model: 'ThinkPad T14',
  serialNumber: 'PF-2X99L1',
  repairState: 'ACTIVE_REPAIR',
  createdAt: '2023-03-14T00:00:00.000Z',
  updatedAt: '2023-03-14T00:00:00.000Z',
};

const healthyDevice: DeviceWithRepairState = {
  id: 'dev-2',
  customerId: 'customer-1',
  deviceType: 'Laptop',
  brand: 'Apple',
  model: 'MacBook Air M2',
  serialNumber: 'C02G4591MD6R',
  repairState: 'NO_REPAIRS',
  createdAt: '2024-01-10T00:00:00.000Z',
  updatedAt: '2024-01-10T00:00:00.000Z',
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

    const rendered = await render(
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
    expect(screen.getByText('In service')).toBeTruthy();
    expect(screen.getByText('Active repair')).toBeTruthy();
    expect(screen.getByText('Track Repair')).toBeTruthy();

    fireEvent.press(screen.getByText('View Details'));
    expect(handleDetails).toHaveBeenCalledWith(activeDevice);

    fireEvent.press(screen.getByText('Track Repair'));
    expect(handlePrimary).toHaveBeenCalledWith(activeDevice);
  });

  it('renders a healthy DeviceCard with request repair action', async () => {
    const rendered = await render(
      <DeviceCard
        device={healthyDevice}
        onViewDetails={jest.fn()}
        onPrimaryAction={jest.fn()}
        onOpenMenu={jest.fn()}
      />
    );

    expect(rendered.getByText('Apple MacBook Air M2')).toBeTruthy();
    expect(rendered.getByText('No active repairs')).toBeTruthy();
    expect(rendered.getByText('Request Repair')).toBeTruthy();
  });

  it('renders DeviceDetailsSheet and empty state', async () => {
    const handleEdit = jest.fn();
    const handleRemove = jest.fn();

    const rendered = await render(
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

    await waitFor(() => expect(rendered.getByText('Laptop System')).toBeTruthy());
    expect(rendered.getByText('ThinkPad T14')).toBeTruthy();
    expect(rendered.getByText('Service Record')).toBeTruthy();
    expect(rendered.getByText('Active repair')).toBeTruthy();
    expect(rendered.getByText('No devices registered')).toBeTruthy();

    fireEvent.press(rendered.getByText('Edit Details'));
    expect(handleEdit).toHaveBeenCalledWith(activeDevice);
  });
});
