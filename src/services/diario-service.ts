import type { ApiResponse } from 'src/network/api-response';

import { request } from 'src/network/api-service';
import { DiarioSchema, type DiarioResponse } from 'src/models/diario/diario-response';

export const getDiarios = async (
  dataInicial: string,
  dataFinal: string,
  estudanteId: string
): Promise<ApiResponse<DiarioResponse[]>> => {
  const params = new URLSearchParams({
    dataInicial,
    dataFinal,
    ...(estudanteId && { estudanteId }),
  });

  const response = await request<DiarioResponse[]>(
    'GET',
    `/api/diario/diarios-estudante?${params.toString()}`
  );

  if (!response.isSuccess) {
    throw new Error(response.error.error.detail || 'Erro na requisição');
  }

  return {
    ...response,
    data: response.data?.map((u) => DiarioSchema.parse(u)) || [],
  };
};
