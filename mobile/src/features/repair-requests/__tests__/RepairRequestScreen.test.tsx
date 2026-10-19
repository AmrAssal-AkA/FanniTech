import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RepairRequestScreen from '../../../app/(app)/RepairRequestScreen';
import { useGetDevices } from '../../devices';
import { useSubmitRepairRequest } from '../hooks/useSubmitRepairRequest';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useLocalSearchParams: () => ({
    deviceId: 'dev-1',
    deviceName: 'Lenovo ThinkPad T14',
  }),
}));

jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render }: any) =>
      render({
        field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' },
        fieldState: { error: null },
      }),
  };
});

jest.mock('../../devices', () => {
  const original = jest.requireActual('../../devices');
  return {
    ...original,
    useGetDevices: jest.fn(),
    RegisterDeviceSheet: () => null,
  };
});

jest.mock('../hooks/useSubmitRepairRequest', () => ({
  useSubmitRepairRequest: jest.fn(),
  MAX_REPAIR_REQUEST_IMAGES: 5,
}));

const renderWithProviders = async (component: React.ReactElement) => {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {component}
    </SafeAreaProvider>
  );
};

describe('RepairRequestScreen', () => {
  const mockDevices = [
    {
      id: 'dev-1',
      customerId: 'cust-1',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      deviceType: 'Laptop',
      serialNumber: 'PF-2X99L1',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'dev-2',
      customerId: 'cust-1',
      brand: 'Apple',
      model: 'MacBook Air M2',
      deviceType: 'Laptop',
      serialNumber: 'C02G45XYZ',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockSubmitWithDevice = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useGetDevices as jest.Mock).mockReturnValue({
      data: mockDevices,
      isLoading: false,
    });
  });

  it('renders header, stepper and sections matching design', async () => {
    (useSubmitRepairRequest as jest.Mock).mockReturnValue({
      form: {
        control: {},
        formState: { isValid: true, isSubmitted: false },
        setValue: jest.fn(),
        watch: jest.fn(() => ''),
      },
      pickedImages: [],
      pickImages: jest.fn(),
      removeImage: jest.fn(),
      submitWithDevice: mockSubmitWithDevice,
      isSubmitting: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    await renderWithProviders(<RepairRequestScreen />);

    expect(screen.getByText('Book Service')).toBeTruthy();
    expect(screen.getByText('Step 1 of 2')).toBeTruthy();
    expect(screen.getByText('Device & Problem Details')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();

    expect(screen.getByText('Select Registered Device')).toBeTruthy();
    expect(screen.getByText('Lenovo ThinkPad T14')).toBeTruthy();
    expect(screen.getByText('Apple MacBook Air M2')).toBeTruthy();
    expect(screen.getByText('+ Add a different device')).toBeTruthy();

    expect(screen.getByText('Primary Problem *')).toBeTruthy();
    expect(screen.getByText('Quick Select Common Issues')).toBeTruthy();
    expect(screen.getByText('Does not turn on')).toBeTruthy();
    expect(screen.getByText('Liquid spill')).toBeTruthy();

    expect(screen.getByText('Detailed Description *')).toBeTruthy();
    expect(screen.getByText('Drop-off Procedure')).toBeTruthy();
    expect(screen.getByText('Review & Submit Request')).toBeTruthy();
  });

  it('handles submitting request with selected device', async () => {
    (useSubmitRepairRequest as jest.Mock).mockReturnValue({
      form: {
        control: {},
        formState: { isValid: true, isSubmitted: false },
        setValue: jest.fn(),
        watch: jest.fn(() => ''),
      },
      pickedImages: [],
      pickImages: jest.fn(),
      removeImage: jest.fn(),
      submitWithDevice: mockSubmitWithDevice,
      isSubmitting: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });

    await renderWithProviders(<RepairRequestScreen />);

    const submitBtn = screen.getByText('Review & Submit Request');
    fireEvent.press(submitBtn);

    expect(mockSubmitWithDevice).toHaveBeenCalledWith('dev-1');
  });

  it('renders celebratory confirmation view when isSuccess is true', async () => {
    (useSubmitRepairRequest as jest.Mock).mockReturnValue({
      form: {
        control: {},
        formState: { isValid: true, isSubmitted: false },
        setValue: jest.fn(),
        watch: jest.fn(() => ''),
      },
      pickedImages: [],
      pickImages: jest.fn(),
      removeImage: jest.fn(),
      submitWithDevice: mockSubmitWithDevice,
      isSubmitting: false,
      isSuccess: true,
      submittedRequest: {
        id: 'req-real-123',
        deviceId: 'dev-1',
        problem: 'Overheating / Loud fan',
        description: 'Fan spinning fast and system throttles.',
        status: 'PENDING',
        createdAt: '2026-10-18T10:00:00.000Z',
        updatedAt: '2026-10-18T10:00:00.000Z',
      },
      error: null,
      reset: jest.fn(),
    });

    const rendered = await renderWithProviders(<RepairRequestScreen />);

    expect(rendered.getByText('Request Submitted')).toBeTruthy();
    expect(rendered.getByText('View All Repairs')).toBeTruthy();
    expect(rendered.getByText('Back to Devices')).toBeTruthy();
    expect(rendered.getAllByText('Track Repair').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to RepairTicketScreen when user clicks Track Repair button', async () => {
    const mockReset = jest.fn();
    (useSubmitRepairRequest as jest.Mock).mockReturnValue({
      form: {
        control: {},
        formState: { isValid: true, isSubmitted: false },
        setValue: jest.fn(),
        watch: jest.fn(() => ''),
      },
      pickedImages: [],
      pickImages: jest.fn(),
      removeImage: jest.fn(),
      submitWithDevice: mockSubmitWithDevice,
      isSubmitting: false,
      isSuccess: true,
      submittedRequest: {
        id: 'req-abc-999',
        deviceId: 'dev-1',
        problem: 'Random shut downs',
        description: 'Shuts down after 15 min.',
        status: 'PENDING',
        createdAt: '2026-10-18T10:00:00.000Z',
        updatedAt: '2026-10-18T10:00:00.000Z',
      },
      error: null,
      reset: mockReset,
    });

    const rendered = await renderWithProviders(<RepairRequestScreen />);

    const trackButtons = rendered.getAllByText('Track Repair');
    fireEvent.press(trackButtons[0]);

    expect(mockReset).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(app)/RepairTicketScreen',
      params: { requestId: 'req-abc-999' },
    });
  });
});
