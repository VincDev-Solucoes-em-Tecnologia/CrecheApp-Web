import type { ApiResponse } from 'src/network/api-response';

import { request } from 'src/network/api-service';
import { SalaSchema, type SalaResponse } from 'src/models/sala/sala-response';

const BASE_URL = '/api/sala';

export const getSalas = async (
  page: number,
  size: number,
  sort: string,
  sortDirection: string
): Promise<ApiResponse<SalaResponse[]>> => {
  const response = await request<SalaResponse[]>(
    'GET',
    `${BASE_URL}?page=${page}&size=${size}&sort=${sort}&sortDirection=${sortDirection}`
  );

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data?.map((u) => SalaSchema.parse(u)) || [],
  };
};

export const saveSala = async (payload: any): Promise<ApiResponse<string>> => {
  const method = payload.id ? 'PUT' : 'POST';
  const url = payload.id ? `${BASE_URL}` : `${BASE_URL}`;
  return await request<string>(method, url, payload);
};

export const removerSala = async (id: string): Promise<ApiResponse<void>> =>
  await request<void>('DELETE', `${BASE_URL}/${id}`);
