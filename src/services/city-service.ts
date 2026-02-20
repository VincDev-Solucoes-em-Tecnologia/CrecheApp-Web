import type { ApiResponse } from 'src/network/api-response';
import type { CidadeResponse } from 'src/models/city/city-response';

import { request } from 'src/network/api-service';
import { CidadeSchema } from 'src/models/city/city-response';

const BASE_URL = '/api/cidade';

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

export const saveCidade = async (
  payload: Partial<CidadeResponse>
): Promise<ApiResponse<string>> => {
  const method = payload.id ? 'PUT' : 'POST';
  return await request<string>(method, BASE_URL, payload);
};

export const removerCidade = async (id: string): Promise<ApiResponse<void>> =>
  await request<void>('DELETE', `${BASE_URL}/${id}`);
