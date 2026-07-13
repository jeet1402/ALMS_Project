import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api/' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Add this to handle expired tokens globally
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, log the user out
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;
