import type { ApiResponse } from 'src/network/api-response';
import type { DashboardResponse } from 'src/models/admin/dashboard-response';

import { request } from 'src/network/api-service';
import { DashboardResponseSchema } from 'src/models/admin/dashboard-response';

export const getDashboard = async (): Promise<ApiResponse<DashboardResponse>> => {
  const response = await request<DashboardResponse>('GET', '/api/admin/dashboard');

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: DashboardResponseSchema.parse(response.data),
  };
};
