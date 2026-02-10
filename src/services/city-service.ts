import type { ApiResponse } from 'src/network/api-response';
import type { CidadeResponse } from 'src/models/city/city-response';

import { request } from 'src/network/api-service';
import { CidadeSchema } from 'src/models/city/city-response';

export const getCities = async (): Promise<ApiResponse<CidadeResponse[]>> => {
  const response = await request<CidadeResponse[]>('GET', '/api/cidade');

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data.map((u) => CidadeSchema.parse(u)),
  };
};
