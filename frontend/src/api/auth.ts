import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export const loginUser = async (data: LoginData) => {
  const form = new FormData();
  form.append('username', data.email);
  form.append('password', data.password);
  const response = await axios.post(`${API_URL}/api/v1/auth/login`, form);
  return response.data;
};

export const registerUser = async (data: RegisterData) => {
  const response = await axios.post(`${API_URL}/api/v1/auth/register`, data);
  return response.data;
};