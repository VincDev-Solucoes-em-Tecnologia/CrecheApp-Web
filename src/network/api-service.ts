import type { AxiosInstance, AxiosResponse } from 'axios';

import axios from 'axios';

import { auth } from '../lib/firebase';
import { ApiException } from './api-response';

import type { ApiResponse, ProblemDetails } from './api-response';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:5299',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  await auth.authStateReady();

  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const request = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url: endpoint,
      data: body,
    });

    return { data: response.data, error: null, isSuccess: true };
  } catch (error: any) {
    const statusCode = error.response?.status || 0;
    const errorData = error.response?.data as ProblemDetails;

    const problem: ProblemDetails = {
      title: errorData?.title || 'Erro de conexão',
      detail: errorData?.detail || error.message,
    };

    return {
      data: null,
      error: new ApiException(statusCode, problem),
      isSuccess: false,
    };
  }
};
