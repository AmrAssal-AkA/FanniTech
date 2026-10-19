import { serverClient } from '../../../utils/serverClient';
import { PaginatedResponse } from '../../../types/api';
import { ApiRepairRequest, RepairRequestsQuery, SubmitRepairRequestInput } from '../types';

function unwrapRequest(
  payload: { data?: ApiRepairRequest } | ApiRepairRequest
): ApiRepairRequest {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    return payload.data;
  }
  return payload as ApiRepairRequest;
}

export const RepairRequestsService = {
  submitRequest: async (input: SubmitRepairRequestInput): Promise<ApiRepairRequest> => {
    const form = new FormData();
    form.append('deviceId', input.deviceId);
    form.append('problem', input.problem);
    form.append('description', input.description);
    input.images?.forEach((image) => {
      form.append('images', { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
    });

    const response = await serverClient.post<{ data?: ApiRepairRequest } | ApiRepairRequest>(
      '/api/v1/repair-requests',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return unwrapRequest(response.data);
  },

  listRequests: (query: RepairRequestsQuery = {}) =>
    serverClient
      .get<PaginatedResponse<ApiRepairRequest>>('/api/v1/repair-requests', { params: query })
      .then((response) => response.data),

  getRequestById: (requestId: string): Promise<ApiRepairRequest> =>
    serverClient
      .get<{ data?: ApiRepairRequest } | ApiRepairRequest>(`/api/v1/repair-requests/${requestId}`)
      .then((response) => unwrapRequest(response.data)),

  cancelRequest: (requestId: string): Promise<ApiRepairRequest> =>
    serverClient
      .patch<{ data?: ApiRepairRequest } | ApiRepairRequest>(`/api/v1/repair-requests/${requestId}/cancel`)
      .then((response) => unwrapRequest(response.data)),
};
