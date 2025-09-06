// src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Optional: helper to set/update auth token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
