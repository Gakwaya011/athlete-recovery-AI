import axios from 'axios';
import { Message, ChatResponse } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mwili_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sendMessage = async (messages: Message[]): Promise<ChatResponse> => {
  const response = await api.post('/api/v1/chat', { messages });
  return response.data;
};