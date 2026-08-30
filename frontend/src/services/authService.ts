import apiClient from './api';
import { LoginCredentials, AuthState } from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await apiClient.post<ApiResponse<any>>('/auth/login', credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get<ApiResponse<any>>('/auth/me');
  return response.data;
};

