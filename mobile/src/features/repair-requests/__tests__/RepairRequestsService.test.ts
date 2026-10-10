import { RepairRequestsService } from '../services/RepairRequestsService';
import { serverClient } from '../../../utils/serverClient';

jest.mock('../../../utils/serverClient', () => ({
  serverClient: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedClient = serverClient as jest.Mocked<typeof serverClient>;

describe('RepairRequestsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits a request without images', async () => {
    mockedClient.post.mockResolvedValue({ data: { id: 'request-1' } });

    await RepairRequestsService.submitRequest({
      deviceId: 'device-1',
      problem: 'Screen is damaged',
      description: 'The screen has stopped displaying an image.',
    });

    expect(mockedClient.post).toHaveBeenCalledWith(
      '/api/v1/repair-requests',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('appends selected images to the multipart request', async () => {
    mockedClient.post.mockResolvedValue({ data: { id: 'request-1' } });

    await RepairRequestsService.submitRequest({
      deviceId: 'device-1',
      problem: 'Broken hinge',
      description: 'The left hinge is loose and needs inspection.',
      images: [{ uri: 'file:///hinge.jpg', name: 'hinge.jpg', type: 'image/jpeg' }],
    });

    const form = mockedClient.post.mock.calls[0][1] as FormData;
    expect(form).toBeInstanceOf(FormData);
  });

  it('propagates forbidden-device errors', async () => {
    const error = new Error('FORBIDDEN_DEVICE_ACCESS');
    mockedClient.post.mockRejectedValue(error);

    await expect(
      RepairRequestsService.submitRequest({ deviceId: 'other-device', problem: 'Issue', description: 'A detailed issue description.' }),
    ).rejects.toBe(error);
  });

  it('lists requests with a status filter', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } } });

    await RepairRequestsService.listRequests({ status: 'PENDING' });

    expect(mockedClient.get).toHaveBeenCalledWith('/api/v1/repair-requests', { params: { status: 'PENDING' } });
  });

  it('cancels a repair request', async () => {
    mockedClient.patch.mockResolvedValue({ data: { id: 'request-1', status: 'CANCELLED' } });

    await RepairRequestsService.cancelRequest('request-1');

    expect(mockedClient.patch).toHaveBeenCalledWith('/api/v1/repair-requests/request-1/cancel');
  });
});
