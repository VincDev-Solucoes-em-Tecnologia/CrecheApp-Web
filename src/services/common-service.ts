import type { ApiResponse } from 'src/network/api-response';

import { request } from 'src/network/api-service';

export const remover = async (path: string, id: string): Promise<ApiResponse<string>> => {
  const response = await request<string>('DELETE', `api/${path}/${id}`);

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data,
  };
};
