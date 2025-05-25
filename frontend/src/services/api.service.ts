import axios from 'axios';

// Create axios instance with base URL that uses the current host
const getBaseUrl = () => {
  // Get the current host (protocol + hostname + port)
  const host = window.location.origin;
  // Return the API URL using the current host
  return `${host}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
