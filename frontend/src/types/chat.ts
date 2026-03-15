export interface Message {
  role:    'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply:             string;
  profile_confirmed: boolean;
  session_id?:       number;
}

export interface SessionOut {
  id:              number;
  title:           string;
  sport:           string;
  duration_mins:   number;
  intensity:       string;
  goal:            string;
  weight_kg:       number;
  carbs_g:         number;
  protein_g:       number;
  calories_burned: number;
  created_at:      string;
}

export interface SessionDetail extends SessionOut {
  messages: Message[];
}

export interface StatsData {
  sessions: {
    id:              number;
    date:            string;
    sport:           string;
    duration_mins:   number;
    calories_burned: number;
    carbs_g:         number;
    protein_g:       number;
    goal:            string;
  }[];
  total_sessions:  number;
  total_calories:  number;
  avg_calories:    number;
}
export interface User {
  id:        number;
  email:     string;
  full_name: string;
}
export interface User {
  id:        number;
  email:     string;
  full_name: string;
}
