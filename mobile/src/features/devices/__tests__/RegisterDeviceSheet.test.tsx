import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterDeviceSheet } from '../components/RegisterDeviceSheet';

const mockMutate = jest.fn();
const mockReset = jest.fn();

jest.mock('../hooks/useDevices', () => ({
  useRegisterDevice: () => ({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    error: null,
  }),
}));

describe('RegisterDeviceSheet', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockReset.mockReset();
  });

  it('renders the centered card popup when visible', async () => {
    await render(<RegisterDeviceSheet visible={true} onClose={jest.fn()} />);

    expect(screen.getByText('Add Broken Device')).toBeTruthy();
    expect(screen.getByText('Laptop')).toBeTruthy();
    expect(screen.getByLabelText('Device type input')).toBeTruthy();
    expect(screen.getByLabelText('Brand input')).toBeTruthy();
    expect(screen.getByLabelText('Model input')).toBeTruthy();
    expect(screen.getByLabelText('Serial number input')).toBeTruthy();
  });

  it('shows validation errors when submitting empty required fields', async () => {
    await render(<RegisterDeviceSheet visible={true} onClose={jest.fn()} />);

    await fireEvent.press(screen.getByLabelText('Add broken device'));

    await waitFor(() => {
      expect(screen.getByText('Device type is required')).toBeTruthy();
      expect(screen.getByText('Brand is required')).toBeTruthy();
      expect(screen.getByText('Model is required')).toBeTruthy();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('selects preset device type and submits trimmed values', async () => {
    const onClose = jest.fn();
    mockMutate.mockImplementation((_input, options) => {
      options?.onSuccess?.();
    });

    await render(<RegisterDeviceSheet visible={true} onClose={onClose} />);

    await fireEvent.press(screen.getByLabelText('Select Laptop device type'));
    await fireEvent.changeText(screen.getByLabelText('Brand input'), '  Apple ');
    await fireEvent.changeText(screen.getByLabelText('Model input'), ' MacBook Pro 14 ');
    await fireEvent.changeText(screen.getByLabelText('Serial number input'), ' C02XYZ ');

    await fireEvent.press(screen.getByLabelText('Add broken device'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          deviceType: 'Laptop',
          brand: 'Apple',
          model: 'MacBook Pro 14',
          serialNumber: 'C02XYZ',
        },
        expect.any(Object),
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('omits serialNumber when left blank', async () => {
    await render(<RegisterDeviceSheet visible={true} onClose={jest.fn()} />);

    await fireEvent.press(screen.getByLabelText('Select Smartphone device type'));
    await fireEvent.changeText(screen.getByLabelText('Brand input'), 'Samsung');
    await fireEvent.changeText(screen.getByLabelText('Model input'), 'Galaxy S24');

    await fireEvent(screen.getByLabelText('Serial number input'), 'submitEditing');

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          deviceType: 'Smartphone',
          brand: 'Samsung',
          model: 'Galaxy S24',
        },
        expect.any(Object),
      );
    });
  });
});
