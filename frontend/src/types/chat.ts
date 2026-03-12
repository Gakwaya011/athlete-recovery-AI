export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  profile_confirmed: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
}