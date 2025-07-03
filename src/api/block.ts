import axios from 'axios';
import { Block } from '../models/block';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const getBlocksByDocument = async (
  documentId: number,
  from: string
): Promise<Block[]> => {
  const response = await api.get<Block[]>(`/block/${documentId}`, {
    params: { from },
  });
  return response.data;
};
