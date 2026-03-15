import axios from 'axios';
import { Message, ChatResponse } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mwili_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sendMessage = async (
  messages: Message[],
  sessionId?: number | null
): Promise<ChatResponse> => {
  const response = await api.post('/api/v1/chat', {
    messages,
    session_id: sessionId || null,
  });
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/api/v1/sessions');
  return response.data;
};

export const getSession = async (sessionId: number) => {
  const response = await api.get(`/api/v1/sessions/${sessionId}`);
  return response.data;
};

export const deleteSession = async (sessionId: number) => {
  const response = await api.delete(`/api/v1/sessions/${sessionId}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/api/v1/stats');
  return response.data;
};