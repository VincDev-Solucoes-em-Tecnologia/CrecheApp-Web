import type { ApiResponse } from 'src/network/api-response';
import type { UsuarioResponse, PagedUsuarioResponse } from 'src/models/user/usuario-response';

import { request } from 'src/network/api-service';
import { UsuarioSchema } from 'src/models/user/usuario-response';

export const getUsuarioInfo = async (): Promise<ApiResponse<UsuarioResponse>> => {
  const response = await request<UsuarioResponse>('GET', '/api/usuario/info');

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: UsuarioSchema.parse(response.data),
  };
};

export const getUsuarios = async (
  page: number,
  size: number,
  sort: string,
  sortDirection: string,
  tipo: string | null = null,
  filters: any | null = null
): Promise<ApiResponse<PagedUsuarioResponse>> => {
  const _sort = sort !== '' ? `&sort=${sort}` : '';
  const _sortDirection = sortDirection !== '' ? `&sortDirection=${sortDirection}` : '';
  const _type = tipo ? `&tipo=${tipo}` : '';
  const response = await request<PagedUsuarioResponse>(
    'POST',
    `api/usuario?page=${page}&size=${size}${_sort}${_sortDirection}${_type}`,
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

export const addUsuario = async (
  tipo: string,
  payload: any
): Promise<ApiResponse<UsuarioResponse>> => {
  const response = await request<UsuarioResponse>('POST', `api/usuario/${tipo}`, payload);

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data,
  };
};

export const updateUsuario = async (payload: any): Promise<ApiResponse<string>> => {
  const response = await request<string>('PUT', `api/usuario`, payload);

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data,
  };
};
