import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach auth token if available (foundation for Auth Module)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pet_rescue_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful response formatting
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

/**
 * Health check service
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
