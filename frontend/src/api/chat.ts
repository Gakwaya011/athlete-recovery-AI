import axios from 'axios';
import { Message, ChatResponse } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const sendMessage = async (messages: Message[]): Promise<ChatResponse> => {
  const response = await axios.post(`${API_URL}/api/v1/chat`, { messages });
  return response.data;
};