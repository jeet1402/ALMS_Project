import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');

      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}token/refresh/`, { refresh });
          localStorage.setItem('access', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return API(original); // retry the original request with the fresh token
        } catch (refreshError) {
          // refresh token itself is invalid/expired — fall through to logout
        }
      }

      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/'; // no dedicated /login route exists in this SPA
    }

    return Promise.reject(error);
  }
);

export default API;
