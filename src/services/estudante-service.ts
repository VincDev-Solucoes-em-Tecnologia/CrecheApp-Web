import type { ApiResponse } from 'src/network/api-response';
import type { PagedEstudanteResponse } from 'src/models/estudante/estudante-reponse';

import { request, requestPOSTOrPUTForm } from 'src/network/api-service';

const BASE_URL = '/api/estudante';

export const getEstudantes = async (
  page: number,
  size: number,
  sort: string,
  sortDirection: string,
  filters: any | null = null
): Promise<ApiResponse<PagedEstudanteResponse>> => {
  const _sort = sort !== '' ? `&sort=${sort}` : '';
  const _sortDirection = sortDirection !== '' ? `&sortDirection=${sortDirection}` : '';
  const response = await request<PagedEstudanteResponse>(
    'POST',
    `${BASE_URL}/all/?page=${page}&size=${size}${_sort}${_sortDirection}`,
    filters
  );

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data,
  };
};

export const saveEstudante = async (payload: any): Promise<ApiResponse<string>> => {
  const method = payload.id ? 'PUT' : 'POST';
  return await request<string>(method, BASE_URL, payload);
};

export const saveEstudanteForm = async (
  payload: any,
  isEditing: boolean
): Promise<ApiResponse<string>> => {
  const method = isEditing ? 'PUT' : 'POST';
  return await requestPOSTOrPUTForm<string>(method, BASE_URL, payload);
};

export const removerEstudante = async (id: string): Promise<ApiResponse<void>> =>
  await request<void>('DELETE', `${BASE_URL}/${id}`);
